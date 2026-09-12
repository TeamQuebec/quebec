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
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { BTN_DARK } from "@/components/landing/buttons";
import { SectionHeading } from "@/components/landing/section-heading";

const STEPS = [
  {
    n: "01",
    title: "The holder shares a reference : not their ID",
    body: "Your name, date of birth and NIN stay inside Quebec's vault. The only thing you share with a shop is a short reference like QBC-8X92-1F : which is useless on its own.",
    icon: Fingerprint,
    chip: "You share this",
    chipValue: "QBC-8X92-1F",
  },
  {
    n: "02",
    title: "The business asks a yes / no question",
    body: "The shop asks Quebec: “Is this person over 18?”. The answer is computed from your verified record : the record itself never leaves the vault, and the shop can't ask for your DOB or NIN.",
    icon: Scale,
    chip: "They see this",
    chipValue: "Over 18?  →",
  },
  {
    n: "03",
    title: "They get a signed answer and a receipt",
    body: "The shop receives an unambiguous YES : signed, timestamped and tied to a tamper-evident receipt. The receipt proves the check happened, without exposing the data behind it.",
    icon: Stamp,
    chip: "They keep this",
    chipValue: "Receipt · VFY-…",
  },
];

const TRUST_POINTS = [
  {
    icon: Stamp,
    title: "The YES is signed & sealed",
    body: "Every answer carries a cryptographic record hash. Change a single byte on the receipt : the timestamp, the answer, anything : and the signature breaks. There is no way to edit a YES after the fact.",
  },
  {
    icon: ShieldCheck,
    title: "The answer comes from a real record",
    body: "The shop isn't trusting a piece of paper someone typed. The YES is generated from a verified identity record held by Quebec : the same kind of record a bank or NIMC would rely on. Faking the answer means breaking the vault, not forging a document.",
  },
  {
    icon: History,
    title: "Every check is auditable & revocable",
    body: "The holder sees every check on their dashboard and can revoke access at any time. A business that shows a fake receipt gets caught : and a business that loses access can't check anything more.",
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
    withQuebec: "Nowhere : nothing is copied or stored",
  },
  {
    label: "Can the copy be re-used elsewhere?",
    withId: "Yes : anyone who sees it can reuse it",
    withQuebec: "No : the reference only answers the questions you allow",
  },
  {
    label: "Can you take access back?",
    withId: "No : a photocopy can't be un-copied",
    withQuebec: "Yes : revoke in one tap, anytime",
  },
  {
    label: "Proof you were checked fairly",
    withId: "A scan that can be edited",
    withQuebec: "A signed, tamper-evident receipt",
  },
];

const SECURITY = [
  {
    icon: Lock,
    title: "1 · The reference can't be reused",
    body: "A reference is bound to one holder. Borrowing someone else's reference answers nothing about you : and every check is logged to that holder, who sees it.",
  },
  {
    icon: FileX2,
    title: "2 · Receipts can't be forged",
    body: "Each receipt is sealed with a record hash. Screenshot it, edit it, re-upload it : the signature won't match, and anyone can re-verify.",
  },
  {
    icon: EyeOff,
    title: "3 · No data to steal, no data to leak",
    body: "The shop never receives personal data, so there's nothing on their devices or servers to leak or sell. The least data is the safest data.",
  },
];

/**
 * overflow-x-clip, not overflow-hidden: LandingHeader is sticky and now lives
 * inside this wrapper, and an ancestor with `overflow: hidden` creates a scroll
 * container that stops `position: sticky` dead. `clip` still contains any stray
 * horizontal overflow without doing that. Same trap, one keyword.
 */
