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
import {
  VaultUnavailableError,
  isSealed,
  openJson,
  sealJson,
  signPayload,
  verifyPayload,
  vaultIdentity,
  type ReceiptSignature,
  type VerifyResult,
} from "@/lib/vault";
import type {
  AccessLogEntry,
  BiometricKind,
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
 * MOCK API — the only place "backend" behaviour lives.
 * ----------------------------------------------------
 * Everything reads/writes an in-memory store. In the browser that store is
 * sealed with AES-GCM (lib/vault.ts) before it is written to localStorage, so
 * what sits at rest is ciphertext, and every Verification carries a real ECDSA
 * signature over a canonical payload rather than a look-alike hash.
 *
 * The exported function signatures still mirror the shape a real backend would
 * have, so swapping the bodies for network calls stays a single-file change.
 */

/** Sealed (AES-GCM) store. */
const STORAGE_KEY = "qbc.mock.store.v2";
/** Pre-encryption plaintext store, migrated on first load. */
const LEGACY_STORAGE_KEY = "qbc.mock.store.v1";

/** In-memory memo of the vault's signing key fingerprint. */
let vaultKeyId: string | null = null;

/** Artificial latency so the UI's loading states read as real. */
function delay(ms = 320): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

let cached: Store | null = null;
/** In-flight first load, so two callers cannot seed two different stores. */
let pending: Promise<Store> | null = null;

/**
 * The exact bytes a receipt commits to. Signing and verification BOTH go through
 * this one function, so a receipt re-check can never drift from what was signed.
 * `note` is deliberately included: editing the human-readable explanation breaks
 * the signature just as editing the verdict does.
 */
export function receiptPayload(v: {
  id: string;
  identityReference: string | null;
  businessId: string;
  checks: CheckResult[];
  verdict: Verdict;
  requestedAt: string;
}) {
  return {
    id: v.id,
    identityReference: v.identityReference,
    businessId: v.businessId,
    checks: v.checks,
    verdict: v.verdict,
    requestedAt: v.requestedAt,
  };
}

/**
 * Sign a receipt. If WebCrypto is unavailable we do NOT fake a signature — the
 * receipt is stored unsigned, and the UI says so.
 */
async function signReceipt(
  payload: unknown
): Promise<{ hash: string; signature: string | null; keyId: string | null }> {
  try {
    const sig: ReceiptSignature = await signPayload(payload);
    vaultKeyId = sig.keyId;
    return { hash: sig.hash, signature: sig.signature, keyId: sig.keyId };
  } catch (err) {
    if (!(err instanceof VaultUnavailableError)) throw err;
    return { hash: pseudoHash(JSON.stringify(payload)), signature: null, keyId: null };
  }
}

/**
 * Which biometric a seeded holder enrolled.
 *
 * Derived from position rather than drawn at random, so the same record shows
 * the same thing on every reseed — a demo where Adaeze's biometric changes each
 * time you reset is a demo that looks broken. Every fourth record has none, so
 * "not enrolled" exists in the seeded data and not only in records you create.
 */
function seedBiometric(index: number): BiometricKind | null {
  if (index % 4 === 3) return null;
  return index % 2 === 0 ? "fingerprint" : "face";
}

async function freshSeed(): Promise<Store> {
  const identities: Identity[] = buildSeedIdentities().map((u, i) => ({
    ...u,
    biometric: seedBiometric(i),
  }));
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
    { id: "grant_demo_paycycle", identityId: d, businessId: "biz_paycycle", status: "requested", scopes: ["nin_matches"], requestedAt: minutesAgo(5 * 60) },
    { id: "grant_demo_quickmart", identityId: d, businessId: "biz_quickmart", status: "revoked", scopes: ["over_18", "name_matches"], requestedAt: daysAgo(14), grantedAt: daysAgo(14), revokedAt: daysAgo(2) }
  );

  const mkVerification = async (over: {
    identity: Identity;
    businessId: string;
    checks: CheckResult[];
    verdict: Verdict;
    requestedAt: string;
    note: string;
  }): Promise<Verification> => {
    const id = generateVerificationId();
    const payload = receiptPayload({
      id,
      identityReference: over.identity.uniqueId,
      businessId: over.businessId,
      checks: over.checks,
      verdict: over.verdict,
      requestedAt: over.requestedAt,
    });
    const signed = await signReceipt(payload);
    const v: Verification = {
      id,
      identityId: over.identity.id,
      identityReference: over.identity.uniqueId,
      businessId: over.businessId,
      checks: over.checks,
      verdict: over.verdict,
      requestedAt: over.requestedAt,
      note: over.note,
      ...signed,
    };
    verifications.push(v);
    return v;
  };

  const vfy1 = await mkVerification({
    identity: demo,
    businessId: "biz_safebank",
    checks: [{ checkId: "over_18", answer: "yes", note: "Holder is 18 or older." }],
    verdict: "yes",
    requestedAt: daysAgo(2),
    note: "All requested facts were confirmed.",
  });
  const vfy2 = await mkVerification({
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
  log({ identityId: d, businessId: "biz_quickmart", type: "grant", message: "QuickMart was granted access.", at: daysAgo(14) });
  log({ identityId: d, businessId: "biz_quickmart", type: "revoke", message: "You revoked QuickMart's access.", at: daysAgo(2) });

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
        () => rng() > 0.5
      ) as CheckId[];
      if (scopes.length === 0) scopes.push("over_18");

      // Timestamps run forwards: request, then grant, then any checks. The old
      // version drew each date independently, so a check could be dated before
      // the grant that allowed it — the kind of detail that makes a demo's audit
      // trail read as fake.
      const reqDays = 6 + Math.floor(rng() * 20);
      const requestedAt = daysAgo(reqDays);
      const grantedDays = Math.max(1, reqDays - (1 + Math.floor(rng() * 5)));

      if (roll < 0.68) {
        // granted
        const grantedAt = daysAgo(grantedDays);
        grants.push({ id: generateInternalId("grant"), identityId: identity.id, businessId: biz.id, status: "granted", scopes, requestedAt, grantedAt });
        const answers = computeAnswers(identity, scopes);
        const verdict = verdictOf(answers);
        const vfy = await mkVerification({
          identity,
          businessId: biz.id,
          checks: answers,
          verdict,
          requestedAt: daysAgo(Math.max(0, grantedDays - (1 + Math.floor(rng() * 3)))),
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
        const grantedAt = daysAgo(grantedDays);
        const revokedAt = daysAgo(Math.max(0, grantedDays - (1 + Math.floor(rng() * 3))));
        grants.push({ id: generateInternalId("grant"), identityId: identity.id, businessId: biz.id, status: "revoked", scopes, requestedAt, grantedAt, revokedAt });
        log({ identityId: identity.id, businessId: biz.id, type: "grant", message: `${biz.name} was granted access.`, at: grantedAt });
        log({ identityId: identity.id, businessId: biz.id, type: "revoke", message: `You revoked ${biz.name}'s access.`, at: revokedAt });
      }
    }
  }

  // ---- Business portal demo: every business gets a real roster ----
  // This used to seed SafeBank NG only. That was fine while the business portal
  // was hard-wired to one business, but signing in as any other one now shows
  // that business's own data — so every business needs history of its own, or
  // most of the sign-in options open an empty shell.
  const ROSTER_SIZE: Record<string, number> = {
    biz_safebank: 10, // the demo's default business, and the busiest
    biz_smiletrust: 6,
    biz_paycycle: 5,
    biz_quickmart: 5,
    biz_novapay: 5,
    biz_glidecredit: 4,
    biz_healthsure: 4,
    biz_citycabs: 4,
    biz_faithbanc: 4,
  };

  /** Fisher-Yates over the seeded rng, so a given cast always lands the same way. */
  const shuffled = <T,>(arr: T[]): T[] => {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  const rosterPool = identities.filter((i) => i.id !== d);

  for (const biz of BUSINESSES) {
    const target = ROSTER_SIZE[biz.id] ?? 4;
    let added = 0;

    for (const identity of shuffled(rosterPool)) {
      if (added >= target) break;
      // Someone the per-identity pass already linked to this business keeps that
      // story; a second grant for the same pair would read as a duplicate.
      if (grants.some((g) => g.identityId === identity.id && g.businessId === biz.id)) continue;
      added++;

      const scopes: CheckId[] =
        added % 3 === 0
          ? ["over_18", "name_matches", "nin_matches", "has_verified_identity"]
          : added % 2 === 0
            ? ["over_18", "has_verified_identity"]
            : ["over_18", "name_matches"];

      const reqDays = 8 + Math.floor(rng() * 22); // 8–29 days ago
      const requestedAt = daysAgo(reqDays);
      const roll = rng();

      if (roll < 0.62) {
        const grantedDays = Math.max(1, reqDays - (2 + Math.floor(rng() * 6)));
        const grantedAt = daysAgo(grantedDays);
        grants.push({ id: generateInternalId("grant"), identityId: identity.id, businessId: biz.id, status: "granted", scopes, requestedAt, grantedAt });
        log({ identityId: identity.id, businessId: biz.id, type: "grant", message: `${biz.name} was granted access.`, at: grantedAt });

        const vfyCount = 1 + Math.floor(rng() * 2);
        for (let k = 0; k < vfyCount; k++) {
          const answers = computeAnswers(identity, scopes);
          const verdict = verdictOf(answers);
          const vfy = await mkVerification({
            identity,
            businessId: biz.id,
            checks: answers,
            verdict,
            requestedAt: daysAgo(Math.max(0, grantedDays - (1 + Math.floor(rng() * 5)))),
            note: verdictNote(verdict),
          });
          log({ identityId: identity.id, businessId: biz.id, type: "check", message: `${biz.name} verified ${scopeSummary(scopes)}?`, at: vfy.requestedAt, verificationId: vfy.id });
        }
      } else if (roll < 0.82) {
        grants.push({ id: generateInternalId("grant"), identityId: identity.id, businessId: biz.id, status: "requested", scopes, requestedAt });
        log({ identityId: identity.id, businessId: biz.id, type: "grant", message: `${biz.name} requested access to verify ${scopeSummary(scopes).toLowerCase()}.`, at: requestedAt });
      } else {
        const grantedDays = Math.max(3, reqDays - (2 + Math.floor(rng() * 6)));
        const grantedAt = daysAgo(grantedDays);
        const revokedAt = daysAgo(Math.max(0, grantedDays - (1 + Math.floor(rng() * 5))));
        grants.push({ id: generateInternalId("grant"), identityId: identity.id, businessId: biz.id, status: "revoked", scopes, requestedAt, grantedAt, revokedAt });
        log({ identityId: identity.id, businessId: biz.id, type: "grant", message: `${biz.name} was granted access.`, at: grantedAt });
        log({ identityId: identity.id, businessId: biz.id, type: "revoke", message: `You revoked ${biz.name}'s access.`, at: revokedAt });
      }
    }
  }

  vaultKeyId = (await vaultIdentity().catch(() => null))?.keyId ?? null;

  return {
    identities,
    businesses: BUSINESSES,
    grants,
    accessLog,
    verifications,
    activeIdentityId: demo.id,
    activeBusinessId,
    vaultKeyId,
  };
}

/** A parsed blob is only usable if it has the collections the UI assumes. */
function isUsableStore(s: unknown): s is Store {
  const c = s as Store | null;
  return (
    !!c &&
    Array.isArray(c.identities) &&
    c.identities.length > 0 &&
    Array.isArray(c.grants) &&
    Array.isArray(c.verifications) &&
    Array.isArray(c.accessLog)
  );
}

/**
 * Bring an older store up to the current shape. Receipts written before the
 * vault existed have no signature; we mark them unsigned rather than re-signing
 * them, because re-signing would launder an unsecured record into one that
 * claims to be signed.
 */
function normalizeStore(s: Store): Store {
  s.vaultKeyId = s.vaultKeyId ?? vaultKeyId;
  s.verifications = s.verifications.map((v) => ({
    ...v,
    signature: v.signature ?? null,
    keyId: v.keyId ?? null,
  }));
  // Records written before the biometric step existed have no value for it. The
  // seeded holders get the biometric today's seed would give them — matched by
  // id, never by position, because an enrolled record is appended after the
  // seeded ones and a positional guess would invent an enrollment. Anything not
  // in the seed stays null: claiming a biometric nobody gave is the one mistake
  // this field must not make.
  const seeded = new Map(buildSeedIdentities().map((u, i) => [u.id, seedBiometric(i)]));
  s.identities = s.identities.map((i) => ({
    ...i,
    biometric: i.biometric ?? seeded.get(i.id) ?? null,
  }));
  return s;
}

/**
 * Load the store, seeding it on first run.
 *
 * Every caller shares one in-flight promise. Two concurrent callers used to be
 * able to both miss the cache and seed independently, which left the object held
 * in memory and the object written to localStorage as different stores — the
 * session would then be reading one while writing the other.
 */
function loadStore(): Promise<Store> {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = readOrSeed().then(
      (s) => {
        cached = s;
        pending = null;
        return s;
      },
      (err) => {
        pending = null;
        throw err;
      }
    );
  }
  return pending;
}

async function readOrSeed(): Promise<Store> {
  if (typeof window === "undefined") return freshSeed();

  const sealed = window.localStorage.getItem(STORAGE_KEY);
  if (sealed) {
    try {
      if (isSealed(sealed)) {
        const parsed = await openJson<Store>(sealed);
        if (isUsableStore(parsed)) return normalizeStore(parsed);
      }
    } catch {
      // Wrong key, truncated blob, or tampering → fall through and reseed.
    }
  }

  // One-time migration from the pre-encryption plaintext store.
  const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy) as Store;
      if (isUsableStore(parsed)) {
        const migrated = normalizeStore(parsed);
        await saveStore(migrated);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        return migrated;
      }
    } catch {
      // ignore and reseed
    }
  }

  const seeded = await freshSeed();
  await saveStore(seeded);
  return seeded;
}

