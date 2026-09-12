import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The portal's metric strip — the landing page's statistics row, in the app.
 *
 * This replaces a row of four `Card`s. That was the single loudest structural
 * difference between the dashboard and the marketing pages: the landing puts its
 * four figures on ONE surface separated by hairline rules
 * (`md:grid-cols-4 md:divide-x md:divide-af-border`), and the dashboard put them
 * in four bordered, shadowed, rounded boxes. Four objects competing to be
 * looked at, where the landing has one object you read across.
 *
 * So: no per-metric border, no per-metric shadow, no per-metric radius. One
 * card, hairline dividers, and the numerals set at the landing's display scale —
 * `font-display`, tight negative tracking, nothing else near them in weight.
 *
 * Tone survives on the ICON ONLY, because on these two dashboards the tone is
 * semantic rather than decorative: amber means "waiting on you", rose means
 * "access was cut". The number itself is always ink, so a metric is never
 * colour-coded — and gold is not a tone at all, since a count is not an answer.
 */
export interface Stat {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  tone?: "neutral" | "amber" | "rose";
}

const TONE: Record<NonNullable<Stat["tone"]>, string> = {
  // Structural : a hairline chip on the muted ground, ink glyph.
  neutral: "bg-brand-50 text-brand-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-600",
};

function StripStat({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  return (
    // bg-card on a bg-border parent with gap-px: the hairline rules are the
    // parent showing through, so they are correct at every column count without
    // any per-index border logic. This is the landing's own idiom for its
    // matrices, borrowed rather than reinvented.
    <div className="flex flex-col bg-card px-6 py-7 sm:px-8">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            TONE[stat.tone ?? "neutral"]
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {stat.label}
        </p>
      </div>
      <p className="mt-5 font-display text-[clamp(2rem,3vw,2.6rem)] font-bold leading-none tracking-[-0.04em] text-brand-950">
        {stat.value}
      </p>
      {stat.hint && (
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{stat.hint}</p>
      )}
    </div>
  );
}

export function StatStrip({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-sm",
        stats.length === 2 && "sm:grid-cols-2",
        stats.length === 3 && "sm:grid-cols-3",
        stats.length >= 4 && "sm:grid-cols-2 xl:grid-cols-4",
        className
      )}
    >
      {stats.map((s) => (
        <StripStat key={s.label} stat={s} />
      ))}
    </div>
  );
}
