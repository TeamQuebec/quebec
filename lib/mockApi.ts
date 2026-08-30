import { BUSINESSES, BUSINESS_BY_ID } from "@/lib/mockData/businesses";
import { buildSeedIdentities, DEMO_IDENTITY_REFERENCE } from "@/lib/mockData/users";
import { CHECK_BY_ID, scopeSummary } from "@/lib/checks";
import { daysAgo, minutesAgo, nowIso } from "@/lib/format";
import {
  generateInternalId,
  generateUniqueId,
  generateVerificationId,
  mulberry32,
  normalizeReference,
  pseudoHash,
} from "@/lib/refs";
import type {
  AccessLogEntry,
  Business,
  CheckAnswer,
  CheckId,
  CheckResult,
  EnrollInput,
  Grant,
  Identity,
  LogType,
  Store,
  Verdict,
  Verification,
  VerifyInput,
} from "@/lib/types";

/**
 * MOCK API — the only place "backend" behaviour lives in Phase 1.
 * -----------------------------------------------------------------
 * Everything reads/writes an in-memory store persisted to localStorage so a
 * full demo story survives refreshes. Signatures mirror the future backend, so
 * Phase 2 replaces the bodies with Supabase calls (auth, encrypted KYC storage,
 * real verification, audit log) without touching the UI.
 */

const STORAGE_KEY = "qbc.mock.store.v1";

/** Artificial latency so the UI's loading states read as real. */
function delay(ms = 320): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

let cached: Store | null = null;

