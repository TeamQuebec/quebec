# Quebec — Technical Write-Up

## Data generation, data use, and security posture

**ICSC 2026 - Track B: Digital Identity & Trust - proving a fact without revealing the whole record**

---

## 1. Overview

Quebec is a privacy-preserving KYC verification system. A holder enrolls once and receives a short reference (for example `QBC-8X92-1F`). A business that needs to confirm a fact - is this person over 18, does their name match a verified record - sends that reference and a list of yes/no questions. Quebec returns a signed answer and a tamper-evident receipt. The business never receives the underlying record.

The governing design rule is one sentence: **the answer is a fact about the record, never the record itself.** No date of birth and no NIN is ever returned to a verifier, on any path, at any stage.

This document covers three things: how the data in the system is generated, how that data flows and what each party can see, and how the security concerns raised by the design are handled - including the limitations we are not claiming to have solved.

**Implementation status.** The application is a complete, clickable UI running entirely in the browser. There is no backend and no real identity verification: every identity record is synthetic. What is real is the cryptography. Receipts carry genuine ECDSA P-256 signatures, key custody uses non-extractable WebCrypto keys, and the store is sealed with AES-GCM before it is written to `localStorage`. Those parts are checkable by anyone with a browser console, and they are independent of any future backend.

---

## 2. Architecture

Two structural facts shape every security property that follows.

**There is no server.** The application is a Next.js 15 client. All logic - enrollment, verification, grant management, receipt signing - runs in the browser against a single module, `lib/mockApi.ts`. That module presents the exact async signatures a real backend would expose (`enrollIdentityApi`, `verifyReferenceApi`, `revokeGrantApi`, and so on), with simulated latency, so replacing its bodies with network calls is a single-file change.

**The browser is the trust root.** Because there is no backend, the signing key is generated on first run and held in the browser's IndexedDB. This is the honest version of the security story: in a deployed system that key belongs in an HSM or KMS behind a published registry key. Here, the vault is the root of trust, and we say so rather than implying more.

**There is no third-party surface.** A repository-wide search for `fetch`, `axios`, `XMLHttpRequest`, `WebSocket`, and `sendBeacon` in application code returns nothing. There is no analytics, no telemetry, and no runtime font or script CDN. Nothing about a holder's record leaves the browser, because nothing leaves the browser at all.

| Layer | Implementation | File |
| --- | --- | --- |
| UI | Next.js 15 App Router, React 19, Tailwind v4 | `app/`, `components/` |
| State | React context + session handling | `state/app-context.tsx` |
| API seam | Mock backend, async signatures, simulated latency | `lib/mockApi.ts` |
| Crypto | WebCrypto signing, key custody, at-rest sealing | `lib/vault.ts` |
| Check engine | Fact derivation and verdict logic | `lib/mockApi.ts`, `lib/checks.ts` |
| Identifiers | Reference and id generators, seeded PRNG | `lib/refs.ts` |
| Synthetic data | Curated cast and business list | `lib/mockData/`, `scripts/` |

---

## 3. How the data is generated

### 3.1 Identity records - a curated synthetic cast

All 16 identity records are fabricated. The dataset is not a raw PRNG dump; it is a **curated cast** with a generated serialisation. The reason is practical: names appear in screenshots, references appear in the README, and two records are pinned to produce specific demo verdicts.

- `scripts/generate-mock-users.mjs` holds `CURATED_CAST`, the authoritative list
- `npm run generate:users` rewrites `lib/mockData/users.ts` from that cast
- `npm run check:users` verifies the committed file still matches it - unique references and NINs, valid formats, anchors present, under-18 / over-18 mix intact - and fails loudly on drift

That third command is the one that matters for provenance: it makes the claim **checkable rather than asserted**. Anyone can run a single command and confirm that the file on disk corresponds to the declared fabricated cast.

Field generation:

- **Names** - invented Nigerian-style combinations, mixed from name pools
- **Dates of birth** - deliberately span under-18 and over-18 so the age check demonstrates both YES and NO. Two anchors are asserted by the generator, which refuses to emit a cast that can no longer demonstrate its own story
- **NINs** - 11 random digits matching no real registry entry and no real checksum. Correct in form, meaningless in content
- **References** - `QBC-XXXX-XX` from a 33-character alphabet with `I`, `O`, and `0` removed to avoid visual lookalikes. 33^6 = roughly 1.29 billion combinations
- **KYC status** - 8 records document-verified, 8 self-asserted, so "cannot confirm" is a reachable outcome rather than a theoretical one
- **Biometric** - derived from record position rather than drawn at random, so a given holder shows the same enrollment on every reseed. Of the 16 records: **8 fingerprint, 4 face, 4 none**. "Not enrolled" therefore exists in the seeded data and not only in records a user creates

### 3.2 Operational records - grants, access log, receipts

The seed also builds a populated history, so dashboards and audit logs are not empty shells on first run. All of it is deterministic via a seeded `mulberry32` PRNG, so the demo looks identical on every reset.

- **9 invented businesses** across banking, payments, micro-lending, health insurance, retail, and ride-hailing. None correspond to a real company
- **Per-identity grants** - each holder is linked to 0-2 businesses, with the outcome drawn as granted, requested, or revoked
- **Per-business rosters** - each business gets its own roster of linked holders, sized so that signing in as any business opens a populated portal. This is not cosmetic: before it, most sign-in options opened an empty shell
- **Timestamps run forward** - requested, then granted, then checked. An earlier version drew each date independently, which allowed a check to be dated before the grant that permitted it; that is exactly the kind of detail that makes a demo audit trail read as fake
- **Receipts** - seeded verifications are signed through the **same** `signReceipt` path and the **same** canonical payload contract as live ones. There is no "demo signature" shortcut anywhere in the seed

### 3.3 Records a user creates

Enrollment takes three fields - name, date of birth, NIN - plus an optional biometric. The NIN is normalised to digits and truncated to 11 characters. The record is created with `kycStatus: "self_asserted"`, because a record you create about yourself is not a document-verified one, and the check engine treats it accordingly.

The biometric step is explicitly optional and explicitly simulated. Selecting "fingerprint" or "face" runs a roughly 900 ms cosmetic delay, then records **only which kind was enrolled**. No sensor is read, no image or print is captured, and none is stored. The record carries the *fact that* a biometric was bound to it, never the biometric itself - which is also why this field cannot leak: there is nothing in the database to leak.

---

## 4. How the data is used

### 4.1 The reference is the only shared identifier

A holder shares `QBC-8X92-1F`. Not their name, not their NIN, not a copy of any document. This single string is the entire interface between the two sides of the system.

### 4.2 Enrollment

Three fields produce a record and a reference. The reference is the holder's permanent handle; the record behind it is never shown to a verifier. The holder is told plainly to save it, because it is the only thing they will ever need to hand over.

### 4.3 Verification - the minimization step

`computeAnswers(identity, checks)` in `lib/mockApi.ts` is where privacy is enforced, in code rather than in policy. It receives the complete identity record and returns only an array of `{ checkId, answer, note }`.

| Check | Question answered | What is returned |
| --- | --- | --- |
| `over_18` | Is the holder at least 18? | YES or NO |
| `name_matches` | Is the name on a verified record? | YES or UNABLE TO CONFIRM |
| `nin_matches` | Is the NIN on a verified record? | YES or UNABLE TO CONFIRM |
| `has_verified_identity` | Does a document-verified record exist? | YES or UNABLE TO CONFIRM |

The date of birth is read inside the function to compute an age boundary and **never crosses the return boundary**. There is no code path in which a date of birth or a NIN is placed into a response object. This is structural rather than defensive: there is no filter that could be forgotten, because there is no place a filter would go.

Note also that `name_matches` and `nin_matches` are answered by consulting the record's `kycStatus`, not by echoing any value back. The check confirms a fact *about* the record; it does not return the name or the number it consulted.

### 4.4 Receipts - what is actually committed to

`receiptPayload()` defines the exact bytes a receipt commits to:

- the receipt id
- the holder's reference
- the business id
- the check results
- the verdict
- the timestamp

**No name. No date of birth. No NIN.** A receipt proves what was asked and what was answered, and nothing about who the holder is beyond a reference.

Both signing and verification go through that one function, so a re-check can never drift from what was signed. The human-readable `note` is deliberately inside the signed payload, so editing the explanation breaks the signature exactly as editing the verdict does.

### 4.5 The holder's controls