async function saveStore(s: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, await sealJson(s));
  } catch {
    // Vault unavailable, or storage full — the demo keeps working in memory.
    // Deliberately NOT falling back to plaintext: writing the record unencrypted
    // is the exact thing this module exists to stop doing.
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
  return snapshot(await loadStore());
}

export async function resetDemoApi(): Promise<Store> {
  // Settle any in-flight first load before replacing the store, so its promise
  // cannot resolve afterwards and put the pre-reset data back in the cache.
  await loadStore();
  const seeded = await freshSeed();
  cached = seeded;
  await saveStore(seeded);
  await delay(150);
  return snapshot(seeded);
}

export async function enrollIdentityApi(input: EnrollInput): Promise<{ store: Store; identity: Identity }> {
  await delay(850); // the "registration" feel
  const store = await loadStore();
  const identity: Identity = {
    id: generateInternalId("id"),
    uniqueId: generateUniqueId(),
    name: input.name.trim(),
    dob: input.dob,
    nin: input.nin.replace(/\D/g, "").slice(0, 11),
    kycStatus: "self_asserted",
    biometric: input.biometric,
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
  await saveStore(store);
  return { store: snapshot(store), identity };
}

export async function verifyReferenceApi(input: VerifyInput): Promise<{ store: Store; verification: Verification }> {
  await delay(600); // verification "round-trip"
  const store = await loadStore();
  const ref = normalizeReference(input.reference);
  const checks = input.checks;
  const businessId = store.activeBusinessId;

  const identity = store.identities.find((i) => normalizeReference(i.uniqueId) === ref) ?? null;

  const build = async (over: {
    verdict: Verdict;
    checkResults: CheckResult[];
    note: string;
    identityRef: string | null;
  }): Promise<Verification> => {
    const id = generateVerificationId();
    // One timestamp, read once. Taking it twice (once for the receipt, once for
    // the hash) meant a receipt could fail to reproduce its own hash whenever the
    // clock ticked between the two calls.
    const requestedAt = nowIso();
    const payload = receiptPayload({
      id,
      identityReference: over.identityRef,
      businessId,
      checks: over.checkResults,
      verdict: over.verdict,
      requestedAt,
    });
    const signed = await signReceipt(payload);
    const v: Verification = {
      id,
      identityId: identity?.id ?? null,
      identityReference: over.identityRef,
      businessId,
      checks: over.checkResults,
      verdict: over.verdict,
      requestedAt,
      note: over.note,
      ...signed,
    };
    store.verifications.push(v);
    return v;
  };

  // 1) Reference not found
  if (!identity) {
    const v = await build({
      verdict: "no_match",
      checkResults: checks.map((c) => ({ checkId: c, answer: "unable" as CheckAnswer, note: "Reference not found in the registry." })),
      note: "No identity matched this reference.",
      identityRef: ref,
    });
    await saveStore(store);
    return { store: snapshot(store), verification: v };
  }

  const grant = store.grants.find((gr) => gr.identityId === identity.id && gr.businessId === businessId);

  // 2) Access revoked or a pending request not yet approved
  if (grant && (grant.status === "revoked" || grant.status === "requested")) {
    const revoked = grant.status === "revoked";
    const v = await build({
      verdict: revoked ? "revoked" : "pending",
      checkResults: checks.map((c) => ({ checkId: c, answer: "unable" as CheckAnswer, note: revoked ? "Access was revoked by the identity holder." : "This business has not been granted access." })),
      note: revoked ? "The identity holder revoked access to this business." : "This business has not been granted access by the holder.",
      identityRef: identity.uniqueId,
    });
    await saveStore(store);
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
  const v = await build({ verdict, checkResults: answers, note: verdictNote(verdict), identityRef: identity.uniqueId });

  store.accessLog.push({
    id: generateInternalId("log"),
    identityId: identity.id,
    businessId,
    type: "check",
    message: `${businessName(businessId)} verified ${scopeSummary(checks)}?`,
    at: nowIso(),
    verificationId: v.id,
  });

  await saveStore(store);
  return { store: snapshot(store), verification: v };
}

export async function revokeGrantApi(grantId: string): Promise<Store> {
  await delay(200);
  const store = await loadStore();
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
    await saveStore(store);
  }
  return snapshot(store);
}

export async function approveGrantApi(grantId: string): Promise<Store> {
  await delay(200);
  const store = await loadStore();
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
    await saveStore(store);
  }
  return snapshot(store);
}

