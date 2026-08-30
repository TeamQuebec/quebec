"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Check,
  Fingerprint,
  Loader2,
  Lock,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { VerdictDisplay } from "@/components/site/verdict-display";
import { CHECK_BY_ID, CHECK_DEFS } from "@/lib/checks";
import { useApp } from "@/state/app-context";
import { DEMO_IDENTITY_REFERENCE, DEMO_NOT_FOUND_REFERENCE, DEMO_UNDER18_REFERENCE } from "@/lib/mockData/users";
import { cn } from "@/lib/utils";
import type { CheckAnswer, CheckId, Verification } from "@/lib/types";

const EXAMPLE_CHIPS: { ref: string; label: string; tone: "yes" | "no" | "none" }[] = [
  { ref: DEMO_IDENTITY_REFERENCE, label: "Over 18 → YES", tone: "yes" },
  { ref: DEMO_UNDER18_REFERENCE, label: "Over 18 → NO", tone: "no" },
  { ref: DEMO_NOT_FOUND_REFERENCE, label: "Not found", tone: "none" },
];

function StepBadge({ n, active, done, label }: { n: string; active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
          done
            ? "bg-teal-600 text-white"
            : active
              ? "bg-brand-800 text-white"
              : "border border-brand-200 bg-white text-brand-400"
        )}
      >
        {done ? "✓" : n}
      </span>
      <span className={cn("text-xs font-medium", active || done ? "text-brand-950" : "text-brand-400")}>
        {label}
      </span>
    </div>
  );
}

