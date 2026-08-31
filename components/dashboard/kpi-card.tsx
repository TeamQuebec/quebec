import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  gold: "bg-gold-soft text-gold-strong",
  brand: "bg-brand-50 text-brand-700",
  rose: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-700",
};

/**
 * KPI stat card: small uppercase label, large display value, hint line, and a
 * tinted icon chip. The icon carries the tone — the number always stays in
 * brand ink so the metric itself is never color-coded.
 */
export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "gold",
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof TONES;
}) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-950">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-black/5",
            TONES[tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}
