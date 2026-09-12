"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as api from "@/lib/mockApi";
import { businessById } from "@/lib/mockApi";
import type { VerifyResult } from "@/lib/vault";
import type {
  AccessLogEntry,
  Business,
  EnrollInput,
  Grant,
  Identity,
  Store,
  Verification,
  VerifyInput,
} from "@/lib/types";

/** Which portal a session belongs to. */
export type AuthKind = "user" | "business";

const AUTH_KEY = "qbc.auth";
const AUTH_KIND_KEY = "qbc.auth.kind";
const AUTH_ID_KEY = "qbc.auth.id";

/**
 * The account this browser session signed in as. A flag plus an id — not a
 * credential, and not a secret. Nothing in the app authenticates anyone.
 */
function readSession(): { kind: AuthKind; id: string | null } | null {
  if (typeof window === "undefined") return null;
  if (window.localStorage.getItem(AUTH_KEY) !== "signed-in") return null;
  const kind = window.localStorage.getItem(AUTH_KIND_KEY);
  if (kind !== "user" && kind !== "business") return null;
  return { kind, id: window.localStorage.getItem(AUTH_ID_KEY) };
}

function writeSessionId(id: string) {
  window.localStorage.setItem(AUTH_ID_KEY, id);
}

interface AppContextValue {
  /** true while the mock store is loading on first mount */
  loading: boolean;
  store: Store | null;
  activeIdentity: Identity | null;
  /** name of the business the verifier portal is signed in as */
  activeBusinessName: string;
  businessesById: Record<string, Business>;
  /** grants + access log scoped to the active identity, newest first */
  activeGrants: Grant[];
  activeLog: AccessLogEntry[];

  enroll: (input: EnrollInput) => Promise<Identity>;
  verify: (input: VerifyInput) => Promise<Verification>;
  revokeGrant: (grantId: string) => Promise<void>;
  approveGrant: (grantId: string) => Promise<void>;
  denyGrant: (grantId: string) => Promise<void>;
  restoreGrant: (grantId: string) => Promise<void>;
  setActiveIdentity: (identityId: string) => Promise<void>;
  setActiveBusiness: (businessId: string) => Promise<void>;
  resetDemo: () => Promise<void>;
  getVerification: (id: string) => Promise<Verification | null>;
  verifyReceipt: (id: string) => Promise<{ verification: Verification | null; result: VerifyResult }>;
  signedIn: boolean;
  /** null when signed out — used to keep a session out of the other portal */
  authKind: AuthKind | null;
  /** the record/business this session signed in as, and therefore the one on screen */
  sessionId: string | null;
  /** fingerprint of the vault signing key, published as the trust anchor */
  vaultKeyId: string | null;
  signIn: (kind: AuthKind, id: string) => Promise<void>;
  signOut: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [authKind, setAuthKind] = useState<AuthKind | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [vaultKeyId, setVaultKeyId] = useState<string | null>(null);

  useEffect(() => {
    const session = readSession();
    if (session) setAuthKind(session.kind);

    let alive = true;
    (async () => {
      const base = await api.loadStoreApi();
      // Whoever this session signed in as is whose dashboard loads. A session
      // saved before account ids were stored adopts whatever the store has
      // active, so from here on the two can never disagree.
      const id =
        session?.id ??
        (session ? (session.kind === "user" ? base.activeIdentityId : base.activeBusinessId) : null);
      const next = session && id ? await api.applySessionApi(session.kind, id) : base;
      if (!alive) return;
      if (session && id) {
        writeSessionId(id);
        setSessionId(id);
      }
      setStore(next);
      setLoading(false);
    })();

    api.vaultKeyIdApi().then((id) => {
      if (alive) setVaultKeyId(id);
    });
    return () => {
      alive = false;
    };
  }, []);

  const signIn = useCallback(async (kind: AuthKind, id: string) => {
    window.localStorage.setItem(AUTH_KEY, "signed-in");
    window.localStorage.setItem(AUTH_KIND_KEY, kind);
    writeSessionId(id);
    setAuthKind(kind);
    setSessionId(id);
    // Applying the choice is the point: before this, picking a record on the
    // sign-in screen changed nothing and every session opened the same account.
    setStore(await api.applySessionApi(kind, id));
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(AUTH_KEY);
    window.localStorage.removeItem(AUTH_KIND_KEY);
    window.localStorage.removeItem(AUTH_ID_KEY);
    setAuthKind(null);
    setSessionId(null);
  }, []);

