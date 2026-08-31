import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GrantStatus } from "@/lib/types";

/** Status presentation shared by the sidebar lists and both dashboard tables. */
export const STATUS_META: Record<
  GrantStatus,
  { label: string; badge: "accent" | "warning" | "muted"; dot: string }
> = {
  granted: { label: "Current", badge: "accent", dot: "bg-gold" },
  requested: { label: "Pending", badge: "warning", dot: "bg-amber-400" },
  revoked: { label: "Revoked", badge: "muted", dot: "bg-brand-300" },
};

/** Order used to sort rows — current first, then pending, then revoked. */
export function grantStatusRank(status: GrantStatus): number {
  return status === "granted" ? 0 : status === "requested" ? 1 : 2;
}

export function StatusDot({
  status,
  className,
}: {
  status: GrantStatus;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_META[status].dot, className)}
    />
  );
}

export function GrantStatusBadge({ status }: { status: GrantStatus }) {
  const meta = STATUS_META[status];
  return <Badge variant={meta.badge}>{meta.label}</Badge>;
}
