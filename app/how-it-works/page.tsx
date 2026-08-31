import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  EyeOff,
  FileX2,
  Fingerprint,
  History,
  KeyRound,
  Lock,
  QrCode,
  Scale,
  ShieldCheck,
  Stamp,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  {
    n: "01",
    title: "The holder shares a reference — not their ID",
    body: "Your name, date of birth and NIN stay inside Quebec's vault. The only thing you share with a shop is a short reference like QBC-8X92-1F — which is useless on its own.",
    icon: Fingerprint,
    chip: "You share this",
    chipValue: "QBC-8X92-1F",
  },
  {
    n: "02",
    title: "The business asks a yes / no question",
    body: "The shop asks Quebec: “Is this person over 18?”. The answer is computed from your verified record — the record itself never leaves the vault, and the shop can't ask for your DOB or NIN.",
    icon: Scale,
    chip: "They see this",
    chipValue: "Over 18?  →",
  },
  {
    n: "03",
    title: "They get a signed answer and a receipt",
    body: "The shop receives an unambiguous YES — signed, timestamped and tied to a tamper-evident receipt. The receipt proves the check happened, without exposing the data behind it.",
    icon: Stamp,
    chip: "They keep this",
    chipValue: "Receipt · VFY-…",
  },
];

const TRUST_POINTS = [
  {
    icon: Stamp,
    title: "The YES is signed & sealed",
    body: "Every answer carries a cryptographic record hash. Change a single byte on the receipt — the timestamp, the answer, anything — and the signature breaks. There is no way to edit a YES after the fact.",
  },
  {
    icon: ShieldCheck,
    title: "The answer comes from a real record",
    body: "The shop isn't trusting a piece of paper someone typed. The YES is generated from a verified identity record held by Quebec — the same kind of record a bank or NIMC would rely on. Faking the answer means breaking the vault, not forging a document.",
  },
  {
    icon: History,
    title: "Every check is auditable & revocable",
    body: "The holder sees every check on their dashboard and can revoke access at any time. A business that shows a fake receipt gets caught — and a business that loses access can't check anything more.",
  },
];

const COMPARISON: { label: string; withId: string; withQuebec: string }[] = [
  {
    label: "What the shop sees",
    withId: "Your full ID: name, photo, DOB, NIN",
    withQuebec: "Just YES or NO",
  },
  {
    label: "Where your data lives after",
    withId: "Copied into the shop's files & cloud",
    withQuebec: "Nowhere — nothing is copied or stored",
  },
  {
    label: "Can the copy be re-used elsewhere?",
    withId: "Yes — anyone who sees it can reuse it",
    withQuebec: "No — the reference only answers the questions you allow",
  },
  {
    label: "Can you take access back?",
    withId: "No — a photocopy can't be un-copied",
    withQuebec: "Yes — revoke in one tap, anytime",
  },
  {
    label: "Proof you were checked fairly",
    withId: "A scan that can be edited",
    withQuebec: "A signed, tamper-evident receipt",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="bg-grid border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <Badge className="gap-1.5 border-gold-border bg-gold-soft text-gold-deep">
            <ShieldCheck className="h-3.5 w-3.5" />
            How Quebec works
          </Badge>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-brand-950 sm:text-5xl">
            Trust the answer.
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-gold bg-clip-text text-transparent">
              Not the file.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Today, proving you&apos;re old enough for a sim card means handing over your entire
            ID. Quebec inverts that: a business asks a single question, and gets a single,
            verifiable answer — without ever seeing the whole record.
          </p>
        </div>
      </section>

      {/* 3-step diagram */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              {i < STEPS.length - 1 && (
                <div className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-500 shadow-sm">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              )}
              <div className="flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl font-bold text-brand-200">{s.n}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-soft text-gold-strong">
                    <s.icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug text-brand-950">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                <div className="mt-5 rounded-lg border border-dashed border-brand-200 bg-brand-50/50 px-3.5 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-400">
                    {s.chip}
                  </p>
                  <p className="ref-plate mt-0.5 text-sm font-semibold text-brand-900">{s.chipValue}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why trust a YES */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-strong">
              For the business
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-950">
              Why trust a YES instead of the ID?
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The YES is not a screenshot. It is a cryptographically signed statement generated
              from a verified identity record, stamped with the time it was issued and bound to a
              reference only the holder controls.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Keep the receipt. If a dispute reaches a judge or auditor, you can present it — and
              it verifies instantly. Meanwhile the holder&apos;s privacy is intact and your
              business no longer stores copies of documents it doesn&apos;t need.
            </p>
            <Button className="mt-7" variant="brand" asChild>
              <Link href="/business/verify">
                <Building2 className="h-4 w-4" />
                Try it — verify a reference
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {TRUST_POINTS.map((t) => (
              <div key={t.title} className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <t.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-brand-950">{t.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What stops a fake YES */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-strong">
            Security model
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-950">
            What stops someone faking a YES?
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Lock,
              title: "1 · The reference can't be reused",
              body: "A reference is bound to one holder. Borrowing someone else's reference answers nothing about you — and every check is logged to that holder, who sees it.",
            },
            {
              icon: FileX2,
              title: "2 · Receipts can't be forged",
              body: "Each receipt is sealed with a record hash. Screenshot it, edit it, re-upload it — the signature won't match, and anyone can re-verify.",
            },
            {
              icon: EyeOff,
              title: "3 · No data to steal, no data to leak",
              body: "The shop never receives personal data, so there's nothing on their devices or servers to leak or sell. The least data is the safest data.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-soft text-gold-strong">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold leading-snug text-brand-950">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-t border-border bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-strong">
              See the difference
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-950">
              Your ID card vs. your Quebec reference
            </h2>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-border shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-brand-50/70">
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-5">
                    What happens
                  </th>
                  <th className="px-4 py-3.5 sm:px-5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400">
                      <BadgeCheck className="h-4 w-4" />
                      With your ID card
                    </span>
                  </th>
                  <th className="px-4 py-3.5 sm:px-5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-strong">
                      <QrCode className="h-4 w-4" />
                      With Quebec
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COMPARISON.map((row) => (
                  <tr key={row.label}>
                    <td className="px-4 py-3.5 font-medium text-brand-950 sm:px-5">{row.label}</td>
                    <td className="px-4 py-3.5 text-muted-foreground sm:px-5">
                      <span className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                        {row.withId}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <span className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        {row.withQuebec}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 px-6 py-12 text-center shadow-xl sm:px-12">
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white">
              Prove a fact. Reveal nothing.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-brand-100/80">
              Two minutes to see the full story: enroll, verify, check the log, revoke access.
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
                <Link href="/business/dashboard">
                  <Building2 className="h-4 w-4" />
                  I&apos;m a business
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <p className="mx-auto -mt-8 mb-16 flex max-w-xl items-center justify-center gap-1.5 px-4 text-center text-xs text-muted-foreground">
        <KeyRound className="h-3.5 w-3.5 text-gold-strong" />
        In this demo the “signature” is a deterministic hash. Phase 2 wires in real signing and
        verification against the backend.
      </p>
    </div>
  );
}