/** Answer chips shown as each check completes during the verification sequence. */
const ANSWER_CHIP: Record<CheckAnswer, { label: string; cls: string }> = {
  yes: { label: "YES", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  no: { label: "NO", cls: "border-rose-200 bg-rose-50 text-rose-700" },
  unable: { label: "UNABLE", cls: "border-amber-200 bg-amber-50 text-amber-700" },
};

/**
 * The "work happens" moment: a scan line sweeps the reference, then each
 * selected check ticks over to its real answer, then the signed result is
 * revealed. Timings are cosmetic — the answers still come from the mock API.
 */
function VerificationSequence({
  reference,
  checks,
  result,
  onComplete,
}: {
  reference: string;
  checks: CheckId[];
  result: Verification | null;
  onComplete: (v: Verification) => void;
}) {
  const [stage, setStage] = useState<"scanning" | "checking" | "revealing">("scanning");
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (stage === "scanning") {
      const t = setTimeout(() => setStage("checking"), 900);
      return () => clearTimeout(t);
    }
    if (stage === "checking" && done < checks.length) {
      const t = setTimeout(() => setDone((d) => d + 1), 400);
      return () => clearTimeout(t);
    }
    if (stage === "checking" && done === checks.length) {
      const t = setTimeout(() => setStage("revealing"), 320);
      return () => clearTimeout(t);
    }
  }, [stage, done, checks.length]);

  useEffect(() => {
    if (stage !== "revealing" || !result) return;
    const t = setTimeout(() => onComplete(result), 450);
    return () => clearTimeout(t);
  }, [stage, result, onComplete]);

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="h-1.5 bg-gradient-to-r from-brand-700 to-teal-600" />
      <div className="p-6 sm:p-8">
        {/* Reference scan plate */}
        <div className="relative h-24 overflow-hidden rounded-xl border border-brand-200 bg-brand-950 px-4">
          <div className="flex h-full flex-col items-center justify-center gap-1.5">
            <p className="ref-plate text-lg font-semibold tracking-widest text-white">{reference}</p>
            <p className="text-[11px] text-brand-200">
              {stage === "scanning"
                ? "Scanning reference…"
                : stage === "checking"
                  ? "Checking facts…"
                  : "Preparing signed result…"}
            </p>
          </div>
          {stage === "scanning" && <span className="scan-line" aria-hidden="true" />}
        </div>

        {/* Checks ticking over one by one */}
        <div className="mt-6 space-y-2.5">
          {checks.map((id, i) => {
            const def = CHECK_BY_ID[id];
            const isDone = i < done;
            const isCurrent = stage === "checking" && i === done;
            const answer = result?.checks.find((c) => c.checkId === id)?.answer;
            return (
              <div
                key={id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-brand-50/40 px-4 py-3"
              >
                <span className="min-w-0 truncate text-sm font-medium text-brand-950">
                  {def?.label ?? id}
                </span>
                {isDone && answer ? (
                  <Badge className={cn("min-w-16 shrink-0 justify-center", ANSWER_CHIP[answer].cls)}>
                    {ANSWER_CHIP[answer].label}
                  </Badge>
                ) : isDone ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-teal-600">
                    <Check className="h-4 w-4" />
                    Done
                  </span>
                ) : isCurrent ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-brand-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Checking…
                  </span>
                ) : (
                  <span className="h-5 w-16 shrink-0 rounded-full border border-brand-200 bg-white" />
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 shrink-0 text-teal-600" />
          Only these facts are answered — nothing else from the record is touched.
        </p>
      </div>
    </div>
  );
}

export function VerifyConsole() {
  const { verify, activeBusinessName } = useApp();
  const [reference, setReference] = useState("");
  const [selected, setSelected] = useState<CheckId[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<Verification | null>(null);
  const [sequence, setSequence] = useState<{ reference: string; checks: CheckId[] } | null>(null);
  const [pendingResult, setPendingResult] = useState<Verification | null>(null);

  const normalized = useMemo(() => reference.trim().toUpperCase(), [reference]);
  const looksValid = /^QBC-[A-Z0-9]{4}-[A-Z0-9]{2}$/.test(normalized);
  const canVerify = normalized.length > 0 && selected.length > 0 && !verifying;

  const toggleCheck = (id: CheckId) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const runVerify = async () => {
    if (selected.length === 0) {
      toast.error("Select at least one fact to verify");
      return;
    }
    setVerifying(true);
    setSequence({ reference: normalized, checks: selected });
    try {
      const v = await verify({ reference: normalized, checks: selected });
      setPendingResult(v);
    } catch {
      setSequence(null);
      setVerifying(false);
      toast.error("Verification failed — try again");
    }
  };

  const handleSequenceComplete = (v: Verification) => {
    setSequence(null);
    setPendingResult(null);
    setResult(v);
    setVerifying(false);
    toast.success("Verification complete", {
      description: `Reference ${v.id} — ${v.verdict.toUpperCase().replace("_", " ")}.`,
    });
  };

  const reset = () => {
    setResult(null);
    setSequence(null);
    setPendingResult(null);
    setReference("");
    setSelected([]);
    setVerifying(false);
  };

  return (
    <div>
      {/* Context banner */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-brand-200 bg-white px-4 py-3 shadow-sm">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-brand-950">{activeBusinessName}</p>
          <p className="text-xs text-muted-foreground">
            You are verifying on behalf of this business (demo session).
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto hidden sm:inline-flex">
          Verifier portal
        </Badge>
      </div>

      {/* Steps */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:gap-x-5">
        <StepBadge n="1" active={!sequence && !result} done={!!sequence || !!result} label="Reference" />
        <span className="h-px w-6 bg-brand-200 sm:w-10" />
        <StepBadge n="2" active={!sequence && !result} done={!!sequence || !!result} label="What to check" />
        <span className="h-px w-6 bg-brand-200 sm:w-10" />
        <StepBadge n="3" active={!!sequence || !!result} done={!!result} label="Result" />
      </div>

      {result ? (
        <VerdictDisplay verification={result} businessName={activeBusinessName} onReset={reset} />
      ) : sequence ? (
        <VerificationSequence
          reference={sequence.reference}
          checks={sequence.checks}
          result={pendingResult}
          onComplete={handleSequenceComplete}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-brand-700 to-teal-600" />
          <CardContent className="p-6 sm:p-8">
            {/* Step 1 — reference */}
            <label htmlFor="qbc-ref" className="block">
              <p className="text-sm font-semibold text-brand-950">Enter the customer&apos;s reference</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Ask for their Quebec reference — that&apos;s all you&apos;ll ever need. No ID card, no copies.
              </p>
            </label>

            <div className="relative mt-3">
              <ScanLine className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-300" />
              <Input
                id="qbc-ref"
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder="e.g. QBC-8X92-1F"
                className="ref-plate h-14 pl-12 pr-4 text-lg font-semibold tracking-widest"
                aria-describedby="qbc-ref-hint"
              />
            </div>
            <p id="qbc-ref-hint" className="mt-2 text-xs text-muted-foreground">
              {reference && !looksValid
                ? "References look like QBC-8X92-1F — letters and numbers, no dashes needed."
                : "Format: QBC-XXXX-XX (dashes optional)."}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Try an example
              </span>
              {EXAMPLE_CHIPS.map((c) => (
                <button
                  key={c.ref}
                  type="button"
                  onClick={() => setReference(c.ref)}
                  className={cn(
                    "ref-plate inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    c.tone === "yes" && "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                    c.tone === "no" && "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
                    c.tone === "none" && "border-brand-200 bg-white text-brand-600 hover:bg-brand-50"
                  )}
                >
                  {c.ref}
                  <span className="opacity-60">· {c.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-7 border-t border-border pt-6">
              {/* Step 2 — checks */}
              <p className="text-sm font-semibold text-brand-950">What do you need to confirm?</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Select one or more. Quebec answers only the facts you pick — nothing else is revealed.
              </p>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {CHECK_DEFS.map((c) => {
                  const checked = selected.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCheck(c.id)}
                      aria-pressed={checked}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-all",
                        checked
                          ? "border-teal-300 bg-teal-50/50 shadow-sm"
                          : "border-border bg-white hover:border-brand-200 hover:bg-brand-50/40"
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        className="pointer-events-none mt-0.5"
                        aria-label={c.label}
                      />
                      <span>
                        <span className={cn("block text-sm font-semibold", checked ? "text-brand-950" : "text-brand-900")}>
                          {c.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {c.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3 — verify */}
            <Button
              size="xl"
              variant="brand"
              className="mt-7 w-full text-base font-semibold"
              disabled={!canVerify}
              onClick={runVerify}
            >
              {verifying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Verify
                </>
              )}
            </Button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Fingerprint className="h-3.5 w-3.5 text-brand-400" />
              You&apos;ll receive only a signed YES / NO and a receipt — never the underlying record.
            </p>
          </CardContent>
        </Card>
      )}

      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-teal-600" />
        Why trust the answer? Every result is signed, timestamped and re-checkable on the receipt.
        <Link href="/how-it-works" className="font-medium text-teal-700 hover:underline">
          See how it works
        </Link>
      </p>
    </div>
  );
}