- A **grant** is created on the first successful check by a business. Sharing the reference is the consent act
- The holder can **revoke** at any time. A revoked business receives `ACCESS REVOKED` instead of answers
- A **pending** request returns `NOT GRANTED`
- Every check, grant, and revocation is written to a **read-only access log** the holder can read
- New checks union their scopes into the existing grant rather than silently widening it
- A reference that matches no record returns `NO MATCH` - and that outcome also produces a signed receipt, so failed lookups are auditable too

---

## 5. Data minimization, field by field

| Data item | Stored in the record | In a receipt | Visible to a verifier | In the access log |
| --- | --- | --- | --- | --- |
| Full name | Yes | No | No | No |
| Date of birth | Yes | No | No | No |
| NIN | Yes (encrypted at rest) | No | No | No |
| Reference | Yes | Yes | Yes (they supplied it) | Yes |
| Biometric kind | Yes | No | No | No |
| Biometric data | Never collected | - | - | - |
| Age | Computed on demand | No | Only as YES/NO to "over 18?" | No |
| Check answers | Yes, in the receipt | Yes | Yes | Yes, as a summary |
| Business identity | In the grant | Yes | Their own | Yes |

Never collected at all: biometric images or prints, photographs or scans of identity documents, addresses, phone numbers, email addresses, and any real registry data.

---

## 6. Security concerns and how they are handled

### 6.1 Receipt forgery and tampering

**Concern.** A receipt is the artifact a business relies on. If it can be forged or edited after the fact, the whole verification is worthless.

**Handling.** Every receipt carries a SHA-256 digest of a canonical serialisation of its payload plus an ECDSA P-256 signature over those same bytes. Canonical serialisation means recursively key-sorted JSON: without it, re-serialising the same record could produce different bytes because key order is not guaranteed, and every signature check would fail for the wrong reason. Verification rebuilds the canonical bytes from the payload as supplied, so any edited field changes the bytes and the check fails.

Verification also **pins the signature to the vault's published key fingerprint**. A receipt signed by some other key is rejected as `unknown_key` even though its own signature is internally valid.

**Residual.** This is not yet a third-party attestation. Verification proves "this vault signed this", not "an independent registry vouches for this". The vault is the root of trust.

### 6.2 Key custody

**Concern.** A signing key in a browser is one careless line away from being exfiltrated.

**Handling.** The ECDSA private key is generated extractable exactly once, and only so the public half can be exported. The private half is then re-imported with `extractable: false` before it is stored. The stored key can sign and nothing more: it can never be read back out as bytes, not by this code and not by anything else on the origin. Keys are stored in IndexedDB as `CryptoKey` objects - structured-cloneable, never raw bytes.

The AES vault key is likewise generated non-extractable.

**Residual.** Non-extractability protects the key from exfiltration; it does not protect the origin from code execution. An attacker with the browser profile can *use* the key to sign even though they can never read it. What addresses that risk is the content security policy and the complete absence of remote script loading, described in 6.7.

### 6.3 Data at rest

**Concern.** A holder's full record - including their NIN - sitting in `localStorage` as readable JSON.

**Handling.** The entire store is sealed with AES-GCM 256 using a fresh random 12-byte IV on every write, in the format `qbc1:<iv>:<ciphertext>`, before it is written to `localStorage`. What sits at rest is ciphertext.

The critical detail is the failure path. If the vault is unavailable, the write is **dropped** and the demo continues in memory. There is deliberately **no plaintext fallback** - writing the record unencrypted is the exact thing this module exists to stop doing. A store written before encryption existed is migrated on first load and then removed.

### 6.4 Authentication

**Concern.** Who is allowed to act as a given holder or business?

**Handling.** Nothing. This is deliberately not implemented, and we would rather say so than let a reader assume otherwise.

Sign-in is a mock-up. It writes a flag and an account id to `localStorage` and requires no credential. It authenticates no one. Anyone can sign in as any holder and any business. This is a demo affordance that lets a judge move between the two portals quickly - it is not a control, and it must not be mistaken for one. A real deployment requires real authentication.

### 6.5 Authorization and tenant isolation

**Concern.** Can business A see business B's data, or reach a holder who has not granted it access?

