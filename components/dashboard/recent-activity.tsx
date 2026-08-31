import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface RecentActivityItem {
  id: string;
  icon: LucideIcon;
  /** tinted chip classes — e.g. "bg-gold-soft text-gold-strong" */
  iconClass: string;
  title: string;
  sub?: string;
  /** optional pill rendered in the right column, before the link */
  badge?: ReactNode;
  href?: string;
  hrefLabel?: string;
}

/**
 * Compact recent-activity feed used on both overviews. Rows are icon chip +
 * title/sub + optional status pill + optional link. Empty state is the shared
 * dashed placeholder so it reads consistently across the portals.
 */
export function RecentActivity({
  items,
  emptyTitle = "Nothing yet",
  emptyBody,
}: {
  items: RecentActivityItem[];
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-10 text-center">
        <p className="text-sm font-medium text-brand-900">{emptyTitle}</p>
        {emptyBody && (
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{emptyBody}</p>
        )}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-black/5",
                item.iconClass
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-snug text-brand-950">{item.title}</p>
              {item.sub && <p className="mt-0.5 text-xs text-muted-foreground">{item.sub}</p>}
            </div>
            {(item.badge || item.href) && (
              <div className="flex shrink-0 items-center gap-2">
                {item.badge}
                {item.href && (
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-xs font-medium text-gold-strong hover:bg-gold-soft"
                  >
                    {item.hrefLabel ?? "View"}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