function freshSeed(): Store {
  const identities = buildSeedIdentities();
  const demo = identities.find((i) => i.uniqueId === DEMO_IDENTITY_REFERENCE) ?? identities[0];
  const activeBusinessId = "biz_safebank";

  const grants: Grant[] = [];
  const verifications: Verification[] = [];
  const accessLog: AccessLogEntry[] = [];

  // ---- Curated history for the demo identity (Adaeze / QBC-8X92-1F) ----
  const d = demo.id;
  grants.push(
    { id: "grant_demo_safebank", identityId: d, businessId: "biz_safebank", status: "granted", scopes: ["over_18"], requestedAt: daysAgo(6), grantedAt: daysAgo(6) },
    { id: "grant_demo_smiletrust", identityId: d, businessId: "biz_smiletrust", status: "granted", scopes: ["name_matches"], requestedAt: daysAgo(3), grantedAt: daysAgo(3) },
    { id: "grant_demo_paycycle", identityId: d, businessId: "biz_paycycle", status: "requested", scopes: ["nin_matches"], requestedAt: minutesAgo(5 * 60) }
  );

  const mkVerification = (over: {
    identity: Identity;
    businessId: string;
    checks: CheckResult[];
    verdict: Verdict;
    requestedAt: string;
    note: string;
  }): Verification => {
    const id = generateVerificationId();
    const v: Verification = {
      id,
      identityId: over.identity.id,
      identityReference: over.identity.uniqueId,
      businessId: over.businessId,
      checks: over.checks,
      verdict: over.verdict,
      requestedAt: over.requestedAt,
      note: over.note,
      hash: pseudoHash(
        JSON.stringify([id, over.identity.uniqueId, over.businessId, over.checks, over.requestedAt])
      ),
    };
    verifications.push(v);
    return v;
  };

  const vfy1 = mkVerification({
    identity: demo,
    businessId: "biz_safebank",
    checks: [{ checkId: "over_18", answer: "yes", note: "Holder is 18 or older." }],
    verdict: "yes",
    requestedAt: daysAgo(2),
    note: "All requested facts were confirmed.",
  });
  const vfy2 = mkVerification({
    identity: demo,
    businessId: "biz_smiletrust",
    checks: [{ checkId: "name_matches", answer: "yes", note: "Name matches the verified record." }],
    verdict: "yes",
    requestedAt: daysAgo(1),
    note: "All requested facts were confirmed.",
  });

  const log = (over: {
    identityId: string;
    businessId: string | null;
    type: LogType;
    message: string;
    at: string;
    verificationId?: string;
  }) => accessLog.push({ id: generateInternalId("log"), ...over });

  log({ identityId: d, businessId: "biz_paycycle", type: "grant", message: "PayCycle Ltd requested access to verify your NIN.", at: minutesAgo(5 * 60) });
  log({ identityId: d, businessId: "biz_smiletrust", type: "check", message: "SmileTrust verified Name matches?", at: daysAgo(1), verificationId: vfy2.id });
  log({ identityId: d, businessId: "biz_safebank", type: "check", message: "SafeBank NG verified Is over 18?", at: daysAgo(2), verificationId: vfy1.id });
  log({ identityId: d, businessId: "biz_smiletrust", type: "grant", message: "SmileTrust was granted access.", at: daysAgo(3) });
  log({ identityId: d, businessId: "biz_safebank", type: "grant", message: "SafeBank NG was granted access.", at: daysAgo(6) });

  // ---- Deterministically populate the rest of the dataset ----
  const rng = mulberry32(20260830);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
  const businessPool = BUSINESSES.filter((b) => b.id !== "biz_safebank");

  for (const identity of identities) {
    if (identity.id === demo.id) continue;
    const count = Math.floor(rng() * 3); // 0..2 linked businesses
    for (let g = 0; g < count; g++) {
      const biz = pick(businessPool);
      const exists = grants.some((gr) => gr.identityId === identity.id && gr.businessId === biz.id);
      if (exists) continue;

      const roll = rng();
      const scopes: CheckId[] = ["over_18", "name_matches", "nin_matches", "has_verified_identity"].filter(
        (_, i) => rng() > 0.5
      ) as CheckId[];
      if (scopes.length === 0) scopes.push("over_18");

      const requestedAt = daysAgo(1 + Math.floor(rng() * 12));

      if (roll < 0.68) {
        // granted
        grants.push({ id: generateInternalId("grant"), identityId: identity.id, businessId: biz.id, status: "granted", scopes, requestedAt, grantedAt: daysAgo(Math.floor(rng() * 9)) });
        const answers = computeAnswers(identity, scopes);
        const verdict = verdictOf(answers);
        const vfy = mkVerification({
          identity,
          businessId: biz.id,
          checks: answers,
          verdict,
          requestedAt: daysAgo(Math.floor(rng() * 3)),
          note: verdictNote(verdict),
        });
        log({ identityId: identity.id, businessId: biz.id, type: "check", message: `${biz.name} verified ${scopeSummary(scopes)}?`, at: vfy.requestedAt, verificationId: vfy.id });
        log({ identityId: identity.id, businessId: biz.id, type: "grant", message: `${biz.name} was granted access.`, at: requestedAt });
      } else if (roll < 0.88) {
        // requested
        grants.push({ id: generateInternalId("grant"), identityId: identity.id, businessId: biz.id, status: "requested", scopes, requestedAt });
        log({ identityId: identity.id, businessId: biz.id, type: "grant", message: `${biz.name} requested access to verify ${scopeSummary(scopes).toLowerCase()}.`, at: requestedAt });
      } else {
        // revoked
        const grantedAt = daysAgo(2 + Math.floor(rng() * 8));
        const revokedAt = daysAgo(Math.floor(rng() * 2));
        grants.push({ id: generateInternalId("grant"), identityId: identity.id, businessId: biz.id, status: "revoked", scopes, requestedAt, grantedAt, revokedAt });
        log({ identityId: identity.id, businessId: biz.id, type: "grant", message: `${biz.name} was granted access.`, at: grantedAt });
        log({ identityId: identity.id, businessId: biz.id, type: "revoke", message: `You revoked ${biz.name}'s access.`, at: revokedAt });
      }
    }
  }

  return {
    identities,
    businesses: BUSINESSES,
    grants,
    accessLog,
    verifications,
    activeIdentityId: demo.id,
    activeBusinessId,
  };
}

function loadStore(): Store {
  if (cached) return cached;
  if (typeof window === "undefined") return freshSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Store;
      if (Array.isArray(parsed.identities) && parsed.identities.length > 0 && Array.isArray(parsed.grants)) {
        cached = parsed;
        return cached;
      }
    }
  } catch {
    // corrupted storage → reseed
  }
  cached = freshSeed();
  saveStore(cached);
  return cached;
}

function saveStore(s: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // storage full / unavailable — demo keeps working in memory
  }
}

/** Deep-ish clone via JSON so React sees a fresh snapshot. */
function snapshot(s: Store): Store {
  return JSON.parse(JSON.stringify(s)) as Store;
}

// ---------------------------------------------------------------------------
// Public API (mirrors the future backend surface)
// ---------------------------------------------------------------------------

export async function loadStoreApi(): Promise<Store> {
  await delay(120);
  return snapshot(loadStore());
}

export async function resetDemoApi(): Promise<Store> {
  cached = freshSeed();
  saveStore(cached);
  await delay(150);
  return snapshot(cached);
}

