"use client";

import { ReceiptText, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/dashboard/app-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { VerificationHistoryTable } from "@/components/flows/verification-history-table";
import { useApp } from "@/state/app-context";

export default function BusinessHistoryPage() {
  const { loading } = useApp();

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-5">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Business dashboard"
        title="Verification history"
        description="Every signed check your business has run — the reference, the facts asked, the verdict, and a re-checkable receipt for each."
      />

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-gold-strong" />
            Check history
          </CardTitle>
          <CardDescription>
            Receipts stay valid forever — anyone can re-check one against the registry without
            ever seeing the record behind it.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <VerificationHistoryTable />
        </CardContent>
      </Card>

      <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-gold-strong" />
        Every check above is signed, timestamped and re-checkable.
      </p>
    </AppShell>
  );
}