**Handling.** The grant model is the authorization layer: a check against a business with no grant returns `NOT GRANTED`, a revoked grant returns `ACCESS REVOKED`, and neither path returns any fact about the holder. Business-side separation is enforced by scoping every query and roster to the signed-in business.

**Residual.** With no server, that separation is a session convention rather than a boundary enforced where an attacker cannot reach it. There is no server-side authorization because there is no server. Production requires per-holder authorization on the identity switcher and rate limiting on reference lookups.

### 6.6 Reference enumeration

**Concern.** If references can be guessed, an attacker can probe the registry.

**Handling.** References are treated as an **identifier, not a credential**. Knowing one is deliberately not sufficient: a lookup by a business with no grant returns `NOT GRANTED`, so enumeration yields the existence of nothing. Receipt routes additionally carry `X-Robots-Tag: noindex, nofollow` so a receipt id is not indexed.

**Residual.** A reference is roughly 30 bits of entropy, which is guessable by brute force at volume. This is a real limitation, and it is the reason rate limiting on reference lookups is called out as a production requirement rather than a nice-to-have.

### 6.7 Cross-site scripting and injection

**Concern.** The classic browser-side compromise, and the one that would matter most here because the vault key is usable from the origin.

**Handling.** A content security policy served on every route:

| Directive | Value | Why |
| --- | --- | --- |
| `default-src` | `'self'` | deny by default |
| `script-src` | `'self' 'unsafe-inline'` | production has no `unsafe-eval`; dev adds it only for HMR |
| `connect-src` | `'self'` | also hard-blocks an accidental exfiltration channel |
| `object-src` | `'none'` | no plugin surfaces |
| `base-uri` | `'self'` | blocks base-tag hijacking |
| `frame-ancestors` | `'none'` | clickjacking |
| `form-action` | `'self'` | a form cannot post a record off-origin |
| `img-src` | `'self' data: blob:` | |

`'unsafe-inline'` on `style-src` is required by Next's inlined critical CSS. The script policy stays strict, because nothing in this application loads or evaluates remote code. Combined with React's default output escaping and the absence of `dangerouslySetInnerHTML` on any record-derived value, the injection surface is small and the policy is tight enough that a successful injection would still have nowhere to send data.

### 6.8 Other browser-surface concerns

| Concern | Handling |
| --- | --- |
| Clickjacking | `frame-ancestors 'none'` plus `X-Frame-Options: DENY` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Referrer leakage | `Referrer-Policy: strict-origin-when-cross-origin` |
| Cross-origin window access | `Cross-Origin-Opener-Policy: same-origin` |
| Device permissions | `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()` - the biometric step cannot reach a real sensor, and the policy says so at the platform level |
| CSRF | Structurally absent. No cookies, no session tokens, no ambient authority, no server endpoints |
| Supply chain | Minimal dependency surface, no runtime third-party scripts |

The permissions policy is worth noting on its own: the biometric enrollment is simulated, and `camera=()` means the browser itself will refuse a camera to this origin. The claim "no image is captured" is enforced by the platform, not only by our code choosing not to ask.

### 6.9 Integrity of derived and migrated data

**Concern.** Data written by an older version, or a field added later, silently acquiring a value it should not have.

**Handling.** The biometric field is backfilled on load for records that predate it, and the backfill is matched **by record id, never by position**. Enrolled records are appended after seeded ones, so a positional guess would attribute an enrollment to the wrong person. The reasoning is written into the code: claiming a biometric nobody gave is the one mistake this field must not make. Anything not in the seed stays `null`.

### 6.10 Availability and graceful degradation

**Concern.** WebCrypto requires a secure context and IndexedDB can be blocked in private browsing modes. A white screen would be a worse outcome than a degraded demo.

**Handling.** Every vault function degrades to a clearly-marked unsigned path through a single `VaultUnavailableError` type. If WebCrypto is unavailable the receipt is stored with `signature: null` and `keyId: null`, and the UI states that the receipt is unsigned. We do **not** substitute a look-alike hash and present it as a signature. A deterministic `pseudoHash` exists for display fallback only, is documented as not being a signature, and is never rendered as one.

---

## 7. What this is not

A security write-up that only lists strengths is not a security write-up. These are the limits, stated plainly.

