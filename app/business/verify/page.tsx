"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/dashboard/app-shell";
import { PageHeader } from "@/components/dashboard/page-header";
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
      {/* Was a hand-rolled copy of PageHeader. */}
      <PageHeader
        eyebrow="Verifier portal"
        title="Verify a customer"
        description="All you need is their reference. Ask for a fact, get a signed answer."
      />
      <VerifyConsole />
    </AppShell>
  );
}