  const enroll = useCallback(async (input: EnrollInput) => {
    const { store: next, identity } = await api.enrollIdentityApi(input);
    // Enrolling makes you the new identity, so the session follows it rather
    // than snapping back to the previous record on the next load.
    writeSessionId(identity.id);
    setSessionId(identity.id);
    setStore(next);
    return identity;
  }, []);

  const verify = useCallback(async (input: VerifyInput) => {
    const { store: next, verification } = await api.verifyReferenceApi(input);
    setStore(next);
    return verification;
  }, []);

  const revokeGrant = useCallback(async (grantId: string) => {
    setStore(await api.revokeGrantApi(grantId));
  }, []);

  const approveGrant = useCallback(async (grantId: string) => {
    setStore(await api.approveGrantApi(grantId));
  }, []);

  const denyGrant = useCallback(async (grantId: string) => {
    setStore(await api.denyGrantApi(grantId));
  }, []);

  const restoreGrant = useCallback(async (grantId: string) => {
    setStore(await api.restoreGrantApi(grantId));
  }, []);

  const setActiveIdentity = useCallback(
    async (identityId: string) => {
      const next = await api.applySessionApi("user", identityId);
      setStore(next);
      // The switcher is only ever rendered in the user portal. Moving it also
      // moves the session, but only once the store has confirmed the change —
      // otherwise a reload would silently restore the previous holder.
      if (authKind === "user" && next.activeIdentityId === identityId) {
        writeSessionId(identityId);
        setSessionId(identityId);
      }
    },
    [authKind]
  );

  const setActiveBusiness = useCallback(
    async (businessId: string) => {
      const next = await api.applySessionApi("business", businessId);
      setStore(next);
      if (authKind === "business" && next.activeBusinessId === businessId) {
        writeSessionId(businessId);
        setSessionId(businessId);
      }
    },
    [authKind]
  );

  const resetDemo = useCallback(async () => {
    const next = await api.resetDemoApi();
    // A reset rebuilds the store from the seed. Business records are static so a
    // business session survives intact; an enrolled holder does not exist in the
    // seed, so that session has to fall back to whichever record the seed made
    // active — and the stored session id has to follow, or the next load would
    // ask for an identity that is gone.
    if (!authKind || !sessionId) {
      setStore(next);
      return;
    }
    const survives =
      authKind === "business"
        ? next.businesses.some((b) => b.id === sessionId)
        : next.identities.some((i) => i.id === sessionId);

    if (survives) {
      setStore(await api.applySessionApi(authKind, sessionId));
      return;
    }
    writeSessionId(authKind === "business" ? next.activeBusinessId : next.activeIdentityId);
    setSessionId(authKind === "business" ? next.activeBusinessId : next.activeIdentityId);
    setStore(next);
  }, [authKind, sessionId]);

  const getVerification = useCallback((id: string) => api.getVerificationApi(id), []);

  const verifyReceipt = useCallback((id: string) => api.verifyReceiptApi(id), []);

  const activeIdentity = useMemo(
    () => store?.identities.find((i) => i.id === store.activeIdentityId) ?? null,
    [store]
  );

  const businessesById = useMemo(() => {
    const map: Record<string, Business> = {};
    for (const b of store?.businesses ?? []) map[b.id] = b;
    return map;
  }, [store]);

  const activeGrants = useMemo(
    () => (store && activeIdentity ? store.grants.filter((g) => g.identityId === activeIdentity.id) : []),
    [store, activeIdentity]
  );

  const activeLog = useMemo(
    () =>
      store && activeIdentity
        ? store.accessLog
            .filter((l) => l.identityId === activeIdentity.id)
            .sort((a, b) => b.at.localeCompare(a.at))
        : [],
    [store, activeIdentity]
  );

  const value: AppContextValue = {
    loading,
    store,
    activeIdentity,
    activeBusinessName: store ? businessById(store.activeBusinessId).name : "A business",
    businessesById,
    activeGrants,
    activeLog,
    enroll,
    verify,
    revokeGrant,
    approveGrant,
    denyGrant,
    restoreGrant,
    setActiveIdentity,
    setActiveBusiness,
    resetDemo,
    getVerification,
    verifyReceipt,
    signedIn: authKind !== null,
    authKind,
    sessionId,
    vaultKeyId,
    signIn,
    signOut,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}
