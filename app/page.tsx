import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  EyeOff,
  Fingerprint,
  History,
  KeyRound,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Miniature of the real verifier result — makes the concept instant. */
function HeroResultCard() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-200/60 via-transparent to-teal-200/60 blur-2xl" />
      <div className="relative rounded-2xl border border-border bg-white p-6 shadow-xl shadow-brand-900/10">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            SafeBank NG · Verification result
          </p>
          <Badge variant="outline" className="text-brand-700">
            <Fingerprint className="mr-1 h-3 w-3" />
            QBC reference
          </Badge>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 py-4">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-100/60">
            <BadgeCheck className="h-10 w-10 text-emerald-600" strokeWidth={2.2} />
          </span>
          <p className="font-display text-5xl font-bold tracking-tight text-emerald-600">
            YES
          </p>
          <p className="text-center text-sm text-muted-foreground">
            The holder is over 18. Confirmed against a verified record.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-dashed border-border pt-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Reference
            </p>
            <p className="ref-plate text-xs text-brand-900">VFY-4N7C-2Q</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Timestamp
            </p>
            <p className="text-xs text-brand-900">Aug 30, 10:42 AM</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-brand-50 px-3 py-2.5">
          <EyeOff className="h-3.5 w-3.5 text-brand-500" />
          <p className="text-xs font-medium text-brand-800">
            No name · No DOB · No NIN were revealed
          </p>
        </div>
      </div>

      <div className="absolute -right-3 -top-3 hidden sm:block">
        <Badge className="bg-teal-600 px-3 py-1 text-[11px] shadow-lg shadow-teal-600/30">
          Just a YES / NO
        </Badge>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="bg-grid relative">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-20">
          <div className="animate-fade-up">
            <Badge className="mb-5 gap-1.5 border-teal-200 bg-teal-50 text-teal-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              Privacy-first identity verification
            </Badge>

            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-brand-950 sm:text-5xl">
              Verify a fact.
              <br />
              <span className="bg-gradient-to-r from-brand-600 to-teal-600 bg-clip-text text-transparent">
                Not the whole record.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              Quebec lets you confirm a single fact about someone — their age,
              their name, that they have a verified identity — without ever
              exposing their full identity record.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href="/user/dashboard"
                className="group relative overflow-hidden rounded-xl border border-brand-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
              >
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <UserRound className="h-5 w-5" />
                </span>
                <p className="font-semibold text-brand-950">
                  I&apos;m a user
                  <ArrowRight className="ml-1 inline h-4 w-4 text-brand-400 transition-transform group-hover:translate-x-0.5" />
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Enroll once. Manage who can check facts about you — and revoke
                  them anytime.
                </p>
              </Link>

              <Link
                href="/business/verify"
                className="group relative overflow-hidden rounded-xl border border-teal-200 bg-gradient-to-b from-teal-50/70 to-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
              >
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <Building2 className="h-5 w-5" />
                </span>
                <p className="font-semibold text-brand-950">
                  I&apos;m a business
                  <ArrowRight className="ml-1 inline h-4 w-4 text-teal-500 transition-transform group-hover:translate-x-0.5" />
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Verify a customer with just their reference. See only what you
                  need — nothing more.
                </p>
              </Link>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:150ms]">
            <HeroResultCard />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto grid max-w-6xl gap-px overflow-hidden px-4 py-10 sm:px-6 md:grid-cols-3">
          {[
            {
              icon: KeyRound,
              title: "You stay in control",
              body: "Facts are verified from your record. No one ever copies your documents, and you can revoke access any time.",
            },
            {
              icon: EyeOff,
              title: "They see only the answer",
              body: "A single, unambiguous YES or NO. Your name, date of birth and NIN are never shown.",
            },
            {
              icon: History,
              title: "Every check is logged",
              body: "You see exactly who checked what, and when — a transparent trail you can audit yourself.",
            },
          ].map((f) => (
            <div key={f.title} className="flex gap-4 px-1 py-4 md:px-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-brand-950">{f.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3-step teaser */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-950">
            Three steps. Zero exposure.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
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
          ].map((s) => (
            <div
              key={s.n}
              className="relative rounded-xl border border-border bg-white p-6 shadow-sm"
            >
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
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-teal-900 px-6 py-12 text-center shadow-xl sm:px-12">
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white">
              Ready to try the demo?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-brand-100/80">
              Run the full story in two minutes: enroll an identity, verify a
              fact, watch the access log — then take the access back.
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
      </section>
    </div>
  );
}
