"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  FileCheck2,
  Lock,
  RefreshCw,
  SearchX,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CHECK_BY_ID } from "@/lib/checks";
import type { CheckResult, Verification } from "@/lib/types";

export interface VerdictMeta {
  label: string;
  sublabel: string;
  icon: typeof ShieldCheck;
  accent: "yes" | "no" | "warn" | "muted";
}

export function verdictMeta(v: Verification): VerdictMeta {
  switch (v.verdict) {
    case "yes":
      return {
        label: "YES",
        sublabel: v.note,
        icon: BadgeCheck,
        accent: "yes",
      };
    case "no":
      return {
        label: "NO",
        sublabel: v.note,
        icon: XCircle,
        accent: "no",
      };
    case "revoked":
      return {
        label: "ACCESS REVOKED",
        sublabel: "The holder revoked access to your business. No new checks can run.",
        icon: Lock,
        accent: "warn",
      };
    case "pending":
      return {
        label: "NOT AUTHORIZED",
        sublabel: "This business has not been granted access by the holder yet.",
        icon: Lock,
        accent: "warn",
      };
    case "unconfirmed":
      return {
        label: "CANNOT CONFIRM",
        sublabel: v.note,
        icon: AlertTriangle,
        accent: "warn",
      };
    case "no_match":
    default:
      return {
        label: "NO MATCH",
        sublabel: "No identity was found for the reference you entered.",
        icon: SearchX,
        accent: "no",
      };
  }
}

const ACCENT_STYLES = {
  yes: {
    ring: "bg-gold-soft ring-gold-border/70",
    icon: "text-gold-strong",
    text: "text-gold-strong",
    banner: "from-gold-soft/70 to-white border-gold-border",
  },
  no: {
    ring: "bg-rose-50 ring-rose-100/70",
    icon: "text-rose-600",
    text: "text-rose-600",
    banner: "from-rose-50/70 to-white border-rose-100",
  },
  warn: {
    ring: "bg-amber-50 ring-amber-100/70",
    icon: "text-amber-600",
    text: "text-amber-600",
    banner: "from-amber-50/70 to-white border-amber-100",
  },
  muted: {
    ring: "bg-slate-50 ring-slate-100/70",
    icon: "text-slate-500",
    text: "text-slate-500",
    banner: "from-slate-50/70 to-white border-slate-100",
  },
} as const;

/** Per-fact answer chips shown under the verdict. */
const CHECK_ANSWER: Record<CheckResult["answer"], { label: string; cls: string }> = {
  yes: { label: "YES", cls: "border-gold-border bg-gold-soft text-gold-deep" },
  no: { label: "NO", cls: "border-rose-200 bg-rose-50 text-rose-700" },
  unable: { label: "UNABLE", cls: "border-amber-200 bg-amber-50 text-amber-700" },
};

export function VerdictDisplay({
  verification,
  businessName,
  onReset,
}: {
  verification: Verification;
  businessName: string;
  onReset: () => void;
}) {
  const meta = verdictMeta(verification);
  const s = ACCENT_STYLES[meta.accent];
  const Icon = meta.icon;

  return (
    <div className="animate-scale-in">
      <div className={`overflow-hidden rounded-2xl border bg-gradient-to-b shadow-sm ${s.banner}`}>
        <div className="flex flex-col items-center px-6 pb-8 pt-10 text-center">
          <span className={`flex h-24 w-24 items-center justify-center rounded-full ring-8 ${s.ring}`}>
            <Icon className={`h-12 w-12 ${s.icon}`} strokeWidth={2} />
          </span>

          <p className={cn("mt-6 font-display text-6xl font-bold leading-none tracking-tight [overflow-wrap:anywhere] sm:text-7xl", s.text)}>
            {meta.label}
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {meta.sublabel}
          </p>

          {verification.checks.length > 0 && (
            <div className="mt-7 w-full max-w-md text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Asked · Answered
              </p>
              <div className="mt-2 space-y-1.5 rounded-xl border border-brand-100 bg-white/80 p-3 shadow-sm">
                {verification.checks.map((c) => {
                  const def = CHECK_BY_ID[c.checkId];
                  const ans = CHECK_ANSWER[c.answer];
                  return (
                    <div
                      key={c.checkId}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-brand-900">
                        {def?.label ?? c.checkId}
                      </span>
                      <span
                        className={cn(
                          "inline-flex min-w-14 shrink-0 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold",
                          ans.cls
                        )}
                      >
                        {ans.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                These are the only facts answered — nothing else from the record is revealed.
              </p>
            </div>
          )}

          <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3 border-t border-dashed border-brand-200 pt-6 text-left">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Verification ref
              </p>
              <p className="ref-plate mt-1 text-sm font-semibold text-brand-950">{verification.id}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Timestamp
              </p>
              <p className="mt-1 text-sm font-medium text-brand-950">
                {formatDateTime(verification.requestedAt)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Checked against
              </p>
              <p className="ref-plate mt-1 text-sm font-semibold text-brand-950">
                {verification.identityReference ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Requested by
              </p>
              <p className="mt-1 text-sm font-medium text-brand-950">{businessName}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-brand-100 bg-white/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-gold-strong" />
            No name, DOB or NIN was shown to {businessName}.
          </p>
          <div className="flex gap-2.5">
            <Button variant="outline" size="sm" onClick={onReset}>
              <RefreshCw className="h-3.5 w-3.5" />
              New check
            </Button>
            <Button variant="brand" size="sm" asChild>
              <Link href={`/receipt/${verification.id}`}>
                <FileCheck2 className="h-3.5 w-3.5" />
                View receipt
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
