import { Badge } from "@/components/ui/badge";
import type { Verdict } from "@/lib/types";

const VERDICT_META: Record<
  Verdict,
  { label: string; variant: "accent" | "destructive" | "muted" | "warning" }
> = {
  yes: { label: "YES", variant: "accent" },
  no: { label: "NO", variant: "destructive" },
  no_match: { label: "NO MATCH", variant: "muted" },
  revoked: { label: "REVOKED", variant: "destructive" },
  pending: { label: "PENDING", variant: "warning" },
  unconfirmed: { label: "UNCONFIRMED", variant: "warning" },
};

/** Shared verdict pill — one mapping for history tables, feeds and receipts. */
export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const meta = VERDICT_META[verdict];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
