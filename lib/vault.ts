/**
 * Quebec — vault key custody, receipt signing, and at-rest encryption.
 * -------------------------------------------------------------------
 * The app runs entirely in the browser, so this is where the cryptography the
 * UI advertises actually happens. Two independent keys, both generated on first
 * run and held in IndexedDB:
 *
 *   signing  ECDSA P-256. The private half is re-imported as NON-EXTRACTABLE
 *            before it is stored, so it can sign but can never be read back out
 *            as bytes — not by this code, not by anything else on the origin.
 *            The public half is published (SPKI, base64) so a receipt can be
 *            re-checked by anyone holding it.
 *
 *   vault    AES-GCM 256, non-extractable. Seals the whole store before it is
 *            written to localStorage, so the record at rest is ciphertext.
 *
 * What this does and does not prove
 * ---------------------------------
 * A receipt is signed by THIS vault's key, and verification pins the signature
 * to the vault's published fingerprint — a receipt signed by some other key is
 * rejected even though its own signature is internally valid. So a receipt
 * cannot be forged without either the private key or a rewrite of the vault.
 * It is not a third-party attestation: the vault is the root of trust here, the
 * same way a registry would be in a deployed system. Say it that way out loud
 * rather than implying more.
 *
 * Every function degrades to a clearly-marked "unsigned" path if WebCrypto or
 * IndexedDB is unavailable, so the demo never white-screens.
 */

const DB_NAME = "qbc.vault.keys.v1";
const STORE_NAME = "keys";

const SIGN_ALGO: EcKeyGenParams = { name: "ECDSA", namedCurve: "P-256" };
const SIGN_PARAMS: EcdsaParams = { name: "ECDSA", hash: "SHA-256" };
const AES_ALGO: AesKeyGenParams = { name: "AES-GCM", length: 256 };

/** Blob prefix so a sealed value is distinguishable from the legacy plaintext JSON. */
const SEAL_PREFIX = "qbc1";

const enc = new TextEncoder();
const dec = new TextDecoder();

export interface ReceiptSignature {
  /** SHA-256 of the canonical payload, 64 hex chars */
  hash: string;
  /** base64 ECDSA P-256 signature over the same bytes */
  signature: string;
  /** fingerprint of the signing key, so a receipt names its own signer */
  keyId: string;
}

// ---------------------------------------------------------------------------
// Canonical serialisation — the thing that actually makes tampering detectable
// ---------------------------------------------------------------------------

/**
 * Stable JSON: object keys sorted recursively. Without this, re-serialising the
 * same record could produce different bytes (key order is not guaranteed) and
 * every signature check would fail for the wrong reason.
 */
export function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`)
    .join(",")}}`;
}

// ---------------------------------------------------------------------------
// base64 <-> bytes (browser-only, and only ever called from the browser)
// ---------------------------------------------------------------------------

function toB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** "AB12CD34…" -> "AB12 CD34 …" for display. */
export function formatFingerprint(hex: string): string {
  return (hex.match(/.{1,4}/g) ?? []).join(" ").toUpperCase();
}

// ---------------------------------------------------------------------------
// IndexedDB (keys are CryptoKey objects — structured-cloneable, never bytes)
// ---------------------------------------------------------------------------

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("indexedDB open failed"));
    req.onblocked = () => reject(new Error("indexedDB blocked"));
  });
  return dbPromise;
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise<T | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// ---------------------------------------------------------------------------
// Crypto availability
// ---------------------------------------------------------------------------

/** WebCrypto needs a secure context; IndexedDB can be blocked in private modes. */
export function cryptoSupported(): boolean {
  return typeof window !== "undefined" && typeof window.crypto?.subtle !== "undefined";
}

/** Raised when the vault cannot be initialised; callers fall back to unsigned mode. */
export class VaultUnavailableError extends Error {}

function assertSupported() {
  if (!cryptoSupported()) {
    throw new VaultUnavailableError(
      "WebCrypto is unavailable (needs https or localhost). Receipts will be stored unsigned."
    );
  }
}

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------

let signingKeyPromise: Promise<{ privateKey: CryptoKey; keyId: string; spki: string }> | null = null;
let vaultKeyPromise: Promise<CryptoKey> | null = null;

async function loadOrCreateSigningKey() {
  assertSupported();
  const stored = await idbGet<CryptoKey>("sign.private");
  const storedSpki = await idbGet<string>("sign.spki");
  if (stored && storedSpki) {
    return { privateKey: stored, spki: storedSpki, keyId: await fingerprintOf(storedSpki) };
  }

  // Generate extractable so the public half can be published, then re-import the
  // private half with extractable:false. The stored key can sign and nothing more.
  const pair = await crypto.subtle.generateKey(SIGN_ALGO, true, ["sign", "verify"]);
  const spki = toB64(await crypto.subtle.exportKey("spki", pair.publicKey));
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", pair.privateKey);
  const privateKey = await crypto.subtle.importKey("pkcs8", pkcs8, SIGN_ALGO, false, ["sign"]);

  await idbPut("sign.private", privateKey);
  await idbPut("sign.spki", spki);
  return { privateKey, spki, keyId: await fingerprintOf(spki) };
}

