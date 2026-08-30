import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  EyeOff,
  FileCheck2,
  Fingerprint,
  History,
  KeyRound,
  LayoutDashboard,
  Lock,
  Quote,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUSINESSES } from "@/lib/mockData/businesses";

/**
 * Product console mockup — the "fleet dashboard" moment of the landing.
 * Styled like a real SaaS console (browser frame, sidebar, live checks) so
 * judges immediately see the shape of the product, not just marketing copy.
 */
function HeroConsole() {
  const checks = [
    { icon: BadgeCheck, label: "Is the holder over 18?", answer: "YES" },
    { icon: UserCheck, label: "Name matches the request?", answer: "YES" },
    { icon: Fingerprint, label: "Verified identity on file?", answer: "YES" },
  ];
  const sidebar = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: ScanSearch, label: "Verify", active: false },
    { icon: History, label: "Access log", active: false },
    { icon: FileCheck2, label: "Receipts", active: false },
  ];

  return (
    <div className="relative mx-auto w-full max-w-lg">
      {/* Glow behind the frame */}
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-teal-500/25 via-transparent to-brand-500/25 blur-3xl" />

      {/* Browser frame */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-brand-950/90 shadow-2xl shadow-brand-950/50 backdrop-blur">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <p className="ref-plate text-[10px] tracking-wider text-brand-300">
            qbc.console · verification
          </p>
          <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
        </div>

        <div className="flex">
          {/* Mini sidebar */}
          <div className="hidden w-36 border-r border-white/10 p-3 sm:block">
            {sidebar.map((item) => (
              <div
                key={item.label}
                className={
                  item.active
                    ? "mb-1 flex items-center gap-2 rounded-lg bg-teal-500/15 px-2.5 py-1.5 text-xs font-semibold text-teal-300"
                    : "mb-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-brand-300/70"
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
            ))}
          </div>

          {/* Main panel */}
          <div className="flex-1 p-4">
            {/* Reference being checked */}
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-brand-300">Reference</p>
              <p className="ref-plate text-sm tracking-widest text-white">QBC-8X92-1F</p>
            </div>

            {/* Checks resolving to real answers */}
            <div className="mt-3 space-y-2">
              {checks.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5"
                >
                  <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-brand-100">
                    <c.icon className="h-3.5 w-3.5 shrink-0 text-teal-400" />
                    <span className="truncate">{c.label}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    {c.answer}
                  </span>
                </div>
              ))}
            </div>

            {/* The big answer */}
            <div className="mt-4 rounded-xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 px-4 py-4 text-center">
              <p className="text-[10px] uppercase tracking-[0.16em] text-brand-300">
                What the business sees
              </p>
              <p className="mt-1 font-display text-4xl font-bold text-emerald-400">YES</p>
              <p className="mt-1 text-[11px] text-brand-200">
                Signed · VFY-4N7C-2Q · Aug 30, 10:42 AM
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-brand-300">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Tamper-evident receipt issued
              </span>
              <span className="flex items-center gap-1">
                <EyeOff className="h-3 w-3" />
                No raw data shown
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -right-3 -top-3 rounded-full bg-teal-500 px-3 py-1 text-[11px] font-semibold text-brand-950 shadow-lg shadow-teal-500/30">
        Just a YES / NO
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-950">
        {title}
      </h2>
    </div>
  );
}

