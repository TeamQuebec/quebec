"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/dashboard/app-shell";
import { VerifyConsole } from "@/components/flows/verify-console";
import { useApp } from "@/state/app-context";

export default function VerifyPage() {
  const { loading } = useApp();

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-5">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-[28rem] w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-strong">
          Verifier portal
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
          Verify a customer
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          All you need is their reference. Ask for a fact, get a signed answer.
        </p>
      </div>
      <VerifyConsole />
    </AppShell>
  );
}