export default function HowItWorksPage() {
  return (
    <div className="overflow-x-clip bg-af-bg">
      <LandingHeader />

      {/* Hero. The headline used to end in a brand-600→gold gradient clip, and
          the gold end of it measured under 3:1 against this ground : the same
          failure the landing hero had, solved the same way. Gold as a field
          behind near-black ink is 11:1 and reads louder at display size than the
          gradient ever did. */}
      <section className="bg-grid border-b border-af-border bg-af-bg">
        <div className="mx-auto max-w-[820px] px-5 py-20 text-center md:px-6 md:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-af-accent-soft bg-af-accent-soft px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-af-accent-strong">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            How Quebec works
          </span>
          <h1 className="mt-7 font-display text-[clamp(2.2rem,6vw,4.4rem)] font-bold leading-[1.05] tracking-[-0.04em] text-af-ink">
            Trust the answer.
            <br />
            <span className="rounded-[6px] bg-af-accent px-3 text-af-ink">Not the file.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-[620px] text-base leading-relaxed text-af-muted">
            Today, proving you&apos;re old enough for a sim card means handing over your entire ID.
            Quebec inverts that: a business asks a single question, and gets a single, verifiable
            answer : without ever seeing the whole record.
          </p>
        </div>
      </section>

      {/* 3-step diagram */}
      <section className="bg-af-bg">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <SectionHeading eyebrow="The exchange" title="Three moves, and nothing else changes hands">
            Every check in the product is this same loop. Nothing is added to it for one kind of
            check and left out for another.
          </SectionHeading>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-af-border bg-af-surface text-af-muted shadow-sm">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                )}
                <div className="flex h-full flex-col rounded-[14px] border border-af-border bg-af-surface p-8 shadow-[0_1px_2px_rgba(23,23,23,0.05)]">
                  <div className="flex items-center justify-between">
                    {/* The step number is real content : "01, 02, 03" is a sequence
                        and the order carries meaning. It was af-border (1.4:1),
                        which is invisible. af-muted-2 is 3.3:1 — under AA for body
                        text but over the 3:1 bar for large text, and at 30px bold
                        it still reads as the quiet numeral it is meant to be. */}
                    <span className="font-display text-3xl font-bold text-af-muted-2">{s.n}</span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-af-ink text-af-accent">
                      <s.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold leading-snug text-af-ink">{s.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-af-muted">{s.body}</p>

                  {/* An absence, given the product's dashed edge : what travels is
                      the one thing that isn't written down here. */}
                  <div className="mt-6 rounded-[10px] border border-dashed border-af-border-strong px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-af-muted">
                      {s.chip}
                    </p>
                    <p className="ref-plate mt-1 text-sm font-semibold text-af-ink">
                      {s.chipValue}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why trust a YES */}
      <section className="border-y border-af-border bg-af-surface">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-24 md:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading eyebrow="For the business" title="Why trust a YES instead of the ID?">
              The YES is not a screenshot. It is a cryptographically signed statement generated
              from a verified identity record, stamped with the time it was issued and bound to a
              reference only the holder controls.
            </SectionHeading>
            <p className="mt-5 max-w-[600px] text-base leading-relaxed text-af-muted">
              Keep the receipt. If a dispute reaches a judge or auditor, you can present it : and
              it verifies instantly. Meanwhile the holder&apos;s privacy is intact and your
              business no longer stores copies of documents it doesn&apos;t need.
            </p>
            <Link href="/business/verify" className={`${BTN_DARK} mt-9`}>
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Try it : verify a reference
            </Link>
          </div>

          <div className="space-y-4">
            {TRUST_POINTS.map((t) => (
              <div
                key={t.title}
                className="flex gap-4 rounded-[14px] border border-af-border bg-af-surface p-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-af-surface-muted text-af-ink">
                  <t.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-af-ink">{t.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-af-muted">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What stops a fake YES */}
      <section className="bg-af-bg">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <SectionHeading
            centered
            eyebrow="Security model"
            title="What stops someone faking a YES?"
          />

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {SECURITY.map((f) => (
              <div
                key={f.title}
                className="rounded-[14px] border border-af-border bg-af-surface p-8"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-af-surface-muted text-af-ink">
                  <f.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-semibold leading-snug text-af-ink">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-af-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t border-af-border bg-af-surface">
        <div className="mx-auto max-w-[1080px] px-5 py-24 md:px-6">
          <SectionHeading
            centered
            eyebrow="See the difference"
            title="Your ID card vs. your Quebec reference"
          />

          <div className="mt-16 overflow-hidden rounded-[14px] border border-af-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-af-border bg-af-surface-muted">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-af-muted">
                      What happens
                    </th>
                    <th className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-af-muted">
                        <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                        With your ID card
                      </span>
                    </th>
                    <th className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-af-ink">
                        <QrCode className="h-4 w-4" aria-hidden="true" />
                        With Quebec
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-af-border">
                  {COMPARISON.map((row) => (
                    <tr key={row.label}>
                      <td className="px-5 py-4 font-medium text-af-ink">{row.label}</td>
                      <td className="px-5 py-4 text-af-muted">
                        <span className="flex items-start gap-2.5">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                          {row.withId}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-af-muted">
                        <span className="flex items-start gap-2.5">
                          {/* Was a 6px gold dot on white : about 1.6:1, invisible.
                              This marker means "the good column", which is ink's
                              job, not gold's. */}
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-af-ink" />
                          {row.withQuebec}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-af-bg">
        <div className="mx-auto max-w-[1280px] px-5 py-24 md:px-6">
          <div className="relative overflow-hidden rounded-[14px] bg-af-dark px-6 py-16 text-center sm:px-12">
            {/* bg-grid-light, not bg-grid: the plain grid is drawn in near-black,
                which is invisible on this panel. White lines, low opacity. */}
            <div className="bg-grid-light absolute inset-0" aria-hidden="true" />
            <div className="relative">
              <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-[-0.03em] text-white">
                Prove a fact. Reveal nothing.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/70">
                Two minutes to see the full story: enroll, verify, check the log, revoke access.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                {/* Gold as a field under near-black ink : the answer, on the one
                    panel that is asking for a decision. */}
                <Link
                  href="/user/dashboard"
                  className="inline-flex items-center justify-center gap-1.5 rounded-[7px] bg-af-accent px-[18px] py-[11px] text-[14px] font-semibold text-af-ink transition-colors hover:bg-af-accent/90"
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  I&apos;m a user
                </Link>
                <Link
                  href="/business/dashboard"
                  className="inline-flex items-center justify-center gap-1.5 rounded-[7px] border border-white/30 bg-white/10 px-[18px] py-[11px] text-[14px] font-semibold text-white transition-colors hover:bg-white/20"
                >
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  I&apos;m a business
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-af-border bg-af-surface">
        <p className="mx-auto flex max-w-[720px] items-start justify-center gap-2 px-5 py-10 text-center text-xs leading-relaxed text-af-muted md:px-6">
          <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-af-muted" aria-hidden="true" />
          <span>
            Receipts are signed for real, in your browser: an ECDSA P-256 key held in this vault,
            over a canonicalised SHA-256 payload. Open any receipt and press “Re-check this
            receipt” to verify it. Records are sealed with AES-GCM before they are written to
            storage.
          </span>
        </p>
      </section>

      <LandingFooter />
    </div>
  );
}
