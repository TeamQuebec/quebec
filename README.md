# Quebec — Verify a fact, not the whole record

**Privacy-preserving KYC verification** · ICSC 2026, Track B — *Digital Identity &
Trust: proving a fact without revealing the whole record.*

Quebec lets a business confirm a **single fact** about someone — their age, their
name, that they hold a verified identity — without ever seeing the full identity
record. The holder shares a short reference (`QBC-8X92-1F`), the business asks a
yes/no question, and Quebec returns a **signed YES/NO plus a tamper-evident
receipt**. No name, DOB or NIN is ever shown.

> **Phase 1 (this repo):** complete, clickable UI/UX with mock data only.
> No Supabase, no encryption, no real verification logic. Everything runs in
> React state + `localStorage`.

---

## Run it

```bash
npm install
npm run dev        # → http://localhost:3000
```

## The 2-minute demo story

1. **Landing** → choose *"I'm a user"*.
2. **Enroll** — fill the form (or hit **Try a demo identity**) and submit. You
   get a permanent reference like `QBC-8X92-1F` — the only thing you ever share.
3. **Dashboard** — see businesses that hold access, a pending request, and a
   read-only **access log** with receipts.
4. Switch to **"I'm a business"** → **Verifier portal**. Enter
   `QBC-8X92-1F`, tick *"Is over 18?"* and hit **Verify** → a large **YES** with a
   verification reference and timestamp. Nothing else.
5. Open the **receipt** — a tamper-evident certificate (record hash + seal).
6. Back on the **dashboard**, the new check appears in the log. Hit **Revoke**
   on SafeBank NG → confirm → try verifying again as the business →
   **ACCESS REVOKED**.

Try these references in the verifier for different outcomes:

| Reference      | Outcome                                    |
| -------------- | ------------------------------------------ |
| `QBC-8X92-1F`  | Verified, over 18 → **YES**                |
| `QBC-7KD4-M3`  | Under 18 → **NO** on "Is over 18?"         |
| `QBC-9ZZZ-00`  | Not in the registry → **NO MATCH**         |
| any other QBC  | Self-asserted record → **CANNOT CONFIRM**  |

Reset all state anytime via **Reset demo data** in the footer.

## Data provenance (hackathon compliance)

**All identity data in this application is synthetically generated for
demonstration purposes. No real personal information is used or stored.**

We generated every test identity with `scripts/generate-mock-users.mjs`
(`npm run generate:users`): a seeded script that produces plausible-but-fake
Nigerian-style full names (mixed from invented name pools), random dates of
birth (deliberately mixing under-18 and over-18 ages so the age check has real
YES/NO cases), and 11-digit NIN-format numbers that resemble no real registry
entry or checksum. The dataset powers the verifier portal search and the
user dashboards (linked businesses + access history). No real personal data was
used, collected, or stored at any stage of development or demonstration.

## Tech stack

- **Next.js 15** (App Router) · TypeScript · Tailwind CSS v4 · **shadcn/ui**
- State: React context (`state/app-context.tsx`) + mock API seam
  (`lib/mockApi.ts`) with `localStorage` persistence
- Synthetic seed: `lib/mockData/users.ts` + `lib/mockData/businesses.ts`

## Where Phase 2 plugs in

Every screen talks to one module — **`lib/mockApi.ts`**. It exposes the exact
async signatures the future backend needs (`enrollIdentityApi`,
`verifyReferenceApi`, `revokeGrantApi`, …), simulated latency, and a versioned
`localStorage` store. To go live:

1. Replace `lib/mockApi.ts` bodies with Supabase calls (auth, encrypted KYC
   storage, real verification, audit-log persistence) — **keep the signatures**.
2. Swap `pseudoHash()` in `lib/refs.ts` for a real signed digest.
3. Delete the mock seed, or keep it only behind a `NEXT_PUBLIC_DEMO=1` flag.

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
| `/receipt/[ref]`        | Tamper-evident proof-of-check receipt            |
| `/how-it-works`         | Plain-language trust page (judging criterion)    |
