"use client";

import {
  AlertTriangle,
  BadgeCheck,
  Copy,
  Lock,
  Printer,
  SearchX,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/site/logo";
import { FakeQr } from "@/components/site/fake-qr";
import { CopyButton } from "@/components/site/copy-button";
import { verdictMeta } from "@/components/site/verdict-display";
import { CHECK_BY_ID } from "@/lib/checks";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CheckResult, Verification } from "@/lib/types";

const ANSWER_STYLE: Record<CheckResult["answer"], { label: string; cls: string }> = {
  yes: { label: "YES", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  no: { label: "NO", cls: "border-rose-200 bg-rose-50 text-rose-700" },
  unable: { label: "UNABLE", cls: "border-amber-200 bg-amber-50 text-amber-700" },
};

const VERDICT_BAR: Record<string, { cls: string; icon: typeof ShieldCheck }> = {
  yes: { cls: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: BadgeCheck },
  no: { cls: "border-rose-200 bg-rose-50 text-rose-700", icon: XCircle },
  revoked: { cls: "border-amber-200 bg-amber-50 text-amber-700", icon: Lock },
  pending: { cls: "border-amber-200 bg-amber-50 text-amber-700", icon: Lock },
  unconfirmed: { cls: "border-amber-200 bg-amber-50 text-amber-700", icon: AlertTriangle },
  no_match: { cls: "border-slate-200 bg-slate-50 text-slate-600", icon: SearchX },
};

export function ReceiptView({
  verification,
  businessName,
}: {
  verification: Verification;
  businessName: string;
}) {
  const meta = verdictMeta(verification);
  const bar = VERDICT_BAR[verification.verdict];
  const BarIcon = bar.icon;

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(verification.hash);
      toast.success("Record hash copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="print-area animate-fade-up overflow-hidden rounded-2xl border border-border bg-white shadow-xl shadow-brand-900/10">
        {/* Header band */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-brand-800 to-teal-900 px-6 py-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark className="h-9 w-9 shrink-0 bg-white/10 ring-1 ring-white/20" />
            <div>
              <p className="font-display text-base font-semibold tracking-tight text-white">
                Verification Receipt
              </p>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-200">
                Quebec Identity Network
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Badge className="border-white/20 bg-white/10 text-white">Sealed</Badge>
            <p className="mt-1 text-[10px] text-brand-200">Tamper-evident record</p>
          </div>
        </div>

        <div className="px-6 py-7 sm:px-8 sm:py-8">
          {/* Serial + verdict */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Receipt number
              </p>
              <p className="ref-plate mt-1 text-xl font-semibold tracking-wider text-brand-950">
                {verification.id}
              </p>
            </div>
            <CopyButton text={verification.id} label="Copy ref" />
          </div>

          <div className={cn("mt-5 flex items-center gap-3 rounded-xl border px-4 py-3.5", bar.cls)}>
            <BarIcon className="h-6 w-6 shrink-0" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wide">{meta.label}</p>
              <p className="text-xs leading-relaxed opacity-80">{verification.note}</p>
            </div>
          </div>

          {/* What was asked / answered */}
          {verification.checks.length > 0 && (
            <div className="mt-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                What was asked · what was answered
              </p>
              <div className="mt-3 overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[22rem] text-left text-sm">
                  <thead className="bg-brand-50/70 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Asked</th>
                      <th className="px-4 py-2.5 font-semibold">Answer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {verification.checks.map((c) => {
                      const def = CHECK_BY_ID[c.checkId];
                      const ans = ANSWER_STYLE[c.answer];
                      return (
                        <tr key={c.checkId}>
                          <td className="px-4 py-3 font-medium text-brand-950">
                            {def?.label ?? c.checkId}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2.5">
                              <Badge variant="outline" className={cn("min-w-14 justify-center", ans.cls)}>
                                {ans.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{c.note}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Details grid */}
          <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Requested by
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-brand-950">{businessName}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Reference checked
              </p>
              <p className="ref-plate mt-1 text-sm font-semibold text-brand-950">
                {verification.identityReference ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Timestamp
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-950">
                {formatDateTime(verification.requestedAt)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Signed by
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-950">Quebec Identity Network</p>
            </div>
          </div>

          {/* Data never shown */}
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-teal-600" />
            <p className="text-xs text-brand-800">
              This receipt contains <span className="font-semibold">no personal data</span> — only
              the facts requested and the answers given.
            </p>
          </div>

          <div className="tear-line my-7" />

          {/* Seal footer */}
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-950">
                <Lock className="h-3.5 w-3.5 text-teal-600" />
                Tamper-evident record hash
              </p>
              <p className="ref-plate mt-1.5 break-all text-[11px] leading-relaxed text-muted-foreground">
                {verification.hash}
              </p>
              <button
                type="button"
                onClick={copyHash}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline"
              >
                <Copy className="h-3 w-3" />
                Copy hash
              </button>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                Alter any detail above and the signature breaks. Anyone can re-check this receipt
                against the registry at any time — a judge, an auditor, or the holder.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <FakeQr value={`${verification.id}:${verification.hash}`} className="h-20 w-20 rounded-md border border-border bg-white p-1" />
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Verify receipt
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="no-print mt-6 flex items-center justify-center gap-2.5">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print / save as PDF
        </Button>
        <Button variant="ghost" asChild>
          <a href="/how-it-works" className="text-sm">
            How tamper-evidence works
          </a>
        </Button>
      </div>
    </div>
  );
}
