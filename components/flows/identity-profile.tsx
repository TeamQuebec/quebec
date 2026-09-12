"use client";

import type { ReactNode } from "react";
import { Fingerprint, Lock, ScanFace, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/site/copy-button";
import { AbsenceNote } from "@/components/site/absence-note";
import { avatarColor, initials } from "@/components/site/business-avatar";
import { useApp } from "@/state/app-context";
import { computeAge, formatDateTime, formatDob } from "@/lib/format";
import { cn } from "@/lib/utils";

/** "40172345678" -> "•••••••5678" : only the tail ever visible. */
function maskNin(nin: string): string {
  if (!nin) return ":";
  return `${"•".repeat(Math.max(0, nin.length - 4))}${nin.slice(-4)}`;
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right text-sm font-medium text-brand-950">{children}</dd>
    </div>
  );
}

/**
 * The user's identity record : the whole thing that exists behind a reference.
 * NIN is always masked; the point of the page is that there is nothing else to
 * see, and that nothing on it is ever shared with a verifier.
 */
export function IdentityProfile() {
  const { store, activeIdentity, setActiveIdentity } = useApp();

  if (!store || !activeIdentity) return null;

  const id = activeIdentity;
  const verified = id.kycStatus === "verified";
  const age = computeAge(id.dob);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          {/* Identity switcher + status */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Select value={id.id} onValueChange={(v) => setActiveIdentity(v)}>
              <SelectTrigger className="h-8 w-auto gap-2 rounded-full border-brand-200 bg-white text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {store.identities.map((i) => (
                  <SelectItem key={i.id} value={i.id} className="font-normal">
                    {i.name} · {i.uniqueId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* "Verified" is the system attesting to the record's provenance, so
                it is green — the same claim axis as a signed receipt. */}
            <Badge variant={verified ? "success" : "muted"} className="gap-1">
              {verified ? (
                <>
                  <ShieldCheck className="h-3 w-3" />
                  Verified record
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  Self-asserted
                </>
              )}
            </Badge>
          </div>

          {/* Identity header */}
          <div className="mt-6 flex items-center gap-4">
            <span
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold ring-1",
                avatarColor(id.id)
              )}
            >
              {initials(id.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-bold tracking-tight text-brand-950">
                {id.name}
              </p>
              <p className="mt-0.5 flex items-center gap-2">
                <span className="ref-plate text-sm font-medium text-brand-700">{id.uniqueId}</span>
                <CopyButton text={id.uniqueId} />
              </p>
            </div>
          </div>

          {/* Record detail */}
          <dl className="mt-6 divide-y divide-border border-t border-border">
            <DetailRow label="Full name">{id.name}</DetailRow>
            <DetailRow label="Reference">{id.uniqueId}</DetailRow>
            <DetailRow label="Date of birth">
              {formatDob(id.dob)}
              {age >= 0 && <span className="text-muted-foreground"> · {age}</span>}
            </DetailRow>
            <DetailRow label="National ID (NIN)">
              <span className="font-mono tracking-[0.14em]">{maskNin(id.nin)}</span>
            </DetailRow>
            <DetailRow label="Biometric">
              {id.biometric ? (
                <span className="inline-flex items-center gap-1.5">
                  {id.biometric === "fingerprint" ? (
                    <Fingerprint className="h-3.5 w-3.5 text-brand-400" aria-hidden="true" />
                  ) : (
                    <ScanFace className="h-3.5 w-3.5 text-brand-400" aria-hidden="true" />
                  )}
                  {id.biometric === "fingerprint" ? "Fingerprint" : "Face"}
                </span>
              ) : (
                /* Absence, so it is muted and says so plainly rather than
                   showing a dash that could read as a rendering bug. */
                <span className="font-normal text-muted-foreground">Not enrolled</span>
              )}
            </DetailRow>
            <DetailRow label="KYC status">
              <Badge variant={verified ? "success" : "muted"}>
                {verified ? "Document-verified" : "Self-asserted"}
              </Badge>
            </DetailRow>
            <DetailRow label="Record created">{formatDateTime(id.createdAt)}</DetailRow>
          </dl>
        </CardContent>
      </Card>

      {/* The thesis of the whole product, stated as an absence. */}
      <AbsenceNote icon={Lock} title="This is everything that exists.">
        Three fields built this record, plus the record of a biometric enrollment if you made one :
        nothing else is stored, and never the print or the image itself. Businesses only ever see a
        signed YES / NO to the facts you grant, never this page.
      </AbsenceNote>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Fingerprint className="h-3.5 w-3.5 text-brand-400" />
        Your reference is the only thing you ever share.
      </p>
    </div>
  );
}