export async function denyGrantApi(grantId: string): Promise<Store> {
  await delay(200);
  const store = await loadStore();
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
    await saveStore(store);
  }
  return snapshot(store);
}

export async function restoreGrantApi(grantId: string): Promise<Store> {
  await delay(200);
  const store = await loadStore();
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
    await saveStore(store);
  }
  return snapshot(store);
}

/**
 * Point the portal at the account this browser session is acting as.
 *
 * The account you signed in with IS the account whose dashboard loads — this is
 * what makes that true. It runs on sign-in, on first load, and whenever the
 * in-page switcher changes the active holder, so the two can't drift apart.
 */
export async function applySessionApi(kind: "user" | "business", id: string): Promise<Store> {
  await delay(60);
  const store = await loadStore();
  let changed = false;

  if (kind === "user" && store.activeIdentityId !== id && store.identities.some((i) => i.id === id)) {
    store.activeIdentityId = id;
    changed = true;
  }
  if (kind === "business" && store.activeBusinessId !== id && store.businesses.some((b) => b.id === id)) {
    store.activeBusinessId = id;
    changed = true;
  }

  if (changed) await saveStore(store);
  return snapshot(store);
}

export async function getVerificationApi(id: string): Promise<Verification | null> {
  await delay(60);
  const store = await loadStore();
  return store.verifications.find((v) => v.id === id) ?? null;
}

