"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Download,
  Fingerprint,
  Loader2,
  PartyPopper,
  ScanFace,
  ShieldCheck,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/site/copy-button";
import { AbsenceNote } from "@/components/site/absence-note";
import { useApp } from "@/state/app-context";
import { SYNTHETIC_USERS } from "@/lib/mockData/users";
import { computeAge, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BiometricKind, Identity } from "@/lib/types";

type Field = "name" | "dob" | "nin";

/** The two enrollment options, and what each one would ask of you for real. */
const BIOMETRICS: { kind: BiometricKind; icon: LucideIcon; label: string; hint: string }[] = [
  { kind: "fingerprint", icon: Fingerprint, label: "Fingerprint", hint: "Touch sensor · three presses" },
  { kind: "face", icon: ScanFace, label: "Face", hint: "Front camera · one look" },
];

const BIOMETRIC_LABEL: Record<BiometricKind, string> = {
  fingerprint: "Fingerprint",
  face: "Face",
};

/** Format-level validation, run inline as the user types/blurs. */
function validateField(field: Field, value: string): string | undefined {
  if (field === "name") {
    const v = value.trim();
    if (v.length < 2) return "Enter at least 2 characters.";
    if (!/^[A-Za-z][A-Za-z .'-]+$/.test(v)) return "Letters, spaces, hyphens and apostrophes only.";
    return undefined;
  }
  if (field === "dob") {
    if (!value) return "Enter your date of birth.";
    const d = new Date(value);
    const age = computeAge(value);
    if (Number.isNaN(d.getTime()) || age < 0) return "Enter a valid date in the past.";
    if (age > 110) return "That date looks too far back.";
    return undefined;
  }
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "Enter your 11-digit NIN.";
  if (digits.length < 11) return `${digits.length}/11 digits : keep typing.`;
  if (digits.length > 11) return "Exactly 11 digits : remove the extras.";
  return undefined;
}

function FlowStep({ n, title, active, done }: { n: string; title: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
          // Completed is a state, so it is ink like the active step — not gold.
          done
            ? "border-brand-900 bg-brand-900 text-white"
            : active
              ? "border-brand-800 bg-brand-800 text-white"
              : "border-brand-200 bg-white text-brand-400"
        )}
      >
        {done ? "✓" : n}
      </span>
      <span className={cn("text-sm font-medium", active || done ? "text-brand-950" : "text-brand-400")}>
        {title}
      </span>
    </div>
  );
}

