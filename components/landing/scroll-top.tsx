"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Scroll-to-top control for the marketing pages.
 *
 * Appears only once the hero is behind you. The landing is long — ten sections
 * and roughly six screens — so "back to the top" is a real journey from the
 * pricing table, and the button earns its corner there. Over the hero it would
 * be a control for a scroll that has not happened yet, so it stays hidden until
 * one full viewport has gone by.
 */
export function ScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toTop() {
    // `html { scroll-behavior: smooth }` in globals.css would make this smooth
    // whether or not the reader wants that, so it is chosen here instead.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Scroll back to top"
      className={cn(
        "group fixed bottom-6 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-af-border bg-af-surface text-af-ink shadow-[0_8px_24px_rgba(23,23,23,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-af-border-strong hover:shadow-[0_12px_28px_rgba(23,23,23,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-af-ink focus-visible:ring-offset-2 focus-visible:ring-offset-af-bg motion-reduce:transition-none",
        // Hidden is `pointer-events-none`, not just transparent — an invisible
        // button that still swallows clicks over the hero is worse than no
        // button at all.
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      <ArrowUp
        className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </button>
  );
}
