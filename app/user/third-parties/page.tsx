"use client";

import { Building2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/dashboard/app-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { ThirdPartiesTable } from "@/components/flows/third-parties-table";
import { useApp } from "@/state/app-context";

export default function ThirdPartiesPage() {
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
        eyebrow="Your portal"
        title="Third parties"
        description="Every business that has ever used your data — current, pending or revoked. Choose who can verify facts about you."
      />

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gold-strong" />
            Access
          </CardTitle>
          <CardDescription>
            Approve new requests, revoke access, or let a business back in — each change is
            logged to your activity timeline.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ThirdPartiesTable />
        </CardContent>
      </Card>

      <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-gold-strong" />
        Every action above is a real event in this demo&apos;s audit trail — no data behind the scenes.
      </p>
    </AppShell>
  );
}
