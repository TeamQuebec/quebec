import Link from "next/link";
import { ArrowRight, Building2, UserRound, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/site/logo";

export const metadata = { title: "Continue · Quebec" };

const OPTIONS: {
  href: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
}[] = [
  {
    href: "/auth/user/signin",
    icon: UserRound,
    eyebrow: "Holder",
    title: "I'm a user",
    body: "Hold your own record. Enroll three fields, share one reference, and see every check made against you.",
    cta: "Continue as a holder",
  },
  {
    href: "/auth/business/signin",
    icon: Building2,
    eyebrow: "Verifier",
    title: "I'm a business",
    body: "Ask one fact about a customer's reference and get a signed yes or no. The record never travels.",
    cta: "Continue as a verifier",
  },
];

/**
 * The fork in the road, and the screen both portals are entered from.
 *
 * Signing out lands here rather than on the sign-in form you happened to use.
 * It used to send you back to whichever portal you had just left, which made
 * the other one reachable only by editing the URL — and meant "sign out" read
 * as "reload this portal" rather than "leave".
 *
 * The two cards are deliberately equal: no default, no emphasis. The whole
 * point of this screen is that the choice has not been made yet.
 */
export default function AuthChoicePage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Logo />

        <div className="mt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
            Quebec portal
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
            Continue as…
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Two sides of the same check. Pick the one you&apos;re here for : you can sign out and
            switch at any time.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {OPTIONS.map((o) => {
            const Icon = o.icon;
            return (
              <Link
                key={o.href}
                href={o.href}
                className="group flex flex-col rounded-xl border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_16px_32px_rgba(23,23,23,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-brand-900 text-white">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {o.eyebrow}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-brand-950">
                  {o.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {o.body}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-900">
                  {o.cta}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Demo session : synthetic identity data. Nothing here is real.
        </p>
      </div>
    </div>
  );
}
