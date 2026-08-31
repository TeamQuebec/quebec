"use client";

import Link from "next/link";
import {
  Ban,
  Check,
  ChevronRight,
  KeyRound,
  ScrollText,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useApp } from "@/state/app-context";
import { timeAgo } from "@/lib/format";
import type { LogType } from "@/lib/types";

export const TYPE_STYLE: Record<
  LogType,
  { icon: typeof ShieldCheck; classes: string }
> = {
  check: { icon: ShieldCheck, classes: "bg-gold-soft text-gold-strong" },
  grant: { icon: KeyRound, classes: "bg-brand-50 text-brand-600" },
  revoke: { icon: Ban, classes: "bg-rose-50 text-rose-600" },
  approve: { icon: Check, classes: "bg-gold-soft text-gold-strong" },
  deny: { icon: X, classes: "bg-muted text-muted-foreground" },
  enroll: { icon: UserPlus, classes: "bg-violet-50 text-violet-600" },
};

export function AccessLog() {
  const { activeLog } = useApp();

  if (activeLog.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-10 text-center">
        <ScrollText className="h-6 w-6 text-brand-300" />
        <p className="mt-2 text-sm font-medium text-brand-900">Nothing logged yet</p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
          Every check a business runs against your reference will appear here — transparent and
          yours to audit.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-1">
      {activeLog.map((entry, i) => {
        const style = TYPE_STYLE[entry.type];
        const Icon = style.icon;
        const isLast = i === activeLog.length - 1;
        return (
          <li key={entry.id} className="relative flex gap-3.5">
            {/* timeline rail */}
            <div className="flex flex-col items-center">
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-black/5 ${style.classes}`}>
                <Icon className="h-4 w-4" />
              </span>
              {!isLast && <span className="w-px flex-1 bg-border" />}
            </div>

            <div className="flex min-w-0 flex-1 items-start justify-between gap-3 pb-5 pt-1.5">
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug text-brand-950">{entry.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(entry.at)}</p>
              </div>
              {entry.verificationId && (
                <Link
                  href={`/receipt/${entry.verificationId}`}
                  className="inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-1 text-xs font-medium text-gold-strong hover:bg-gold-soft"
                >
                  Receipt
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