async function fingerprintOf(spkiB64: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", fromB64(spkiB64));
  return toHex(digest).slice(0, 16).toUpperCase();
}

function getSigningKey() {
  if (!signingKeyPromise) {
    signingKeyPromise = loadOrCreateSigningKey().catch((err) => {
      signingKeyPromise = null; // let a later attempt retry
      throw asVaultUnavailable(err);
    });
  }
  return signingKeyPromise;
}

async function loadOrCreateVaultKey(): Promise<CryptoKey> {
  assertSupported();
  const stored = await idbGet<CryptoKey>("vault.aes");
  if (stored) return stored;
  const key = await crypto.subtle.generateKey(AES_ALGO, false, ["encrypt", "decrypt"]);
  await idbPut("vault.aes", key);
  return key;
}

function getVaultKey() {
  if (!vaultKeyPromise) {
    vaultKeyPromise = loadOrCreateVaultKey().catch((err) => {
      vaultKeyPromise = null;
      throw asVaultUnavailable(err);
    });
  }
  return vaultKeyPromise;
}

/**
 * IndexedDB can be blocked (private windows, storage permissions, quota). Any
 * such failure means "no vault here" — the same outcome as missing WebCrypto —
 * so callers get one error type to handle and the demo degrades to unsigned
 * storage instead of throwing a raw DOMException through the seeding path.
 */
function asVaultUnavailable(err: unknown): Error {
  if (err instanceof VaultUnavailableError) return err;
  const detail = err instanceof Error ? err.message : String(err);
  return new VaultUnavailableError(`Vault key storage is unavailable: ${detail}`);
}

/** The vault's published identity — shown in the UI as the trust anchor. */
export async function vaultIdentity(): Promise<{ keyId: string; spki: string }> {
  const { keyId, spki } = await getSigningKey();
  return { keyId, spki };
}

// ---------------------------------------------------------------------------
// Signing
// ---------------------------------------------------------------------------

/**
 * Sign a payload. Returns the SHA-256 digest of the canonical bytes plus an
 * ECDSA signature over those same bytes.
 */
export async function signPayload(payload: unknown): Promise<ReceiptSignature> {
  assertSupported();
  const { privateKey, keyId } = await getSigningKey();
  const bytes = enc.encode(canonical(payload));
  const [digest, sig] = await Promise.all([
    crypto.subtle.digest("SHA-256", bytes),
    crypto.subtle.sign(SIGN_PARAMS, privateKey, bytes),
  ]);
  return { hash: toHex(digest), signature: toB64(sig), keyId };
}

export type VerifyResult =
  | { status: "valid" }
  | { status: "tampered"; reason: string }
  | { status: "unknown_key"; reason: string }
  | { status: "unsigned"; reason: string };

/**
 * Re-check a receipt. Rebuilds the canonical bytes from the payload as supplied,
 * so any edited field changes the bytes and the check fails.
 */
export async function verifyPayload(
  payload: unknown,
  sig: Partial<ReceiptSignature> | null | undefined
): Promise<VerifyResult> {
  if (!sig || !sig.signature || !sig.hash || !sig.keyId) {
    return { status: "unsigned", reason: "This receipt carries no signature." };
  }
  if (!cryptoSupported()) {
    return { status: "unsigned", reason: "WebCrypto is unavailable, so the signature cannot be checked here." };
  }

  const { keyId, spki } = await getSigningKey();
  if (keyId !== sig.keyId) {
    return {
      status: "unknown_key",
      reason: `Signed by key ${sig.keyId}, but this vault signs with ${keyId}. A receipt from another vault is not trustworthy here.`,
    };
  }

  const bytes = enc.encode(canonical(payload));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  if (toHex(digest) !== sig.hash.toLowerCase()) {
    return { status: "tampered", reason: "The record hash does not match the receipt's contents." };
  }

  const publicKey = await crypto.subtle.importKey("spki", fromB64(spki), SIGN_ALGO, true, ["verify"]);
  const ok = await crypto.subtle.verify(SIGN_PARAMS, publicKey, fromB64(sig.signature), bytes);
  return ok ? { status: "valid" } : { status: "tampered", reason: "The signature does not match the receipt's contents." };
}

// ---------------------------------------------------------------------------
// At-rest encryption
// ---------------------------------------------------------------------------

/** Encrypt a value for localStorage. Format: "qbc1:<iv b64>:<ciphertext b64>". */
export async function sealJson(value: unknown): Promise<string> {
  assertSupported();
  const key = await getVaultKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(value)));
  return `${SEAL_PREFIX}:${toB64(iv)}:${toB64(ct)}`;
}

export function isSealed(blob: string): boolean {
  return blob.startsWith(`${SEAL_PREFIX}:`);
}

/** Decrypt a sealed blob. Throws if it was not produced by this vault. */
export async function openJson<T>(blob: string): Promise<T> {
  assertSupported();
  const parts = blob.split(":");
  if (parts.length !== 3 || parts[0] !== SEAL_PREFIX) throw new Error("not a sealed blob");
  const key = await getVaultKey();
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromB64(parts[1]) },
    key,
    fromB64(parts[2])
  );
  return JSON.parse(dec.decode(pt)) as T;
}