export default function HomePage() {
  const features = [
    {
      icon: KeyRound,
      title: "Enroll in three fields",
      body: "Name, date of birth and NIN — that's the whole record. Just enough to answer any yes/no fact about you.",
    },
    {
      icon: UserRound,
      title: "Share one reference",
      body: "You hand over QBC-8X92-1F, never your documents. Your record stays sealed in the vault.",
    },
    {
      icon: EyeOff,
      title: "They get only the answer",
      body: "A signed YES or NO to the exact check they ran. Your name, DOB and NIN never leave the vault.",
    },
    {
      icon: History,
      title: "Every check is logged",
      body: "Your dashboard shows who asked, what they asked, and when — a trail you can audit yourself.",
    },
    {
      icon: Lock,
      title: "Revoke access anytime",
      body: "One tap and a business can no longer verify you. Past receipts stay valid; new checks stop cold.",
    },
    {
      icon: FileCheck2,
      title: "Tamper-evident receipts",
      body: "Every result carries a signature a judge can re-check — proof of the check, never the data behind it.",
    },
  ];

  const steps = [
    {
      n: "01",
      title: "Share a reference",
      body: "You share your Quebec reference — like QBC-8X92-1F — never your documents. Your records stay in the vault.",
    },
    {
      n: "02",
      title: "Ask a yes / no question",
      body: "The shop asks Quebec: “Is this person over 18?”. The question is answered from your verified record.",
    },
    {
      n: "03",
      title: "Get a signed answer",
      body: "The shop gets a signed YES and a tamper-evident receipt — proof they checked, without the data behind it.",
    },
  ];

  const testimonials = [
    {
      quote:
        "We verify age for SIM registration every single day. Before Quebec we photocopied ID cards we then had to shred. Now it's a reference, a check, and a clean YES.",
      name: "Tunde",
      role: "Branch manager, QuickMart",
      initials: "TQ",
    },
    {
      quote:
        "I only hand out a reference now — no more copies of my ID at every shop. And I can see who checked me and take access back in one tap.",
      name: "Ada",
      role: "University student",
      initials: "AA",
    },
    {
      quote:
        "The receipt is the killer feature. Every YES we act on has a signature and a reference a regulator can re-check — without ever seeing the customer's record.",
      name: "Ngozi",
      role: "Compliance lead, SafeBank NG",
      initials: "NS",
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* ============ Hero ============ */}
      <section className="relative overflow-hidden bg-brand-950">
        <div className="bg-grid-light absolute inset-0 opacity-20" />
        <div className="absolute -top-44 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-10 lg:pt-24">
          <div className="animate-fade-up">
            <Badge className="mb-6 gap-1.5 border-teal-400/30 bg-teal-400/10 text-teal-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Privacy-first identity verification · demo
            </Badge>

            <h1 className="font-display text-4xl font-bold leading-[1.06] tracking-tight text-white sm:text-6xl">
              Prove a fact.
              <br />
              <span className="bg-gradient-to-r from-teal-300 to-teal-500 bg-clip-text text-transparent">
                Not the whole record.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-brand-200">
              Quebec lets a business confirm a single fact about a customer — their age, their
              name, that their identity is verified — without ever seeing the record behind it.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button size="lg" variant="accent" asChild>
                <Link href="/user/dashboard">
                  <UserRound className="h-4 w-4" />
                  I&apos;m a user
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                asChild
              >
                <Link href="/business/verify">
                  <Building2 className="h-4 w-4" />
                  I&apos;m a business
                </Link>
              </Button>
            </div>

            <p className="mt-6 flex items-center gap-1.5 text-xs text-brand-300">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-teal-400" />
              Two-minute demo · synthetic data only — nothing you type is real.
            </p>
          </div>

          <div className="animate-fade-up [animation-delay:150ms]">
            <HeroConsole />
          </div>
        </div>
      </section>

      {/* ============ Stats band ============ */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-10 px-4 py-14 sm:px-6 md:grid-cols-4">
          {[
            { value: "1", label: "reference to remember — the only thing you ever share" },
            { value: "0", label: "documents a verifier ever sees" },
            { value: "100%", label: "of checks logged, auditable and revocable" },
            { value: "2 min", label: "to run the whole demo story end-to-end" },
          ].map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <p className="font-display text-4xl font-bold tracking-tight text-brand-950">
                {s.value}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ Trusted-by strip ============ */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Demo businesses already on the network
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {BUSINESSES.map((b) => (
              <span key={b.id} className="text-sm font-semibold text-brand-400">
                {b.name}
              </span>
            ))}
          </div>
          <p className="mt-6 text-center text-xs italic text-muted-foreground">
            All names are synthetic — no real company is affiliated with this demo.
          </p>
        </div>
      </section>

      {/* ============ Features ============ */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="Why Quebec" title="Built for trust, by design" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-brand-950">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ How it works ============ */}
      <section className="border-t border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="How it works" title="Three steps. Zero exposure." />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-xl border border-border bg-white p-6 shadow-sm">
                <span className="font-display text-3xl font-bold text-brand-200">{s.n}</span>
                <h3 className="mt-3 font-semibold text-brand-950">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="link" className="text-teal-700" asChild>
              <Link href="/how-it-works">
                Why should a shop trust a YES?
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ Testimonials ============ */}
      <section className="border-t border-border bg-brand-50/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="In the field" title="What the demo feels like" />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm">
                <Quote className="h-5 w-5 text-teal-500" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-brand-900">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-dashed border-border pt-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-800 text-xs font-semibold text-white">
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-950">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-8 text-center text-xs italic text-muted-foreground">
            Synthetic personas, written for the demo.
          </p>
        </div>
      </section>

      {/* ============ CTA band ============ */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-teal-900 px-6 py-12 text-center shadow-xl sm:px-12">
            <div className="bg-grid-light absolute inset-0 opacity-20" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold tracking-tight text-white">
                Ready to try the demo?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-brand-100/80">
                Run the full story in two minutes: enroll an identity, verify a fact, watch the
                access log — then take the access back.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" variant="accent" asChild>
                  <Link href="/user/dashboard">
                    <UserRound className="h-4 w-4" />
                    I&apos;m a user
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  asChild
                >
                  <Link href="/business/verify">
                    <Building2 className="h-4 w-4" />
                    I&apos;m a business
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
