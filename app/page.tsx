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
import { BTN_DARK, BTN_OUTLINE } from "@/components/landing/buttons";
import { RolesSelector } from "@/components/landing/roles-selector";
import { LiveVerify } from "@/components/landing/live-verify";
import { CountUp } from "@/components/landing/count-up";
import { ScrollTop } from "@/components/landing/scroll-top";
import { Reveal } from "@/components/landing/reveal";
import { Eyebrow, SectionHeading } from "@/components/landing/section-heading";

export default function HomePage() {
  const capabilities: { cat: string; title: string; body: string; icon: LucideIcon }[] = [
    {
      cat: "Enroll",
      title: "Three fields. That's it.",
      body: "Name, DOB and NIN build the whole record : enough to answer any fact about you, and nothing more.",
      icon: Fingerprint,
    },
    {
      cat: "Verify",
      title: "Signed yes or no",
      body: "A business picks one fact. Quebec answers from your verified record : the data never leaves the vault.",
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
      body: "Every answer is signed and re-checkable : proof for the shop and the regulator, never the record.",
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
      body: "Three fields build your record : enough to answer any fact about you.",
    },
    {
      n: "02",
      title: "Share",
      body: "A reference, not a document. One string : QBC-8X92-1F : never an ID card.",
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
      body: "The check lands in your access log : and you can take the access back anytime.",
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
    "AES-GCM at rest",
  ];

  return (
    <div className="bg-af-bg">
      <LandingHeader />

      {/* ============ Hero ============ */}
      <section className="bg-af-bg">
        <div className="mx-auto grid max-w-[1280px] items-center gap-16 px-5 pb-20 pt-16 md:px-6 md:pb-28 md:pt-[100px] lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
          <div>
            <Eyebrow className="animate-rise motion-reduce:animate-none">
              Privacy-first identity verification
            </Eyebrow>
            <h1
              className="mt-7 animate-rise font-display text-[clamp(2rem,7vw,5.4rem)] font-bold leading-[1.05] tracking-[-0.045em] text-af-ink motion-reduce:animate-none max-[480px]:leading-[1.08]"
              style={{ animationDelay: "90ms" }}
            >
              Prove a fact.
              <br />
              {/* Gold as a field, not as text. As text it measured 1.51:1 on this
                  ground; as a marker behind near-black ink it is 11:1, and at this
                  size the colour reads louder than it ever did in thin strokes.
                  leading is 1.05 so the band clears the glyphs.

                  The field wipes in rather than simply being there — see
                  .band-wipe in globals.css for why it is a background and not an
                  absolutely-positioned slab. Delayed past the headline's own
                  rise, so the words land and the highlighter follows them. */}
              <span
                className="band-wipe animate-band rounded-[6px] px-3 text-af-ink motion-reduce:animate-none"
                style={{ animationDelay: "500ms" }}
              >
                Not the whole record.
              </span>
            </h1>
            <p
              className="mt-9 max-w-[560px] animate-rise text-base leading-relaxed text-af-muted motion-reduce:animate-none"
              style={{ animationDelay: "200ms" }}
            >
              Quebec lets a business confirm a single fact about a customer : their age, their
              name, that their identity is verified : without ever seeing the record behind it.
              Enroll in three fields. Share one reference. Get a signed yes or no.
            </p>
            <div
              className="mt-10 flex animate-rise flex-wrap items-center gap-3 motion-reduce:animate-none"
              style={{ animationDelay: "310ms" }}
            >
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

          <div
            className="animate-rise motion-reduce:animate-none lg:pl-6"
            style={{ animationDelay: "260ms" }}
          >
            <LiveVerify />
          </div>
        </div>

        {/* Status line */}
        <div className="border-t border-af-border bg-af-surface">
          <div className="mx-auto flex max-w-[1280px] items-center gap-2.5 px-5 py-3.5 md:px-6">
            <span className="h-2 w-2 shrink-0 rounded-full bg-af-accent" aria-hidden="true" />
            <p className="text-[13px] font-medium text-af-muted">
              Demo live : 18 synthetic identities on record · ICSC 2026, Track B
            </p>
          </div>
        </div>
      </section>

      {/* ============ Statistics strip ============ */}
      <section className="border-b border-af-border bg-af-surface">
        <div className="mx-auto grid max-w-[1280px] gap-y-12 px-5 py-20 md:grid-cols-4 md:divide-x md:divide-af-border md:px-6">
          {[
            { value: "3", label: "fields to enroll : name, DOB and NIN", absence: false },
            { value: "1", label: "reference to remember : all a business ever needs", absence: false },
            { value: "0", label: "documents ever shown to a verifier", absence: true },
            { value: "100%", label: "of checks logged, auditable and revocable", absence: false },
          ].map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 90}
              variant="zoom"
              className="flex flex-col items-center justify-center text-center md:items-start md:justify-start md:px-8 md:first:pl-0 md:text-left"
            >
              {/* The zero is the thesis, so it gets the product's ABSENCE mark — the
                  dashed edge <AbsenceNote> uses — rather than a colour. It was the
                  one gold numeral in the strip, which spent the accent on "a
                  statistic" and left "nothing" looking like an ordinary figure.
                  Ink plus a broken rule under it reads as the deliberate gap it
                  is; the space around it does the rest. */}
              <p className="font-display text-[clamp(2.6rem,4vw,3.4rem)] font-bold leading-none tracking-[-0.03em] text-af-ink">
                {/* Counts up when it scrolls in. "0" is the one value that does
                    nothing, which is exactly right — there is no smaller number
                    to come up from, and the point is that it stays empty. */}
                <CountUp value={s.value} />
              </p>
              {s.absence ? (
                <span
                  aria-hidden="true"
                  className="mt-3 h-0 w-16 border-t-2 border-dashed border-af-border-strong"
                />
              ) : (
                <span aria-hidden="true" className="mt-3 h-0 w-16 border-t-2 border-transparent" />
              )}
              <p className="mt-4 max-w-[240px] text-sm leading-relaxed text-af-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ Capabilities ============ */}
      <section id="capabilities" className="scroll-mt-[80px] bg-af-bg">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <Reveal>
            <SectionHeading eyebrow="Capabilities" title="One reference, many safe checks">
              The whole platform is one record and one reference. Every capability below works
              against them : nothing else is ever created, stored or shown.
            </SectionHeading>
          </Reveal>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c, i) => (
              /* Zoom, not rise: a card is an object you pick up, so it arrives by
                 coming forward rather than by travelling up the page. */
              <Reveal key={c.title} className="h-full" delay={i * 70} variant="zoom">
                <div className="flex h-full flex-col rounded-[14px] border border-af-border bg-af-surface p-8 shadow-[0_1px_2px_rgba(23,23,23,0.05)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-af-border-strong hover:shadow-[0_16px_32px_rgba(23,23,23,0.09)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100">
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
          <Reveal>
            <SectionHeading eyebrow="How it works" title="From enrollment to signed answer">
              Five steps, end to end. No documents move, no data leaves, and every step is logged.
            </SectionHeading>
          </Reveal>
          <div className="mt-16">
            {/* Desktop : horizontal five-step process */}
            <div className="hidden gap-8 md:grid md:grid-cols-5">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 110} variant="left">
                  {/* The rule draws itself in, left to right. This section is a
                      sequence, so the marks separating the steps arrive in
                      sequence too — and each one draws in the direction the
                      steps are read. See .rule-draw in globals.css. */}
                  <span
                    aria-hidden="true"
                    className="rule-draw block h-0.5 w-full bg-af-border"
                    style={{ transitionDelay: `${i * 110}ms` }}
                  />
                  <p className="mt-6 font-mono text-sm text-af-muted">{s.n}</p>
                  <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em] text-af-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-af-muted">
                    {s.body}
                  </p>
                </Reveal>
              ))}
            </div>
            {/* Mobile : vertical with down arrows */}
            <div className="md:hidden">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 80}>
                  <div className="flex gap-5">
                    <p className="shrink-0 font-mono text-sm text-af-muted">{s.n}</p>
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
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ Roles ============ */}
      <section id="roles" className="scroll-mt-[80px] border-t border-af-border bg-af-bg">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <Reveal>
            <SectionHeading eyebrow="Roles" title="One reference, three points of view">
              What each side of a check actually sees : and nothing else.
            </SectionHeading>
          </Reveal>
          <Reveal className="mt-12" variant="zoom" delay={80}>
            <RolesSelector />
          </Reveal>
        </div>
      </section>

      {/* ============ Why minimal disclosure ============ */}
      <section className="border-t border-af-border bg-af-surface">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <Reveal>
            <SectionHeading eyebrow="Why a yes?" title="Minimal disclosure, by design">
              Quebec answers exactly what is asked : and nothing more. That is the whole point.
            </SectionHeading>
          </Reveal>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[10px] border border-af-border bg-af-border md:grid-cols-3">
            {[
              {
                cat: "Speed",
                title: "Seconds, not days",
                body: "A check returns instantly : no photocopying, no queues, no callbacks to the branch.",
              },
              {
                cat: "Privacy",
                title: "Only the answer leaves",
                body: "Your name, DOB and NIN never leave the vault. There is nothing for anyone to copy or store.",
              },
              {
                cat: "Trust",
                title: "Signed and re-checkable",
                body: "Every answer carries a signature a shop or a regulator can verify : without the record behind it.",
              },
            ].map((b, i) => (
              /* bg on the wrapper as well as the panel — the grid draws its
                 hairlines with gap-px over a bg-af-border ground, so a
                 transparent wrapper would flash grey as the panel fades in. */
              <Reveal key={b.title} delay={i * 110} className="bg-af-surface" variant="left">
                <div className="h-full bg-af-surface p-8 transition-colors duration-300 hover:bg-af-surface-muted">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-af-muted">
                    {b.cat}
                  </p>
                  <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.02em] text-af-ink">
                    {b.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-af-muted">{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Checks (rate card) ============ */}
      <section id="checks" className="scroll-mt-[80px] border-t border-af-border bg-af-bg">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <Reveal>
            <SectionHeading eyebrow="Checks" title="Common checks, rate-card simple">
              Every check a business might run. One reference unlocks them all : instantly, signed,
              and logged.
            </SectionHeading>
          </Reveal>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[10px] border border-af-border bg-af-border sm:grid-cols-2 lg:grid-cols-4">
            {checks.map((c, i) => (
              /* bg on the Reveal as well as the card: the grid paints hairlines
                 with gap-px over a bg-af-border ground, so a transparent wrapper
                 would flash grey behind each card as it fades up. */
              <Reveal key={c.code} delay={i * 80} className="bg-af-surface" variant="zoom">
                <div className="flex h-full flex-col bg-af-surface p-7 transition-colors duration-300 hover:bg-af-surface-muted">
                  <p className="font-mono text-[12px] text-af-muted">{c.code}</p>
                  <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em] text-af-ink">
                    {c.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-af-muted">{c.desc}</p>
                  {/* Was gold text on a gold dot. This is an eyebrow and a bullet —
                      neither is one of gold's three jobs. */}
                  <p className="mt-6 flex items-center gap-1.5 text-[12px] font-medium text-af-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-af-ink" aria-hidden="true" />
                    Signed · instant
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-af-muted">
            All checks are free during the pilot. No record data is ever returned : only the
            signed answer.
          </p>
        </div>
      </section>

      {/* ============ Pricing ============ */}
      <section id="pricing" className="scroll-mt-[80px] border-t border-af-border bg-af-surface">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <Reveal>
            <SectionHeading eyebrow="Pricing" title="Simple, per-verification pricing">
              One reference, one price per check. No tiers, no contracts : only what you verify.
            </SectionHeading>
          </Reveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {/* Pilot : free during the pilot. The two plans converge from
                opposite sides — they are being compared, so they arrive facing
                each other. */}
            <Reveal className="h-full" variant="left">
              <div className="flex h-full flex-col border-2 border-af-border-strong bg-af-surface p-10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(23,23,23,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 md:p-12">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-af-muted">
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
                    "Full platform access : both portals",
                    "Signed yes/no results in seconds",
                    "Tamper-evident receipts for every check",
                    "Dedicated demo onboarding",
                  ].map((li) => (
                    <li key={li} className="flex items-start gap-3 text-sm text-af-ink">
                      {/* An "included" tick is the system attesting to the plan's
                          own integrity, which is green's axis — not gold's. Gold
                          was also doing "step numeral" on this page; both are off
                          the list now. */}
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-verify" />
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

            {/* Launch : per-verification, after the pilot */}
            <Reveal className="h-full" delay={120} variant="right">
              <div className="flex h-full flex-col border border-af-border bg-af-surface p-10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-af-border-strong hover:shadow-[0_16px_32px_rgba(23,23,23,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 md:p-12">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-af-muted">
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
                    "Per-check pricing : no subscriptions",
                    "The same signed answers, instantly",
                    "Volume pricing from 1,000 checks / mo",
                    "Team dashboard when the API ships",
                  ].map((li) => (
                    <li key={li} className="flex items-start gap-3 text-sm text-af-ink">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-verify" />
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
          <Reveal>
            <SectionHeading eyebrow="Built on" title="The stack under the demo">
              A single mock-API seam stands in for every backend call : so the UI you see is the
              UI that ships.
            </SectionHeading>
          </Reveal>
          <div className="mt-10 flex flex-wrap gap-2.5">
            {/* Chips pop in one after another — a short, low stagger, because a
                tag cloud has no reading order worth pacing. */}
            {builtOn.map((t, i) => (
              <Reveal key={t} delay={i * 45} variant="zoom" className="flex">
                <span className="inline-block rounded-[6px] border border-af-border bg-af-surface px-3 py-1.5 font-mono text-[12px] text-af-muted transition-colors duration-300 hover:border-af-border-strong hover:text-af-ink">
                  {t}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Final CTA ============ */}
      <section className="border-t border-af-border bg-af-surface">
        <div className="mx-auto max-w-[1280px] px-5 py-28 md:px-6">
          <Reveal>
            <h2 className="max-w-[820px] font-display text-[clamp(2.4rem,5vw,4.4rem)] font-bold leading-[1] tracking-[-0.04em] text-af-ink">
              Verify a fact.
              <br />
              Keep the whole record.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-7 max-w-[600px] text-base leading-relaxed text-af-muted">
              Enroll an identity, share a reference, verify a fact, watch the access log : then
              take the access back. Two minutes, end to end.
            </p>
          </Reveal>
          <Reveal delay={220} className="mt-10">
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/user/dashboard" className={BTN_DARK}>
                <UserRound className="h-4 w-4" />
                I&apos;m a user
              </Link>
              <Link href="/business/dashboard" className={BTN_OUTLINE}>
                <Building2 className="h-4 w-4" />
                I&apos;m a business
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
      <ScrollTop />
    </div>
  );
}
