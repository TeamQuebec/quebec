"use client";

import { History, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/dashboard/app-shell";
import { AccessLog } from "@/components/flows/access-log";
import { useApp } from "@/state/app-context";

export default function ActivityPage() {
  const { loading } = useApp();

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-5">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-[28rem] w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-strong">
          Your portal
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
          Activity
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          A read-only timeline of every check and permission change against your reference.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-gold-strong" />
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

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-gold-strong" />
        Every entry above is a real event in this demo&apos;s audit trail — no data behind the scenes.
      </p>
    </AppShell>
  );
}
