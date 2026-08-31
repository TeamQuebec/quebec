"use client";

import Link from "next/link";
import { ScanSearch, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/dashboard/app-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { BusinessUsersTable } from "@/components/flows/business-users-table";
import { useApp } from "@/state/app-context";

export default function BusinessUsersPage() {
  const { loading, activeBusinessName } = useApp();

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
        title="Your users"
        description={`People who've shared a Quebec reference with ${activeBusinessName}. Their status shows whether you can verify facts right now.`}
      />

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gold-strong" />
            Access
          </CardTitle>
          <CardDescription>
            Each row links straight to a verification — all you need is their reference.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <BusinessUsersTable />
        </CardContent>
      </Card>

      <p className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          Every check is signed and auditable.
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Link href="/business/verify" className="font-medium text-gold-strong hover:underline">
            <ScanSearch className="mr-1 inline h-3.5 w-3.5" />
            Verify a reference
          </Link>
        </span>
      </p>
    </AppShell>
  );
}
