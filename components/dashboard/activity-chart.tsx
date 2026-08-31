import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityPoint {
  /** short day label, e.g. "Mon" */
  label: string;
  value: number;
  isToday?: boolean;
}

/** Bucket a list of ISO timestamps into the last 7 days, oldest → today. */
export function buildActivityPoints(isoTimes: string[]): ActivityPoint[] {
  const dayFmt = new Intl.DateTimeFormat("en-NG", { weekday: "short" });
  const now = new Date();
  const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  const counts = new Map<string, number>();
  for (const iso of isoTimes) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;
    const key = keyOf(d);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const days: ActivityPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days.push({ label: dayFmt.format(d), value: counts.get(keyOf(d)) ?? 0, isToday: i === 0 });
  }
  return days;
}

/**
 * Lightweight 7-day activity bar chart — no chart library. Thin gold bars with
 * rounded tops anchored to a shared baseline, a hover tooltip per bar, and the
 * current day emphasized in dark ink. Single series, so no legend is needed.
 */
export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-10 text-center">
        <BarChart3 className="h-6 w-6 text-brand-300" />
        <p className="mt-2 text-sm font-medium text-brand-900">No checks in the last 7 days</p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
          Verifications against your reference will appear here, day by day.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div
        role="img"
        aria-label={`Verifications per day, last 7 days — ${data
          .map((d) => `${d.label}: ${d.value}`)
          .join(", ")}.`}
      >
        {/* Bars */}
        <div className="flex h-36 items-end gap-2 sm:gap-3">
          {data.map((d) => {
            const height = d.value === 0 ? 0 : Math.max(10, Math.round((d.value / max) * 100));
            return (
              <div key={d.label} className="group relative flex h-full flex-1 flex-col justify-end">
                {d.value > 0 && (
                  <span
                    className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-white px-2 py-1 text-[11px] font-semibold text-brand-900 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                    style={{ bottom: `calc(${height}% + 8px)` }}
                  >
                    {d.value}
                  </span>
                )}
                <div
                  className={cn(
                    "w-full rounded-t transition-opacity",
                    d.isToday ? "bg-brand-800" : "bg-gold",
                    d.value > 0 && "group-hover:opacity-75"
                  )}
                  style={{ height: `${height}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Baseline + day labels */}
        <div className="mt-2 flex gap-2 border-t border-border pt-2 sm:gap-3">
          {data.map((d) => (
            <span
              key={d.label}
              className={cn(
                "flex-1 truncate text-center text-[11px] font-medium",
                d.isToday ? "text-brand-900" : "text-muted-foreground"
              )}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
