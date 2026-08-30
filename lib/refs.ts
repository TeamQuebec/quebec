/** Reference & id generators + deterministic pseudo-hash. */

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789"; // no I, O, 0 — avoids lookalikes

export function randFrom(chars: string, len: number, rng: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(rng() * chars.length)];
  return out;
}

/** Unique ID a holder shares instead of their record, e.g. "QBC-8X92-1F" */
export function generateUniqueId(): string {
  return `QBC-${randFrom(REF_CHARS, 4)}-${randFrom(REF_CHARS, 2)}`;
}

/** Public verification receipt id, e.g. "VFY-4N7C-2Q" */
export function generateVerificationId(): string {
  return `VFY-${randFrom(REF_CHARS, 4)}-${randFrom(REF_CHARS, 2)}`;
}

/** Internal opaque ids, e.g. "id_8x92k1" */
export function generateInternalId(prefix: string): string {
  return `${prefix}_${randFrom(REF_CHARS, 6).toLowerCase()}`;
}

/** Normalize a user-typed reference for lookup. */
export function normalizeReference(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s-]/g, "");
}

/**
 * Deterministic 64-hex pseudo-hash (cyrb53-style, x2) used to make receipts
 * look tamper-evident. NOT cryptographic — Phase 2 replaces this with a real
 * signed digest from the backend.
 */
export function pseudoHash(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  const out = hex(h1) + hex(h2);
  return (out + out).slice(0, 64).toUpperCase();
}

/** Deterministic PRNG (mulberry32) for reproducible synthetic data. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
