"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Product", href: "#capabilities" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Checks", href: "#checks" },
  { label: "Roles", href: "#roles" },
  { label: "Pricing", href: "#pricing" },
  { label: "Built on", href: "#built-on" },
];

/** Quebec landing nav — thin, small text, compact user/business CTAs. */
export function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-af-border bg-af-bg/90 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-6 px-5 md:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Quebec home">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-af-ink font-sans text-[13px] font-bold text-af-accent">
            Q
          </span>
          <span className="text-[17px] font-bold tracking-tight text-af-ink">Quebec</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13px] font-medium text-af-muted transition-colors hover:text-af-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/business/dashboard"
              className="inline-flex items-center gap-1.5 rounded-[7px] border border-af-border bg-transparent px-3.5 py-2 text-[13px] font-semibold text-af-ink transition-colors hover:border-af-ink"
            >
              I&apos;m a business
            </Link>
            <Link
              href="/user/dashboard"
              className="inline-flex items-center gap-1.5 rounded-[7px] bg-af-ink px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-af-dark"
            >
              I&apos;m a user
            </Link>
          </div>
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
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-[6px] px-2 py-2.5 text-sm font-medium text-af-ink transition-colors hover:bg-af-surface-muted"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/business/dashboard"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-[7px] border border-af-border bg-transparent px-[18px] py-[11px] text-sm font-semibold text-af-ink"
            >
              I&apos;m a business
            </Link>
            <Link
              href="/user/dashboard"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-[7px] bg-af-ink px-[18px] py-[11px] text-sm font-semibold text-white"
            >
              I&apos;m a user
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
