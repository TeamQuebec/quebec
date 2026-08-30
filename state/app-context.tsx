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
  resetDemo: () => Promise<void>;
  getVerification: (id: string) => Promise<Verification | null>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.loadStoreApi().then((s) => {
      if (alive) {
        setStore(s);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const enroll = useCallback(async (input: EnrollInput) => {
    const { store: next, identity } = await api.enrollIdentityApi(input);
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

  const setActiveIdentity = useCallback(async (identityId: string) => {
    setStore(await api.setActiveIdentityApi(identityId));
  }, []);

  const resetDemo = useCallback(async () => {
    setStore(await api.resetDemoApi());
  }, []);

  const getVerification = useCallback((id: string) => api.getVerificationApi(id), []);

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
    resetDemo,
    getVerification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}