/**
 * Re-check a receipt against the vault's public key. This is the real thing the
 * "anyone can re-check this receipt" claim refers to: the payload is rebuilt from
 * the stored record, so editing any field of that record invalidates it.
 */
export async function verifyReceiptApi(
  verificationId: string
): Promise<{ verification: Verification | null; result: VerifyResult }> {
  await delay(250);
  const store = await loadStore();
  const v = store.verifications.find((x) => x.id === verificationId) ?? null;
  if (!v) {
    return {
      verification: null,
      result: { status: "unsigned", reason: "No receipt with that id exists in this vault." },
    };
  }
  const result = await verifyPayload(
    receiptPayload(v),
    v.signature ? { hash: v.hash, signature: v.signature, keyId: v.keyId ?? undefined } : null
  );
  return { verification: snapshot(v), result };
}

/** The vault's published signing key fingerprint, for the UI's trust anchor line. */
export async function vaultKeyIdApi(): Promise<string | null> {
  if (vaultKeyId) return vaultKeyId;
  try {
    vaultKeyId = (await vaultIdentity()).keyId;
  } catch {
    vaultKeyId = null;
  }
  return vaultKeyId;
}

// ---------------------------------------------------------------------------
// Helpers (kept internal — the vault key is what makes these verifiable)
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
