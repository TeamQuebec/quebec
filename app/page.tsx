import Link from "next/link";
import {
  ArrowDown,
  Ban,
  Building2,
  Check,
  Fingerprint,
  Lock,
  Receipt,
  ScrollText,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { RolesSelector } from "@/components/landing/roles-selector";
import { LiveVerify } from "@/components/landing/live-verify";
import { Reveal } from "@/components/landing/reveal";

const BTN_DARK =
  "inline-flex items-center justify-center gap-1.5 rounded-[7px] bg-af-ink px-[18px] py-[11px] text-[14px] font-semibold text-white transition-colors hover:bg-af-dark";
const BTN_OUTLINE =
  "inline-flex items-center justify-center gap-1.5 rounded-[7px] border border-af-border-strong bg-transparent px-[18px] py-[11px] text-[14px] font-semibold text-af-ink transition-colors hover:border-af-ink";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-af-muted">
      {children}
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 font-display text-[clamp(2.2rem,4.5vw,3.6rem)] font-bold leading-[1] tracking-[-0.04em] text-af-ink">
        {title}
      </h2>
      {children && <p className="mt-5 max-w-[600px] text-base leading-relaxed text-af-muted">{children}</p>}
    </>
  );
}

export default function HomePage() {
  const capabilities: { cat: string; title: string; body: string; icon: LucideIcon }[] = [
    {
      cat: "Enroll",
      title: "Three fields. That's it.",
      body: "Name, DOB and NIN build the whole record — enough to answer any fact about you, and nothing more.",
      icon: Fingerprint,
    },
    {
      cat: "Verify",
      title: "Signed yes or no",
      body: "A business picks one fact. Quebec answers from your verified record — the data never leaves the vault.",
      icon: ShieldCheck,
    },
    {
      cat: "Access log",
      title: "Every check, on the record",
      body: "You see exactly who asked what, and when. A transparent trail you can audit yourself.",
      icon: ScrollText,
    },
    {
      cat: "Revoke",
      title: "Access ends in one tap",
      body: "Stop any business verifying you, anytime. Past receipts stay valid; new checks stop cold.",
      icon: Ban,
    },
    {
      cat: "Receipts",
      title: "Proof without the data",
      body: "Every answer is signed and re-checkable — proof for the shop and the regulator, never the record.",
      icon: Receipt,
    },
    {
      cat: "Minimal data",
      title: "Nothing extra to leak",
      body: "Only three fields exist. There is no deeper record to compromise or copy.",
      icon: Lock,
    },
  ];

  const steps = [
    {
      n: "01",
      title: "Enroll",
      body: "Three fields build your record — enough to answer any fact about you.",
    },
    {
      n: "02",
      title: "Share",
      body: "A reference, not a document. One string — QBC-8X92-1F — never an ID card.",
    },
    {
      n: "03",
      title: "Ask",
      body: "A business picks a single fact. Is this person over 18? One question at a time.",
    },
    {
      n: "04",
      title: "Verify",
      body: "A signed YES or NO comes back from your verified record. No data travels with it.",
    },
    {
      n: "05",
      title: "Log",
      body: "The check lands in your access log — and you can take the access back anytime.",
    },
  ];

  const checks = [
    { code: "CHK 001", title: "Over 18", desc: "Is the holder an adult?" },
    { code: "CHK 002", title: "Name match", desc: "Does the name match the holder?" },
    { code: "CHK 003", title: "NIN match", desc: "Is this NIN the holder's?" },
    { code: "CHK 004", title: "Verified identity", desc: "Is a verified identity on file?" },
  ];

  const builtOn = [
    "Next.js 15",
    "React 19",
    "TypeScript",
    "Tailwind v4",
    "shadcn/ui",
    "Mock API seam",
    "Signed receipts",
    "Row-level security · Phase 2",
  ];

  return (
    <div className="bg-af-bg">
      <LandingHeader />

      {/* ============ Hero ============ */}
      <section className="bg-af-bg">
        <div className="mx-auto grid max-w-[1280px] items-center gap-16 px-5 pb-20 pt-16 md:px-6 md:pb-28 md:pt-[100px] lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
          <div>
            <Eyebrow>Privacy-first identity verification</Eyebrow>
            <h1 className="mt-7 font-display text-[clamp(2rem,7vw,5.4rem)] font-bold leading-[0.95] tracking-[-0.045em] text-af-ink max-[480px]:leading-[1.08]">
              Prove a fact.
              <br />
              <span className="text-af-accent">Not the whole record.</span>
            </h1>
            <p className="mt-9 max-w-[560px] text-base leading-relaxed text-af-muted">
              Quebec lets a business confirm a single fact about a customer — their age, their
              name, that their identity is verified — without ever seeing the record behind it.
              Enroll in three fields. Share one reference. Get a signed yes or no.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/user/dashboard" className={BTN_DARK}>
                <UserRound className="h-4 w-4" />
                I&apos;m a user
              </Link>
              <Link href="/business/dashboard" className={BTN_OUTLINE}>
                <Building2 className="h-4 w-4" />
                I&apos;m a business
              </Link>
            </div>
          </div>

          <div className="lg:pl-6">
            <LiveVerify />
          </div>
        </div>

        {/* Status line */}
        <div className="border-t border-af-border bg-af-surface">
          <div className="mx-auto flex max-w-[1280px] items-center gap-2.5 px-5 py-3.5 md:px-6">
            <span className="h-2 w-2 shrink-0 rounded-full bg-af-accent" aria-hidden="true" />
            <p className="text-[13px] font-medium text-af-muted">
              Demo live — 18 synthetic identities on record · ICSC 2026, Track B
            </p>
          </div>
        </div>
      </section>

      {/* ============ Statistics strip ============ */}
      <section className="border-b border-af-border bg-af-surface">
        <div className="mx-auto grid max-w-[1280px] gap-y-12 px-5 py-20 md:grid-cols-4 md:divide-x md:divide-af-border md:px-6">
          {[
            { value: "3", label: "fields to enroll — name, DOB and NIN", accent: false },
            { value: "1", label: "reference to remember — all a business ever needs", accent: false },
            { value: "0", label: "documents ever shown to a verifier", accent: true },
            { value: "100%", label: "of checks logged, auditable and revocable", accent: false },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center text-center md:items-start md:justify-start md:px-8 md:first:pl-0 md:text-left"
            >
              <p
                className={
                  s.accent
                    ? "font-display text-[clamp(2.6rem,4vw,3.4rem)] font-bold leading-none tracking-[-0.03em] text-af-accent"
                    : "font-display text-[clamp(2.6rem,4vw,3.4rem)] font-bold leading-none tracking-[-0.03em] text-af-ink"
                }
              >
                {s.value}
              </p>
              <p className="mt-4 max-w-[240px] text-sm leading-relaxed text-af-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ Capabilities ============ */}
      <section id="capabilities" className="scroll-mt-[80px] bg-af-bg">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <SectionHeading eyebrow="Capabilities" title="One reference, many safe checks">
            The whole platform is one record and one reference. Every capability below works
            against them — nothing else is ever created, stored or shown.
          </SectionHeading>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c, i) => (
              <Reveal key={c.title} className="h-full" delay={i * 70}>
                <div className="flex h-full flex-col rounded-[14px] border border-af-border bg-af-surface p-8 shadow-[0_1px_2px_rgba(23,23,23,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-af-border-strong hover:shadow-[0_16px_32px_rgba(23,23,23,0.09)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-af-ink text-af-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                    <c.icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.08em] text-af-muted">
                    {c.cat}
                  </p>
                  <h3 className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-af-ink">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-af-muted">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ How it works ============ */}
      <section id="how-it-works" className="scroll-mt-[80px] border-t border-af-border bg-af-surface">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <SectionHeading eyebrow="How it works" title="From enrollment to signed answer">
            Five steps, end to end. No documents move, no data leaves, and every step is logged.
          </SectionHeading>
          <div className="mt-16">
            {/* Desktop — horizontal five-step process */}
            <div className="hidden gap-8 md:grid md:grid-cols-5">
              {steps.map((s) => (
                <div key={s.n} className="border-t-2 border-af-border pt-6">
                  <p className="font-mono text-sm text-af-accent">{s.n}</p>
                  <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em] text-af-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-af-muted">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
            {/* Mobile — vertical with down arrows */}
            <div className="md:hidden">
              {steps.map((s, i) => (
                <div key={s.n}>
                  <div className="flex gap-5">
                    <p className="shrink-0 font-mono text-sm text-af-accent">{s.n}</p>
                    <div>
                      <h3 className="text-lg font-semibold tracking-[-0.01em] text-af-ink">
                        {s.title}
                      </h3>
                      <p className="mt-2 max-w-[440px] text-sm leading-relaxed text-af-muted">
                        {s.body}
                      </p>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex justify-center py-5" aria-hidden="true">
                      <ArrowDown className="h-4 w-4 text-af-muted-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ Roles ============ */}
      <section id="roles" className="scroll-mt-[80px] border-t border-af-border bg-af-bg">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <SectionHeading eyebrow="Roles" title="One reference, three points of view">
            What each side of a check actually sees — and nothing else.
          </SectionHeading>
          <div className="mt-12">
            <RolesSelector />
          </div>
        </div>
      </section>

      {/* ============ Why minimal disclosure ============ */}
      <section className="border-t border-af-border bg-af-surface">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <SectionHeading eyebrow="Why a yes?" title="Minimal disclosure, by design">
            Quebec answers exactly what is asked — and nothing more. That is the whole point.
          </SectionHeading>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[10px] border border-af-border bg-af-border md:grid-cols-3">
            {[
              {
                cat: "Speed",
                title: "Seconds, not days",
                body: "A check returns instantly — no photocopying, no queues, no callbacks to the branch.",
              },
              {
                cat: "Privacy",
                title: "Only the answer leaves",
                body: "Your name, DOB and NIN never leave the vault. There is nothing for anyone to copy or store.",
              },
              {
                cat: "Trust",
                title: "Signed and re-checkable",
                body: "Every answer carries a signature a shop or a regulator can verify — without the record behind it.",
              },
            ].map((b) => (
              <div
                key={b.title}
                className="bg-af-surface p-8 transition-colors duration-300 hover:bg-af-surface-muted"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-af-muted">
                  {b.cat}
                </p>
                <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.02em] text-af-ink">
                  {b.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-af-muted">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Checks (rate card) ============ */}
      <section id="checks" className="scroll-mt-[80px] border-t border-af-border bg-af-bg">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <SectionHeading eyebrow="Checks" title="Common checks, rate-card simple">
            Every check a business might run. One reference unlocks them all — instantly, signed,
            and logged.
          </SectionHeading>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[10px] border border-af-border bg-af-border sm:grid-cols-2 lg:grid-cols-4">
            {checks.map((c) => (
              <div
                key={c.code}
                className="flex flex-col bg-af-surface p-7 transition-colors duration-300 hover:bg-af-surface-muted"
              >
                <p className="font-mono text-[12px] text-af-muted-2">{c.code}</p>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em] text-af-ink">
                  {c.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-af-muted">{c.desc}</p>
                <p className="mt-6 flex items-center gap-1.5 text-[12px] font-medium text-af-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-af-accent" aria-hidden="true" />
                  Signed · instant
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-af-muted">
            All checks are free during the pilot. No record data is ever returned — only the
            signed answer.
          </p>
        </div>
      </section>

      {/* ============ Pricing ============ */}
      <section id="pricing" className="scroll-mt-[80px] border-t border-af-border bg-af-surface">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <SectionHeading eyebrow="Pricing" title="Simple, per-verification pricing">
            One reference, one price per check. No tiers, no contracts — only what you verify.
          </SectionHeading>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {/* Pilot — free during the pilot */}
            <Reveal className="h-full">
              <div className="flex h-full flex-col border-2 border-af-border-strong bg-af-surface p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(23,23,23,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-12">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-af-muted-2">
                  Pilot
                </p>
                <p className="mt-6 font-display text-[clamp(2.6rem,5vw,3.6rem)] font-bold leading-none tracking-[-0.03em] text-af-ink">
                  ₦0
                  <span className="ml-2 align-middle text-base font-medium tracking-normal text-af-muted">
                    / verification
                  </span>
                </p>
                <p className="mt-4 text-sm leading-relaxed text-af-muted">
                  Free while we're in pilot. Everything below is included.
                </p>
                <ul className="mt-9 space-y-3.5">
                  {[
                    "Full platform access — both portals",
                    "Signed yes/no results in seconds",
                    "Tamper-evident receipts for every check",
                    "Dedicated demo onboarding",
                  ].map((li) => (
                    <li key={li} className="flex items-start gap-3 text-sm text-af-ink">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-af-accent" />
                      {li}
                    </li>
                  ))}
                </ul>
                <Link href="/user/dashboard" className={`${BTN_DARK} mt-10`}>
                  <UserRound className="h-4 w-4" />
                  I&apos;m a user
                </Link>
              </div>
            </Reveal>

            {/* Launch — per-verification, after the pilot */}
            <Reveal className="h-full" delay={120}>
              <div className="flex h-full flex-col border border-af-border bg-af-surface p-10 transition-all duration-300 hover:-translate-y-1 hover:border-af-border-strong hover:shadow-[0_16px_32px_rgba(23,23,23,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-12">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-af-muted-2">
                  Launch
                </p>
                <p className="mt-6 font-display text-[clamp(2.6rem,5vw,3.6rem)] font-bold leading-none tracking-[-0.03em] text-af-ink">
                  ₦50
                  <span className="ml-2 align-middle text-base font-medium tracking-normal text-af-muted">
                    / verification
                  </span>
                </p>
                <p className="mt-4 text-sm leading-relaxed text-af-muted">
                  For after the pilot. Pay only for checks you actually run.
                </p>
                <ul className="mt-9 space-y-3.5">
                  {[
                    "Per-check pricing — no subscriptions",
                    "The same signed answers, instantly",
                    "Volume pricing from 1,000 checks / mo",
                    "Team dashboard when the API ships",
                  ].map((li) => (
                    <li key={li} className="flex items-start gap-3 text-sm text-af-ink">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-af-accent" />
                      {li}
                    </li>
                  ))}
                </ul>
                <Link href="/business/dashboard" className={`${BTN_OUTLINE} mt-10`}>
                  <Building2 className="h-4 w-4" />
                  I&apos;m a business
                </Link>
              </div>
            </Reveal>
          </div>
          <p className="mt-6 text-[13px] text-af-muted">
            Prices shown are for the demo. All identity data is synthetic.
          </p>
        </div>
      </section>

      {/* ============ Built on ============ */}
      <section id="built-on" className="scroll-mt-[80px] border-t border-af-border bg-af-bg">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <SectionHeading eyebrow="Built on" title="The stack under the demo">
            A single mock-API seam stands in for every backend call — so the UI you see is the
            UI that ships.
          </SectionHeading>
          <div className="mt-10 flex flex-wrap gap-2.5">
            {builtOn.map((t) => (
              <span
                key={t}
                className="rounded-[6px] border border-af-border bg-af-surface px-3 py-1.5 font-mono text-[12px] text-af-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Final CTA ============ */}
      <section className="border-t border-af-border bg-af-surface">
        <div className="mx-auto max-w-[1280px] px-5 py-28 md:px-6">
          <h2 className="max-w-[820px] font-display text-[clamp(2.4rem,5vw,4.4rem)] font-bold leading-[1] tracking-[-0.04em] text-af-ink">
            Verify a fact.
            <br />
            Keep the whole record.
          </h2>
          <p className="mt-7 max-w-[600px] text-base leading-relaxed text-af-muted">
            Enroll an identity, share a reference, verify a fact, watch the access log — then
            take the access back. Two minutes, end to end.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/user/dashboard" className={BTN_DARK}>
              <UserRound className="h-4 w-4" />
              I&apos;m a user
            </Link>
            <Link href="/business/dashboard" className={BTN_OUTLINE}>
              <Building2 className="h-4 w-4" />
              I&apos;m a business
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
