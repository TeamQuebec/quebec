import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The marketing pages' heading primitives.
 *
 * These started life inside app/page.tsx. /how-it-works was re-rolling the same
 * three elements by hand — a gold eyebrow, a brand-950 heading, a muted lede —
 * and drifting from them a little each time, which is how the two pages ended up
 * looking like two products. Extracted so there is one definition.
 */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-[12px] font-semibold uppercase tracking-[0.08em] text-af-muted",
        className
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  centered = false,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "text-center" : undefined}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 font-display text-[clamp(2.2rem,4.5vw,3.6rem)] font-bold leading-[1] tracking-[-0.04em] text-af-ink">
        {title}
      </h2>
      {children && (
        <p
          className={
            centered
              ? "mx-auto mt-5 max-w-[600px] text-base leading-relaxed text-af-muted"
              : "mt-5 max-w-[600px] text-base leading-relaxed text-af-muted"
          }
        >
          {children}
        </p>
      )}
    </div>
  );
}
