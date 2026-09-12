"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Copy,
  Fingerprint,
  Loader2,
  Lock,
  Printer,
  SearchX,
  ShieldCheck,
  ShieldQuestion,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollX } from "@/components/ui/scroll-x";
import { LogoMark } from "@/components/site/logo";
import { FakeQr } from "@/components/site/fake-qr";
import { CopyButton } from "@/components/site/copy-button";
import { AbsenceNote } from "@/components/site/absence-note";
import { verdictMeta } from "@/components/site/verdict-display";
import { CHECK_BY_ID } from "@/lib/checks";
import { formatDateTime } from "@/lib/format";
import { useApp } from "@/state/app-context";
import { formatFingerprint, type VerifyResult } from "@/lib/vault";
import { cn } from "@/lib/utils";
import type { CheckResult, Verification } from "@/lib/types";

const ANSWER_STYLE: Record<CheckResult["answer"], { label: string; cls: string }> = {
  yes: { label: "YES", cls: "border-gold-border bg-gold-soft text-gold-strong" },
  no: { label: "NO", cls: "border-rose-200 bg-rose-50 text-rose-700" },
  unable: { label: "UNABLE", cls: "border-amber-200 bg-amber-50 text-amber-700" },
};

const VERDICT_BAR: Record<string, { cls: string; icon: typeof ShieldCheck }> = {
  yes: { cls: "border-gold-border bg-gold-soft text-gold-strong", icon: BadgeCheck },
  no: { cls: "border-rose-200 bg-rose-50 text-rose-700", icon: XCircle },
  revoked: { cls: "border-amber-200 bg-amber-50 text-amber-700", icon: Lock },
  pending: { cls: "border-amber-200 bg-amber-50 text-amber-700", icon: Lock },
  unconfirmed: { cls: "border-amber-200 bg-amber-50 text-amber-700", icon: AlertTriangle },
  // A reference we could not find is not the same event as a fact that came back
  // false — one means check your typing, the other means the answer is no. It
  // gets its own neutral register, in the warm greys rather than Tailwind slate.
  no_match: { cls: "border-brand-200 bg-brand-50 text-brand-600", icon: SearchX },
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
  const { verifyReceipt } = useApp();

  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  // Read in an effect rather than during render: the page is server-rendered
  // too, where neither the origin nor "now" exists, and reading them inline
  // would make the client's first paint disagree with the server's.
  const [printed, setPrinted] = useState<{ origin: string; at: string } | null>(null);
  useEffect(() => {
    setPrinted({ origin: window.location.origin, at: new Date().toISOString() });
  }, []);

  const signed = Boolean(verification.signature);

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(verification.hash);
      toast.success("Record hash copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const recheck = async () => {
    setChecking(true);
    try {
      const { result: r } = await verifyReceipt(verification.id);
      setResult(r);
    } catch {
      setResult({ status: "unsigned", reason: "The check could not be run in this browser." });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="print-area animate-fade-up overflow-hidden rounded-2xl border border-border bg-white shadow-xl shadow-brand-900/10">
        {/* Header band */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-950 px-6 py-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark
              className="h-9 w-9 shrink-0 ring-1 ring-white/20"
              plate="rgba(255,255,255,0.10)"
            />
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
            {/* The one green moment on the receipt: the artifact's core claim is
                that it carries a signature, so that is what green is for. */}
            <Badge
              className={
                signed
                  ? "border-verify-border bg-verify-soft text-verify-strong"
                  : "border-white/20 bg-white/10 text-white"
              }
            >
              {signed ? "Signed" : "Unsigned"}
            </Badge>
            <p className="mt-1 text-[10px] text-brand-200">
              {signed ? "ECDSA P-256 receipt" : "Legacy record"}
            </p>
          </div>
        </div>

        <div className="px-6 py-7 sm:px-8 sm:py-8">
          {/* Serial + verdict */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Receipt number
              </p>
              <p className="ref-plate mt-1 text-xl font-semibold text-brand-950">
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
              <ScrollX className="mt-3 overflow-hidden rounded-xl border border-border">
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
              </ScrollX>
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
                {verification.identityReference ?? ":"}
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

          {/* Data never shown : an absence claim, so it takes the dashed
              register rather than an accent-tinted aside. */}
          <AbsenceNote icon={ShieldCheck} variant="inline" className="mt-6">
            This receipt contains <span className="font-semibold">no personal data</span> : only
            the facts requested and the answers given.
          </AbsenceNote>

          <div className="tear-line my-7" />

          {/* Seal footer. The seal is one of gold's three jobs and this is it:
              the hallmark on the document. The green badge in the header above
              says the system attests to the signature; these marks are the
              stamp itself, so they stay gold. */}
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-950">
                <Lock className="h-3.5 w-3.5 text-gold-strong" />
                {signed ? "Signed with ECDSA P-256 · SHA-256 digest" : "Record hash (unsigned)"}
              </p>
              <p className="ref-plate mt-1.5 break-all text-[11px] leading-relaxed text-muted-foreground">
                {verification.hash}
              </p>
              <button
                type="button"
                onClick={copyHash}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-brand-900 underline underline-offset-2 hover:text-brand-950"
              >
                <Copy className="h-3 w-3" />
                Copy hash
              </button>

              {signed ? (
                <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  <Fingerprint className="mt-0.5 h-3 w-3 shrink-0 text-gold-strong" aria-hidden="true" />
                  <span>
                    Signed by vault key{" "}
                    <span className="font-mono font-medium text-brand-900">
                      {formatFingerprint(verification.keyId ?? "")}
                    </span>
                    . Alter any detail above and the signature breaks : the payload is canonicalised,
                    so a changed digit anywhere produces different bytes.
                  </span>
                </p>
              ) : (
                <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-700">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>
                    This receipt carries no signature. It was recorded before this browser had a vault
                    key, so the digest above is real but nothing attests to it.
                  </span>
                </p>
              )}

              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={recheck}
                  disabled={checking}
                  className="no-print h-8 gap-1.5 text-xs"
                >
                  {checking ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldQuestion className="h-3.5 w-3.5" />
                  )}
                  Re-check this receipt
                </Button>
                {result && <RecheckResult result={result} />}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <FakeQr value={`${verification.id}:${verification.hash}`} className="h-20 w-20 rounded-md border border-border bg-white p-1" />
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Verify receipt
              </p>
            </div>
          </div>

          {/* Print-only. On screen the buttons above are how you re-check this
              receipt; on paper they disappear, and a PDF of it would circulate
              with no way back to the source. So the page prints its own address
              and the key that signed it. Renders only after mount, since the
              origin and the print time do not exist on the server. */}
          {printed && (
            <div className="hidden print:mt-6 print:block print:border-t print:border-black print:pt-3">
              <p className="text-[10px] leading-relaxed">
                Re-check this receipt at{" "}
                <span className="font-mono">
                  {printed.origin}/receipt/{verification.id}
                </span>{" "}
                : it will re-derive the digest above and check the signature.
                {signed && (
                  <> Signed by vault key {formatFingerprint(verification.keyId ?? "")}.</>
                )}{" "}
                Printed {formatDateTime(printed.at)}.
              </p>
            </div>
          )}
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

const RECHECK_STYLE: Record<VerifyResult["status"], { cls: string; icon: typeof ShieldCheck; label: string }> = {
  valid: { cls: "border-verify-border bg-verify-soft text-verify-strong", icon: ShieldCheck, label: "Signature valid" },
  tampered: { cls: "border-rose-200 bg-rose-50 text-rose-700", icon: XCircle, label: "Signature does NOT match" },
  unknown_key: { cls: "border-rose-200 bg-rose-50 text-rose-700", icon: XCircle, label: "Signed by a different key" },
  unsigned: { cls: "border-amber-200 bg-amber-50 text-amber-700", icon: AlertTriangle, label: "No signature" },
};

/** The visible outcome of a real signature check — not a decoration. */
function RecheckResult({ result }: { result: VerifyResult }) {
  const style = RECHECK_STYLE[result.status];
  const Icon = style.icon;
  return (
    <div
      role="status"
      className={cn("mt-2 flex items-start gap-2 rounded-md border px-2.5 py-2 text-[11px] leading-relaxed", style.cls)}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>
        <span className="font-semibold">{style.label}.</span>{" "}
        {result.status === "valid"
          ? "The stored receipt still matches its signature byte for byte."
          : result.reason}
      </span>
    </div>
  );
}
