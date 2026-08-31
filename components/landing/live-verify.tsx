"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** The verification pipeline — a business asks one fact about a reference. */
const STEPS = ["Ask", "Match", "Verify", "Sign", "Log"];

/**
 * Hero "live transaction" visual, adapted from the AfriFleet dispatch/payment
 * animation. A reference is being checked end-to-end: the pipeline scrolls
 * like a conveyor, one step carries the gold accent, a thin connector drops
 * into a signed YES and the receipt that goes on the record.
 *
 * Marquee + pulse are CSS; only the step highlight cycles in JS.
 */
export function LiveVerify() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[560px]">
      {/* Header — route */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <p className="flex items-center gap-1.5 text-[15px] font-semibold tracking-[-0.01em] text-af-ink">
          Verify
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-af-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-af-accent" />
          </span>
          <span className="text-af-accent">live</span>
        </p>
        <span className="h-4 w-px bg-af-border" aria-hidden="true" />
        <p className="text-[14px] font-medium text-af-muted">
          SafeBank NG <span className="text-af-border-strong">→</span> QBC-8X92-1F
        </p>
      </div>

      {/* Pipeline marquee — continuous right-to-left conveyor */}
      <div className="mt-5 overflow-hidden rounded-[10px] border border-af-border bg-af-surface py-3.5 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="animate-workflow-marquee flex w-max items-center motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-10 pr-10" aria-hidden={copy === 1}>
              {STEPS.map((s, i) => (
                <span
                  key={s}
                  className={cn(
                    "whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors duration-300",
                    i === active ? "text-af-accent" : "text-af-muted-2"
                  )}
                >
                  {s}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Connector — pipeline ↓ verdict */}
      <svg
        className="my-5 ml-[3px]"
        width="10"
        height="36"
        viewBox="0 0 10 36"
        fill="none"
        aria-hidden="true"
      >
        <line x1="4" y1="4" x2="4" y2="32" stroke="var(--af-border)" strokeWidth="1" />
        <circle cx="4" cy="4" r="2.5" fill="var(--af-ink)" />
        <circle cx="4" cy="32" r="2.5" fill="var(--af-accent)" />
        <circle cx="4" cy="18" r="2" fill="var(--af-accent)">
          <animate attributeName="cy" values="6;30" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Verdict */}
      <p className="font-display text-[clamp(1.75rem,2.8vw,2.4rem)] font-bold leading-none tracking-[-0.03em] text-af-ink">
        Signed <span className="text-af-accent">YES</span>
      </p>

      {/* Receipt on the record */}
      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-af-muted-2">
          On the record · Receipt
        </p>
        <p className="mt-1 font-mono text-[12px] text-af-muted">VFY-4N7C-2Q</p>
      </div>
    </div>
  );
}