export async function enrollIdentityApi(input: EnrollInput): Promise<{ store: Store; identity: Identity }> {
  await delay(850); // the "registration" feel
  const store = loadStore();
  const identity: Identity = {
    id: generateInternalId("id"),
    uniqueId: generateUniqueId(),
    name: input.name.trim(),
    dob: input.dob,
    nin: input.nin.replace(/\D/g, "").slice(0, 11),
    kycStatus: "self_asserted",
    createdAt: nowIso(),
  };
  store.identities.push(identity);
  store.activeIdentityId = identity.id;
  store.accessLog.push({
    id: generateInternalId("log"),
    identityId: identity.id,
    businessId: null,
    type: "enroll",
    message: "You created your Quebec reference. It's the only thing you'll ever share.",
    at: nowIso(),
  });
  saveStore(store);
  return { store: snapshot(store), identity };
}

export async function verifyReferenceApi(input: VerifyInput): Promise<{ store: Store; verification: Verification }> {
  await delay(600); // verification "round-trip"
  const store = loadStore();
  const ref = normalizeReference(input.reference);
  const checks = input.checks;
  const businessId = store.activeBusinessId;

  const identity = store.identities.find((i) => normalizeReference(i.uniqueId) === ref) ?? null;

  const build = (over: {
    verdict: Verdict;
    checkResults: CheckResult[];
    note: string;
    identityRef: string | null;
  }): Verification => {
    const id = generateVerificationId();
    const v: Verification = {
      id,
      identityId: identity?.id ?? null,
      identityReference: over.identityRef,
      businessId,
      checks: over.checkResults,
      verdict: over.verdict,
      requestedAt: nowIso(),
      note: over.note,
      hash: pseudoHash(JSON.stringify([id, over.identityRef, businessId, over.checkResults, nowIso()])),
    };
    store.verifications.push(v);
    return v;
  };

  // 1) Reference not found
  if (!identity) {
    const v = build({
      verdict: "no_match",
      checkResults: checks.map((c) => ({ checkId: c, answer: "unable" as CheckAnswer, note: "Reference not found in the registry." })),
      note: "No identity matched this reference.",
      identityRef: ref,
    });
    saveStore(store);
    return { store: snapshot(store), verification: v };
  }

  const grant = store.grants.find((gr) => gr.identityId === identity.id && gr.businessId === businessId);

  // 2) Access revoked or a pending request not yet approved
  if (grant && (grant.status === "revoked" || grant.status === "requested")) {
    const revoked = grant.status === "revoked";
    const v = build({
      verdict: revoked ? "revoked" : "pending",
      checkResults: checks.map((c) => ({ checkId: c, answer: "unable" as CheckAnswer, note: revoked ? "Access was revoked by the identity holder." : "This business has not been granted access." })),
      note: revoked ? "The identity holder revoked access to this business." : "This business has not been granted access by the holder.",
      identityRef: identity.uniqueId,
    });
    saveStore(store);
    return { store: snapshot(store), verification: v };
  }

  // 3) First check ⇒ sharing the reference is consent; record the grant
  if (!grant) {
    store.grants.push({
      id: generateInternalId("grant"),
      identityId: identity.id,
      businessId,
      status: "granted",
      scopes: checks,
      requestedAt: nowIso(),
      grantedAt: nowIso(),
    });
    store.accessLog.push({
      id: generateInternalId("log"),
      identityId: identity.id,
      businessId,
      type: "grant",
      message: `${businessName(businessId)} was granted access to verify facts against your reference.`,
      at: nowIso(),
    });
  } else {
    // union any newly requested scopes into the grant
    grant.scopes = Array.from(new Set([...grant.scopes, ...checks]));
  }

  const answers = computeAnswers(identity, checks);
  const verdict = verdictOf(answers);
  const v = build({ verdict, checkResults: answers, note: verdictNote(verdict), identityRef: identity.uniqueId });

  store.accessLog.push({
    id: generateInternalId("log"),
    identityId: identity.id,
    businessId,
    type: "check",
    message: `${businessName(businessId)} verified ${scopeSummary(checks)}?`,
    at: nowIso(),
    verificationId: v.id,
  });

  saveStore(store);
  return { store: snapshot(store), verification: v };
}

export async function revokeGrantApi(grantId: string): Promise<Store> {
  await delay(200);
  const store = loadStore();
  const grant = store.grants.find((g) => g.id === grantId);
  if (grant) {
    grant.status = "revoked";
    grant.revokedAt = nowIso();
    store.accessLog.push({
      id: generateInternalId("log"),
      identityId: grant.identityId,
      businessId: grant.businessId,
      type: "revoke",
      message: `You revoked ${businessName(grant.businessId)}'s access.`,
      at: nowIso(),
    });
    saveStore(store);
  }
  return snapshot(store);
}

