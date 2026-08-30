"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Fingerprint,
  History,
  KeyRound,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/site/copy-button";
import { AccessList } from "@/components/flows/access-list";
import { AccessLog } from "@/components/flows/access-log";
import { useApp } from "@/state/app-context";

export default function DashboardPage() {
  const { loading, store, activeIdentity, setActiveIdentity } = useApp();

  if (loading || !store) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-12 sm:px-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // No identity at all (storage cleared) → guide to enrollment.
  if (!activeIdentity) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
          <Fingerprint className="h-7 w-7 text-brand-600" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-brand-950">
          You don&apos;t have a reference yet
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Enroll once to get your Quebec reference — then share it with businesses instead of
          your name, date of birth or NIN.
        </p>
        <Button className="mt-7" size="lg" variant="brand" asChild>
          <Link href="/user/enroll">
            Get my Quebec reference
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  const firstName = activeIdentity.name.trim().split(/\s+/)[0];
  const verified = activeIdentity.kycStatus === "verified";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-950">
            {firstName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Select
              value={activeIdentity.id}
              onValueChange={(v) => setActiveIdentity(v)}
            >
              <SelectTrigger className="h-8 w-auto gap-2 rounded-full border-brand-200 bg-white text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {store.identities.map((id) => (
                  <SelectItem key={id.id} value={id.id} className="font-normal">
                    {id.name} · {id.uniqueId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant={verified ? "accent" : "muted"} className="gap-1">
              {verified ? (
                <>
                  <BadgeCheck className="h-3 w-3" />
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
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/user/enroll">
            <Plus className="h-4 w-4" />
            Enroll a new identity
          </Link>
        </Button>
      </div>

      {/* Reference card */}
      <Card className="relative mt-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-700 via-brand-500 to-teal-500" />
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="hidden h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 sm:flex">
                <Fingerprint className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-400">
                  Your Quebec reference
                </p>
                <p className="ref-plate mt-1 text-2xl font-semibold text-brand-950 sm:text-3xl">
                  {activeIdentity.uniqueId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={activeIdentity.uniqueId} />
              <Button variant="ghost" size="sm" asChild>
                <Link href="/business/verify">
                  Open verifier portal
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            This is the <span className="font-semibold text-brand-800">only</span> thing you
            share. Businesses use it to verify facts about you — they never see your name, date
            of birth or NIN. You can revoke their access at any time below.
          </p>
        </CardContent>
      </Card>

      {/* Who has access */}
      <Card className="mt-8">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-teal-600" />
            Who can check facts about you
          </CardTitle>
          <CardDescription>
            Businesses you&apos;ve shared your reference with — and what they&apos;re allowed to verify.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccessList />
        </CardContent>
      </Card>

      {/* Access log */}
      <Card className="mt-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-teal-600" />
            Access log
          </CardTitle>
          <CardDescription>
            Read-only, transparent record of every check and permission change — you stay in the loop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccessLog />
        </CardContent>
      </Card>

      <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
        Every entry above is a real event in this demo&apos;s audit trail — no data behind the scenes.
      </p>
    </div>
  );
}
