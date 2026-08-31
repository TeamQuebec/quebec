"use client";

import type { ReactNode } from "react";
import { Fingerprint, Lock, ShieldCheck, Sparkles } from "lucide-react";
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
import { avatarColor, initials } from "@/components/site/business-avatar";
import { useApp } from "@/state/app-context";
import { computeAge, formatDateTime, formatDob } from "@/lib/format";
import { cn } from "@/lib/utils";

/** "40172345678" -> "•••••••5678" — only the tail ever visible. */
function maskNin(nin: string): string {
  if (!nin) return "—";
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
 * The user's identity record — the whole thing that exists behind a reference.
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
        <div className="h-1.5 bg-gradient-to-r from-brand-700 via-brand-500 to-gold" />
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
            <Badge variant={verified ? "accent" : "muted"} className="gap-1">
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
            <DetailRow label="KYC status">
              <Badge variant={verified ? "accent" : "muted"}>
                {verified ? "Document-verified" : "Self-asserted"}
              </Badge>
            </DetailRow>
            <DetailRow label="Record created">{formatDateTime(id.createdAt)}</DetailRow>
          </dl>
        </CardContent>
      </Card>

      {/* Minimal-disclosure note */}
      <div className="flex items-start gap-3 rounded-xl border border-gold-border bg-gold-soft/60 p-4">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gold-strong ring-1 ring-black/5">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-brand-950">This is everything that exists.</p>
          <p className="mt-1 text-xs leading-relaxed text-brand-800">
            Three fields built this record — nothing else is stored. Businesses only ever see a
            signed YES / NO to the facts you grant, never this page.
          </p>
        </div>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Fingerprint className="h-3.5 w-3.5 text-gold-strong" />
        Your reference is the only thing you ever share.
      </p>
    </div>
  );
}