export async function approveGrantApi(grantId: string): Promise<Store> {
  await delay(200);
  const store = loadStore();
  const grant = store.grants.find((g) => g.id === grantId);
  if (grant) {
    grant.status = "granted";
    grant.grantedAt = nowIso();
    store.accessLog.push({
      id: generateInternalId("log"),
      identityId: grant.identityId,
      businessId: grant.businessId,
      type: "approve",
      message: `You approved ${businessName(grant.businessId)}'s access request.`,
      at: nowIso(),
    });
    saveStore(store);
  }
  return snapshot(store);
}

export async function denyGrantApi(grantId: string): Promise<Store> {
  await delay(200);
  const store = loadStore();
  const idx = store.grants.findIndex((g) => g.id === grantId);
  if (idx >= 0) {
    const [grant] = store.grants.splice(idx, 1);
    store.accessLog.push({
      id: generateInternalId("log"),
      identityId: grant.identityId,
      businessId: grant.businessId,
      type: "deny",
      message: `You declined ${businessName(grant.businessId)}'s access request.`,
      at: nowIso(),
    });
    saveStore(store);
  }
  return snapshot(store);
}

export async function restoreGrantApi(grantId: string): Promise<Store> {
  await delay(200);
  const store = loadStore();
  const grant = store.grants.find((g) => g.id === grantId);
  if (grant) {
    grant.status = "granted";
    grant.grantedAt = nowIso();
    store.accessLog.push({
      id: generateInternalId("log"),
      identityId: grant.identityId,
      businessId: grant.businessId,
      type: "grant",
      message: `You allowed ${businessName(grant.businessId)} to verify facts again.`,
      at: nowIso(),
    });
    saveStore(store);
  }
  return snapshot(store);
}

export async function setActiveIdentityApi(identityId: string): Promise<Store> {
  await delay(60);
  const store = loadStore();
  if (store.identities.some((i) => i.id === identityId)) {
    store.activeIdentityId = identityId;
    saveStore(store);
  }
  return snapshot(store);
}

export async function getVerificationApi(id: string): Promise<Verification | null> {
  await delay(60);
  const store = loadStore();
  return store.verifications.find((v) => v.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Helpers (kept internal — these are exactly what Phase 2 signs with a key)
// ---------------------------------------------------------------------------

export function computeAnswers(identity: Identity, checks: CheckId[]): CheckResult[] {
  return checks.map((checkId) => {
    switch (checkId) {
      case "over_18": {
        const age = ageOf(identity.dob);
        return {
          checkId,
          answer: age >= 18 ? "yes" : "no",
          note: age >= 18 ? "Holder is 18 or older." : `Holder is under 18.`,
        };
      }
      case "name_matches":
        return identity.kycStatus === "verified"
          ? { checkId, answer: "yes", note: "Name matches the verified record." }
          : { checkId, answer: "unable", note: "This record has not been independently verified yet." };
      case "nin_matches":
        return identity.kycStatus === "verified"
          ? { checkId, answer: "yes", note: "NIN matches the verified record." }
          : { checkId, answer: "unable", note: "This record has not been linked to the national registry yet." };
      case "has_verified_identity":
        return identity.kycStatus === "verified"
          ? { checkId, answer: "yes", note: "A document-verified identity is on file." }
          : { checkId, answer: "unable", note: "No document-verified identity is on file." };
    }
  });
}

export function verdictOf(answers: CheckResult[]): Verdict {
  if (answers.some((a) => a.answer === "no")) return "no";
  if (answers.some((a) => a.answer === "unable")) return "unconfirmed";
  return "yes";
}

export function verdictNote(verdict: Verdict): string {
  switch (verdict) {
    case "yes":
      return "All requested facts were confirmed.";
    case "no":
      return "One or more requested facts returned NO.";
    case "unconfirmed":
      return "One or more requested facts could not be independently confirmed.";
    case "revoked":
      return "The identity holder revoked access to this business.";
    case "pending":
      return "This business has not been granted access by the holder.";
    case "no_match":
      return "No identity matched this reference.";
  }
}

function ageOf(dob: string): number {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return -1;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

export function businessById(id: string): Business {
  return BUSINESS_BY_ID[id];
}

export function businessName(id: string): string {
  return BUSINESS_BY_ID[id]?.name ?? "A business";
}

export { CHECK_BY_ID, scopeSummary };