export function EnrollForm() {
  const { enroll } = useApp();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [nin, setNin] = useState("");
  const [biometric, setBiometric] = useState<BiometricKind | null>(null);
  const [capturing, setCapturing] = useState<BiometricKind | null>(null);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);

  // The capture is a timer, so it has to be cancellable — submitting mid-capture
  // swaps this form out for the success screen, and a stray tick would then land
  // on a component that is no longer mounted.
  const captureTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (captureTimer.current !== null) window.clearTimeout(captureTimer.current);
    },
    []
  );

  // Inline validation : an error only appears after the field is touched, then
  // updates live as the user fixes it. Nothing waits for submit.
  const errName = touched.name ? validateField("name", name) : undefined;
  const errDob = touched.dob ? validateField("dob", dob) : undefined;
  const errNin = touched.nin ? validateField("nin", nin) : undefined;

  const allValid = useMemo(
    () => !validateField("name", name) && !validateField("dob", dob) && !validateField("nin", nin),
    [name, dob, nin]
  );

  const markTouched = (field: Field) => setTouched((prev) => ({ ...prev, [field]: true }));

  /**
   * Simulated capture. Nothing is read from a sensor and nothing is kept : the
   * pause is here because the real gesture has one, and a biometric that
   * enrolled instantly would teach the wrong thing about what it costs.
   */
  const capture = (kind: BiometricKind) => {
    if (capturing) return;
    setCapturing(kind);
    captureTimer.current = window.setTimeout(() => {
      captureTimer.current = null;
      setBiometric(kind);
      setCapturing(null);
      toast.success(`${BIOMETRIC_LABEL[kind]} captured`, {
        description: "Demo only : no sensor was read and no biometric data was stored.",
      });
    }, 900);
  };

  const clearBiometric = () => {
    if (capturing) return;
    setBiometric(null);
  };

  const fillDemo = () => {
    const u = SYNTHETIC_USERS[Math.floor(Math.random() * SYNTHETIC_USERS.length)];
    setName(u.name);
    setDob(u.dob);
    setNin(u.nin);
    setBiometric(Math.random() < 0.5 ? "fingerprint" : "face");
    setTouched({ name: true, dob: true, nin: true });
    toast("Demo identity loaded", {
      description: "A synthetic record has been filled in : you can edit it or submit as-is.",
    });
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setTouched({ name: true, dob: true, nin: true });
    if (!allValid) {
      toast.error("Fix the highlighted fields to continue");
      return;
    }
    setSubmitting(true);
    try {
      const id = await enroll({
        name: name.trim(),
        dob,
        nin: nin.replace(/\D/g, "").slice(0, 11),
        biometric,
      });
      setIdentity(id);
      toast.success(`Welcome, ${name.trim().split(" ")[0]}`, {
        description: "Your Quebec reference is ready to share.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const downloadReference = () => {
    if (!identity) return;
    const text = [
      "QUEBEC : IDENTITY REFERENCE",
      "----------------------------",
      `Reference: ${identity.uniqueId}`,
      `Created:   ${formatDateTime(identity.createdAt)}`,
      "",
      "This is your permanent reference. Hand it to a business and they can",
      "verify facts about you (age, name, verified identity) WITHOUT seeing",
      "your name, date of birth or NIN.",
      "",
      "Keep it safe. If you lose it you can re-enroll : but businesses you",
      "shared the old reference with would need the new one from you.",
      "",
      "Quebec demo : synthetic identity data, no real personal information.",
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quebec-reference-${identity.uniqueId}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Reference downloaded : save it somewhere safe");
  };

  // ---- Success state -------------------------------------------------------
  if (identity) {
    return (
      <div className="animate-fade-up">
        <Card className="overflow-hidden">
          <CardContent className="p-8 sm:p-10">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-verify-soft ring-8 ring-verify-soft/50">
                <PartyPopper className="h-7 w-7 text-verify-strong" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-brand-950">
                Your identity reference is ready
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                This is the <span className="font-semibold text-brand-900">only</span> thing you
                will ever share with a business. It verifies facts about you : it never reveals
                your name, date of birth, or NIN.
              </p>
            </div>

            {/* Save / screenshot prompt : this ID is their permanent reference */}
            <div className="mx-auto mt-7 max-w-md rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/70 px-5 py-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                Save this now : it&apos;s your permanent reference
              </p>
              <p className="ref-plate mt-2 text-3xl font-semibold text-brand-950">
                {identity.uniqueId}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-amber-800">
                Screenshot this screen, or download it below. If you lose it, you&apos;ll need to
                re-enroll : and businesses you shared the old reference with would need the new one.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                <CopyButton text={identity.uniqueId} />
                <Button variant="outline" size="sm" onClick={downloadReference}>
                  <Download className="h-3.5 w-3.5" />
                  Download reference
                </Button>
              </div>
            </div>

            <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Fingerprint className="h-3.5 w-3.5 text-brand-400" />
                Hand this reference to any business that needs to verify you.
              </p>
              {identity.biometric && (
                <p className="flex items-center gap-1.5">
                  <ScanFace className="h-3.5 w-3.5 text-brand-400" />
                  {BIOMETRIC_LABEL[identity.biometric]} enrolled. The print itself was never
                  captured or stored.
                </p>
              )}
              <p className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                You can see : and revoke : every check they run, anytime.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/user/dashboard">
                  Open my dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/business/verify">
                  Try verifying it as a business
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Form state ----------------------------------------------------------
  return (
    <div className="animate-fade-up">
      <div className="mb-8 flex items-center justify-center gap-2 sm:gap-6">
        <FlowStep n="1" title="Your details" active done={false} />
        <span className="h-px w-8 bg-brand-200" />
        <FlowStep n="2" title="Your reference" active={false} done={false} />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-brand-950">
                Enroll your identity
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Three fields, and a biometric if you want one. Your record stays private:
                encrypted, and never shown raw to verifiers.
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={fillDemo}>
              <Sparkles className="h-4 w-4 text-brand-400" />
              Try a demo identity
            </Button>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5 text-brand-400" />
                Full name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => markTouched("name")}
                  placeholder="e.g. Adaeze Okafor"
                  autoComplete="off"
                  aria-invalid={!!errName}
                  className={cn(
                    "pr-10",
                    errName && "border-rose-400 focus-visible:ring-rose-400/40"
                  )}
                />
                {!errName && touched.name && name && (
                  // Green on the tick only. The field's border used to go gold
                  // when valid, so a correctly-filled input was the same colour
                  // as a verified YES — and the default border is already the
                  // valid state, so the border needed no colour at all.
                  <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-verify" />
                )}
              </div>
              {errName ? (
                <p className="text-xs text-rose-600">{errName}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Your legal name : letters, spaces, hyphens.
                </p>
              )}
            </div>

            {/* Date of birth */}
            <div className="space-y-2">
              <Label htmlFor="dob" className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-brand-400" />
                Date of birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                onBlur={() => markTouched("dob")}
                max={new Date().toISOString().slice(0, 10)}
                aria-invalid={!!errDob}
                className={cn(
                  errDob && "border-rose-400 focus-visible:ring-rose-400/40"
                )}
              />
              {errDob ? (
                <p className="text-xs text-rose-600">{errDob}</p>
              ) : touched.dob && dob ? (
                <p className="flex items-center gap-1 text-xs text-verify-strong">
                  <Check className="h-3 w-3" />
                  Looks good
                </p>
              ) : null}
            </div>

            {/* NIN */}
            <div className="space-y-2">
              <Label htmlFor="nin" className="flex items-center gap-1.5">
                <Fingerprint className="h-3.5 w-3.5 text-brand-400" />
                National ID number (NIN)
              </Label>
              <div className="relative">
                <Input
                  id="nin"
                  value={nin}
                  onChange={(e) => setNin(e.target.value.replace(/[^\d\s]/g, "").slice(0, 14))}
                  onBlur={() => markTouched("nin")}
                  placeholder="11 digits"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-invalid={!!errNin}
                  className={cn(
                    "ref-plate pr-10",
                    errNin && "border-rose-400 focus-visible:ring-rose-400/40"
                  )}
                />
                {!errNin && touched.nin && nin.replace(/\D/g, "").length === 11 && (
                  <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-verify" />
                )}
              </div>
              {errNin ? (
                <p className="text-xs text-rose-600">{errNin}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  11-digit format only.{" "}
                  <span className="italic">This demo does not check against the real registry.</span>
                </p>
              )}
            </div>

            {/* Biometric. Optional, and the reason is on the card: Quebec keeps
                the enrollment, not the print. A field that says "optional" and
                then explains what it does not collect is the honest version of
                asking for a fingerprint. */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                {/* Not a <Label> : this names a group of two controls, not one
                    field, so it is a span the group points at. Label would have
                    rendered a <label> bound to nothing. */}
                <span
                  id="biometric-label"
                  className="flex items-center gap-1.5 text-sm font-medium leading-none text-brand-900"
                >
                  <ScanFace className="h-3.5 w-3.5 text-brand-400" />
                  Biometric
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Optional
                </span>
              </div>

              <div
                className="grid gap-2.5 sm:grid-cols-2"
                role="group"
                aria-labelledby="biometric-label"
              >
                {BIOMETRICS.map((b) => {
                  const Icon = b.icon;
                  const enrolled = biometric === b.kind;
                  const busy = capturing === b.kind;
                  return (
                    <button
                      key={b.kind}
                      type="button"
                      onClick={() => capture(b.kind)}
                      aria-pressed={enrolled}
                      disabled={capturing !== null}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed",
                        // Enrolled is a state, so it is ink — the same rule the
                        // checkable facts follow on the verifier's side.
                        enrolled
                          ? "border-brand-800 bg-brand-50 shadow-sm"
                          : "border-border bg-white hover:border-brand-200 hover:bg-brand-50/40",
                        capturing !== null && !busy && "opacity-50"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                          enrolled ? "border-brand-800 bg-white text-brand-900" : "border-border text-brand-400"
                        )}
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0">
                        <span className={cn("flex items-center gap-1.5 text-sm font-semibold", enrolled ? "text-brand-950" : "text-brand-900")}>
                          {b.label}
                          {enrolled && <Check className="h-3.5 w-3.5 text-verify" />}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {busy ? "Capturing…" : enrolled ? "Enrolled · demo capture" : b.hint}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {biometric ? (
                <p className="flex items-center gap-1.5 text-xs text-verify-strong">
                  <Check className="h-3 w-3" />
                  {BIOMETRIC_LABEL[biometric]} enrolled.{" "}
                  <button
                    type="button"
                    onClick={clearBiometric}
                    className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-950"
                  >
                    Remove
                  </button>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Bind a fingerprint or a face to this reference : your record then carries proof
                  that one was enrolled. Skip it and the record still works.
                </p>
              )}
            </div>

            {/* What happens to this data next : an absence claim, so it gets the
                dashed register rather than an accent-tinted aside. */}
            <AbsenceNote icon={ShieldCheck}>
              Your details are sealed with <span className="font-semibold">AES-GCM</span> before they
              touch storage, and are never shown raw to verifiers : they only ever receive the signed
              YES / NO answer to the checks you allow.
            </AbsenceNote>

            <Button
              type="submit"
              size="lg"
              variant="brand"
              className="w-full"
              disabled={submitting || !allValid}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating your reference…
                </>
              ) : (
                <>
                  Generate my Quebec reference
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            {!allValid && !submitting && (
              <p className="text-center text-xs text-muted-foreground">
                Complete the highlighted fields to generate your reference.
              </p>
            )}

            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Synthetic demo only : no real identity registry is contacted, and nothing you type
              is validated against real data.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