- **Not authentication.** Sign-in is a mock-up and authenticates no one, as described in 6.4.
- **Not a third-party attestation.** Signature verification is genuine, but the vault is the root of trust. A receipt proves this vault signed this payload. It does not yet prove that an independent registry vouches for the underlying record.
- **Single-browser.** The registry is local to one browser. A holder enrolled in one browser is unknown in another, and two browsers do not share a store.
- **No rate limiting, no server-side authorization, no durable audit log.** The access log lives in the same sealed store as everything else. It is tamper-evident in the sense that receipts are signed, but there is no write-once server-side record.
- **Synthetic data only.** No real personal information is used, collected, or stored at any stage of development or demonstration.
- **A local attacker with the browser profile can use the key.** Discussed in 6.2. Non-extractability is a real property, but it is not a substitute for server-side key custody.

---

## 8. Production path

Each demo property maps to a specific production replacement. This mapping is the reason the mock API seam exists.

| Concern | Today | Production |
| --- | --- | --- |
| Key custody | Non-extractable key in browser IndexedDB | HSM or KMS, receipts chained to a published registry key |
| Authentication | Mock sign-in, no credential | Real authentication with per-holder authorization |
| Registry | Local synthetic dataset | Real registry integration and document verification |
| Storage | AES-GCM sealed `localStorage` | Server-side encrypted store with access controls |
| Authorization | Grant model, session-scoped | Server-enforced, per-check, with rate limiting |
| Audit log | In the sealed local store | Append-only server-side log |
| Receipt verification | Against the originating vault's key | Against a published registry key, verifiable by third parties |
| Seed data | Synthetic cast in `lib/mockData/` | Removed, or behind a `NEXT_PUBLIC_DEMO=1` flag |

Two invariants must survive that migration. First, `receiptPayload()` is the contract the signatures cover: its shape must stay stable or change only with a deliberate key and version migration. Second, `computeAnswers()` is the minimization boundary: whatever replaces the data source, the function that answers a check must continue to return facts rather than fields.

---

## 9. Appendix

### 9.1 Cryptographic parameters

| Parameter | Value |
| --- | --- |
| Receipt signature | ECDSA P-256 with SHA-256 |
| Private key handling | Generated extractable once, re-imported with `extractable: false` |
| Key storage | IndexedDB `qbc.vault.keys.v1`, object store `keys` |
| Key entries | `sign.private`, `sign.spki`, `vault.aes` |
| Key identifier | First 16 hex characters of SHA-256 of the SPKI public key |
| At-rest cipher | AES-GCM 256, fresh random 12-byte IV per write |
| Sealed blob format | `qbc1:<iv base64>:<ciphertext base64>` |
| Canonical serialisation | Recursive key-sorted JSON, shared by signing and verification |
| Store key | `qbc.mock.store.v2` (sealed); `qbc.mock.store.v1` (legacy plaintext, migrated then removed) |
| Session keys | `qbc.auth`, `qbc.auth.kind`, `qbc.auth.id` - a flag and an id, not a credential |

### 9.2 Relevant source files

| File | Responsibility |
| --- | --- |
| `lib/vault.ts` | Key custody, canonical serialisation, receipt signing and verification, at-rest sealing |
| `lib/mockApi.ts` | The API seam: enrollment, verification, grants, seeding, persistence, the check engine |
| `lib/checks.ts` | Check catalogue and human-readable labels |
| `lib/refs.ts` | Reference and id generators, seeded PRNG, display fallback hash |
| `lib/types.ts` | Domain types, including the `biometric` field and its documented scope |
| `state/app-context.tsx` | Session state and the auth flag |
| `lib/mockData/users.ts` | Generated synthetic identity cast |
| `lib/mockData/businesses.ts` | Invented business list |
| `scripts/generate-mock-users.mjs` | Authoritative cast, `--check` verification, `--new` proposals |
| `next.config.mjs` | Security headers and content security policy |

### 9.3 Verifying the claims in this document

The provenance and cryptography claims above are checkable rather than asserted:

- `npm run check:users` - confirms the committed dataset matches the declared synthetic cast
- `npm run build` - lint gating is enabled, so warnings fail the build
- In the browser: open a receipt and press **Re-check this receipt**. The signature is verified for real, against the vault's public key. Edit a byte of the payload and the check fails
- Inspect `localStorage` for `qbc.mock.store.v2` - the value is a sealed blob beginning `qbc1:`, not readable JSON
