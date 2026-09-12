/**
 * Quebec — domain types. These mirror the shapes a real backend would return,
 * so swapping `mockApi` for Supabase only touches one file.
 */

/** Whether the record passed an independent (document / NIN) verification step. */
export type KycStatus = "verified" | "self_asserted";

/** Which biometric a holder bound to their record at enrollment. */
export type BiometricKind = "fingerprint" | "face";

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
  /**
   * The biometric enrolled alongside this record, or null if the holder skipped
   * it. Only WHICH one was enrolled is stored — never the print and never the
   * image. That is the whole gesture: the record holds the fact that a finger or
   * a face was bound to this reference, so a check can attest to it, while the
   * biometric itself never enters the database and so can never leak from it.
   */
  biometric: BiometricKind | null;
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
  /** SHA-256 of the canonical receipt payload — 64 hex chars */
  hash: string;
  /** base64 ECDSA P-256 signature over the same canonical bytes; null if the vault was unavailable */
  signature: string | null;
  /** fingerprint of the key that signed this receipt, so it names its own signer */
  keyId: string | null;
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
  /** fingerprint of the vault signing key, published so receipts can be re-checked */
  vaultKeyId: string | null;
}

export interface EnrollInput {
  name: string;
  dob: string;
  nin: string;
  /** null when the holder skipped the biometric step — it is offered, not required */
  biometric: BiometricKind | null;
}

export interface VerifyInput {
  reference: string;
  checks: CheckId[];
}
