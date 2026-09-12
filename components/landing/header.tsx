"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/site/logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Product", href: "#capabilities" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Checks", href: "#checks" },
  { label: "Roles", href: "#roles" },
  { label: "Pricing", href: "#pricing" },
  { label: "Built on", href: "#built-on" },
];

/**
 * Quebec landing nav : thin, small text, one sign-in CTA.
 *
 * There is a single entry point, not two. The header used to carry "I'm a user"
 * and "I'm a business" side by side, which asked the visitor to know which side
 * of the product they were on before they had seen any of it — and pointed at
 * two dashboards that now both require a session. /auth is where that question
 * is actually asked, with both options laid out, so the header just sends you
 * there and lets the choice happen on the screen built for it.
 *
 * This header now serves /how-it-works as well as /, so the section links have
 * to resolve from either page. A link is one of two things and says so in its
 * own href: an absolute route ("/how-it-works") is a real page and is used as
 * it stands; a bare hash ("#pricing") is a section of the landing, and scrolls
 * in place there or is prefixed with "/" to go home first from anywhere else.
 *
 * "How it works" is deliberately the first kind. It used to be `#how-it-works`
 * with a special case that swapped it for the route only when you were already
 * off the landing — which meant the nav's most substantial link was the one
 * thing on the page that could not reach the page it named.
 */
export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const onLanding = pathname === "/";

  // A hairline shadow once the page has moved, so the sticky bar separates from
  // content it is overlapping. At scrollY 0 there is nothing behind it and the
  // shadow would just be a smudge under the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hrefFor = (href: string) =>
    href.startsWith("/") ? href : onLanding ? href : `/${href}`;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-af-border bg-af-bg/90 backdrop-blur transition-shadow duration-300",
        scrolled && "shadow-[0_1px_16px_rgba(23,23,23,0.07)]"
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-6 px-5 md:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Quebec home">
          <LogoMark className="h-7 w-7" />
          <span className="text-[17px] font-bold tracking-tight text-af-ink">Quebec</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={hrefFor(l.href)}
              className="text-[13px] font-medium text-af-muted transition-colors hover:text-af-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="hidden items-center gap-1.5 rounded-[7px] bg-af-ink px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-af-dark lg:inline-flex"
          >
            Sign in
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[7px] border border-af-border text-af-ink transition-colors hover:bg-af-surface-muted lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-af-border bg-af-bg px-5 pb-6 pt-3 lg:hidden">
          <nav className="flex flex-col gap-0.5" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={hrefFor(l.href)}
                onClick={() => setOpen(false)}
                className="rounded-[6px] px-2 py-2.5 text-sm font-medium text-af-ink transition-colors hover:bg-af-surface-muted"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-4">
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-[7px] bg-af-ink px-[18px] py-[11px] text-sm font-semibold text-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
