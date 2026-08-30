/**
 * Quebec — domain types (Phase 1: mock). These mirror the shapes the real
 * backend will return in Phase 2, so switching from `mockApi` to Supabase
 * only touches one file.
 */

/** Whether the record passed an independent (document / NIN) verification step. */
export type KycStatus = "verified" | "self_asserted";

export interface Identity {
  /** internal id, e.g. "id_adaeze" */
  id: string;
  /** public, shareable reference — e.g. "QBC-8X92-1F" */
  uniqueId: string;
  name: string;
  /** ISO yyyy-mm-dd */
  dob: string;
  /** 11-digit National ID number (synthetic — never a real NIN) */
  nin: string;
  kycStatus: KycStatus;
  createdAt: string;
}

export type GrantStatus = "granted" | "requested" | "revoked";

export type CheckId =
  | "over_18"
  | "name_matches"
  | "nin_matches"
  | "has_verified_identity";

export interface Grant {
  id: string;
  identityId: string;
  businessId: string;
  status: GrantStatus;
  scopes: CheckId[];
  requestedAt: string;
  grantedAt?: string;
  revokedAt?: string;
}

export interface Business {
  id: string;
  name: string;
  sector: string;
}

export type CheckAnswer = "yes" | "no" | "unable";

export interface CheckResult {
  checkId: CheckId;
  answer: CheckAnswer;
  /** human explanation of why the answer is what it is */
  note: string;
}

export type Verdict = "yes" | "no" | "no_match" | "revoked" | "pending" | "unconfirmed";

export interface Verification {
  /** public receipt id — e.g. "VFY-4N7C-2Q" */
  id: string;
  /** null when the reference matched no identity */
  identityId: string | null;
  identityReference: string | null;
  businessId: string;
  checks: CheckResult[];
  verdict: Verdict;
  requestedAt: string;
  /** deterministic pseudo-hash for the tamper-evident look (Phase 2: real signature) */
  hash: string;
  note: string;
}

export type LogType = "check" | "grant" | "revoke" | "approve" | "deny" | "enroll";

export interface AccessLogEntry {
  id: string;
  identityId: string;
  businessId: string | null;
  type: LogType;
  message: string;
  at: string;
  verificationId?: string;
}

export interface Store {
  identities: Identity[];
  businesses: Business[];
  grants: Grant[];
  accessLog: AccessLogEntry[];
  verifications: Verification[];
  activeIdentityId: string;
  activeBusinessId: string;
}

export interface EnrollInput {
  name: string;
  dob: string;
  nin: string;
}

export interface VerifyInput {
  reference: string;
  checks: CheckId[];
}
