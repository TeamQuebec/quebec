"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * How the element arrives. Sections alternate so the page has a direction of
 * travel rather than one repeated gesture: a card that slides in from the left
 * in one section and from the right in the next reads as movement through a
 * document, where six identical fade-ups read as a template.
 */
export type RevealVariant = "up" | "left" | "right" | "zoom";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Optional stagger delay in ms (applied to the transition). */
  delay?: number;
  variant?: RevealVariant;
}

/** Resting state — where the element sits before it is revealed. */
const HIDDEN: Record<RevealVariant, string> = {
  up: "translate-y-6 opacity-0",
  left: "-translate-x-10 opacity-0",
  right: "translate-x-10 opacity-0",
  zoom: "scale-[0.93] opacity-0",
};

/** Arrived state — every transform back to its identity. */
const SHOWN: Record<RevealVariant, string> = {
  up: "translate-y-0 opacity-100",
  left: "translate-x-0 opacity-100",
  right: "translate-x-0 opacity-100",
  zoom: "scale-100 opacity-100",
};

/**
 * Fade / slide / zoom when the element first scrolls into view. Content is shown
 * immediately when IntersectionObserver is unavailable or reduced motion is
 * set : this is a progressive enhancement, never a hard gate on visibility.
 *
 * The wrapper also carries `data-shown`, so a child can key its own entrance off
 * the same moment without a second observer — `.rule-draw` in globals.css is the
 * one that does. It is `data-shown` rather than a class because the child may
 * need to style itself differently from its parent, and because an attribute
 * survives `className` being overridden at the call site.
 */
export function Reveal({ children, className, delay = 0, variant = "up" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      // Threshold is deliberately low. A tall card — a pricing panel is ~600px —
      // can never reach 12% of the viewport height, so the old value left the
      // largest elements on the page permanently invisible.
      { threshold: 0.05, rootMargin: "0px 0px -48px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-shown={shown ? "true" : "false"}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        // Opacity and transform only. An earlier pass also blurred the zoom
        // variant; with ~25 of these on the page, that is 25 live filter layers
        // before anything has been revealed, which is not worth the effect.
        "h-full transition-[opacity,transform] duration-700 ease-out",
        shown ? SHOWN[variant] : HIDDEN[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
