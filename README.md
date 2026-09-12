# Quebec — Verify a fact, not the whole record

**Privacy-preserving KYC verification** · ICSC 2026, Track B — *Digital Identity &
Trust: proving a fact without revealing the whole record.*

Quebec lets a business confirm a **single fact** about someone — their age, their
name, that they hold a verified identity — without ever seeing the full identity
record. The holder shares a short reference (`QBC-8X92-1F`), the business asks a
yes/no question, and Quebec returns a **signed YES/NO plus a verifiable receipt**.
The answer is a fact about the record, never the record itself: no DOB and no NIN
is ever returned to a verifier.

> **This repo:** complete, clickable UI/UX, running entirely in the browser on
> synthetic data. There is no backend and no real identity verification.
>
> What *is* real: the cryptography. Receipts carry an ECDSA P-256 signature and the
> store is sealed with AES-GCM before it is written to `localStorage` — see
> [`lib/vault.ts`](lib/vault.ts). That is genuine, checkable, and independent of any
> future backend.

---

## Run it

```bash
npm install
npm run dev        # → http://localhost:3000
```

## The 2-minute demo story

1. **Landing** → *"I'm a user"*. The sign-in asks which holder to open as — pick
   **Adaeze Okafor · QBC-8X92-1F**, the record the rest of this story uses. That
   choice *is* the account you get: switch it and the dashboard, access log and
   receipts all switch with it.
2. **Dashboard** — the businesses holding access to that reference, a pending
   request, and a read-only **access log** with receipts. To add a record of your
   own, use **Enroll an identity**: three fields, and you get a reference — the
   only thing you ever share.
3. Switch to **"I'm a business"** and sign in. Every business has its own roster,
   so any of them works, and you can switch between them from the dashboard.
   In **Verify a reference**, enter `QBC-8X92-1F`, tick *"Is over 18?"* and hit
   **Verify** → a large **YES** with a verification reference and timestamp.
   Nothing else.
4. Open the **receipt** — a signed certificate. It opens inside the portal you
   verified from, same header and sidebar, so following one out of the history
   never drops you back onto the marketing site. Press **Re-check this receipt**:
   the signature is verified for real, in the browser, against the vault's public
   key. Edit a byte and the check fails.
5. Back on the holder's **dashboard**, the new check appears in the log. Hit
   **Revoke** on SafeBank NG → confirm → try verifying again as the business →
   **ACCESS REVOKED**.

Try these references in the verifier for different outcomes:

| Reference      | Outcome                                    |
| -------------- | ------------------------------------------ |
| `QBC-8X92-1F`  | Verified, over 18 → **YES**                |
| `QBC-7KD4-M3`  | Under 18 → **NO** on "Is over 18?"         |
| `QBC-9ZZZ-00`  | Not in the registry → **NO MATCH**         |
| any other QBC  | Self-asserted record → **CANNOT CONFIRM**  |

Reset all state anytime via **Reset demo data** in the footer. That re-runs the
seed, which is also how you pick up any change to the synthetic dataset — an
existing browser keeps the store it already has.

## Data provenance (hackathon compliance)

**All identity data in this application is synthetically generated for
demonstration purposes. No real personal information is used or stored.**

The dataset is a **curated cast**, not a raw PRNG dump: names appear in
screenshots and two of them are pinned to produce specific demo verdicts, so the
cast is authoritative and `lib/mockData/users.ts` is generated from it.

- `npm run generate:users` — rewrite `users.ts` from the cast in
  [`scripts/generate-mock-users.mjs`](scripts/generate-mock-users.mjs)
- `npm run check:users` — verify the committed file still matches that cast
  (unique refs/NINs, valid formats, anchors present, under-18 mix intact). This
  is the command that makes the provenance claim checkable rather than asserted.
- `node scripts/generate-mock-users.mjs --new` — invent a *fresh* cast into
  `users.new.ts` as a proposal; it never overwrites the curated file.

Names are mixed from invented pools, dates of birth deliberately span under-18
and over-18 so the age check has real YES/NO cases, and NINs are 11 random digits
matching no real registry entry or checksum. The dataset powers the verifier
portal search and the user dashboards (linked businesses + access history). No
real personal data was used, collected, or stored at any stage of development or
demonstration.

## Tech stack

- **Next.js 15** (App Router) · TypeScript · Tailwind CSS v4 · **shadcn/ui**
- State: React context (`state/app-context.tsx`) + mock API seam
  (`lib/mockApi.ts`) with `localStorage` persistence
- Crypto: `lib/vault.ts` — WebCrypto ECDSA P-256 receipt signing + AES-GCM
  at-rest sealing, keys held in IndexedDB (private half non-extractable)
- Synthetic seed: `lib/mockData/users.ts` + `lib/mockData/businesses.ts`

## Going live — what a real deployment adds

Every screen talks to one module — **`lib/mockApi.ts`**. It exposes the exact
async signatures a real backend needs (`enrollIdentityApi`,
`verifyReferenceApi`, `revokeGrantApi`, …), simulated latency, and a versioned
sealed store. To go live:

1. Replace `lib/mockApi.ts` bodies with Supabase calls (real auth, server-side
   KYC storage, real registry verification, audit-log persistence) — **keep the
   signatures**. The receipt payload shape in `receiptPayload()` is the contract
   the signatures cover; keep it stable or plan a key/version migration.
2. Move key custody server-side. Today the signing key lives in the browser,
   which makes the vault the root of trust. In production the key belongs in an
   HSM/KMS and receipts should chain to a published registry key.
3. Add the access controls a real deployment needs and this demo deliberately
   does not have: real authentication, rate limiting on reference lookups, and
   per-holder authorization on the identity switcher.
4. Delete the mock seed, or keep it only behind a `NEXT_PUBLIC_DEMO=1` flag.

## Screens

| Route                   | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `/`                     | Landing — two entry points (user / business)     |
| `/user/enroll`          | Enrollment form → generated reference            |
| `/user/dashboard`       | Overview — KPIs, 7-day chart, recent activity    |
| `/user/third-parties`   | Access list (revoke/approve/restore)             |
| `/user/activity`        | Read-only access log timeline                    |
| `/user/profile`         | Identity record (masked NIN, DOB, status)        |
| `/business/dashboard`   | Overview — KPIs, 7-day chart, recent checks      |
| `/business/users`       | Business roster + verification counts            |
| `/business/history`     | All signed checks, each linked to its receipt    |
| `/business/verify`      | Verifier portal — reference + checks → verdict   |
| `/receipt/[ref]`        | Proof-of-check receipt (inside the portal shell) |
| `/how-it-works`         | Plain-language trust page (judging criterion)    |
