"use client";

import Link from "next/link";
import {
  ArrowRight,
  Ban,
  Hourglass,
  ScanSearch,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { initials } from "@/components/site/business-avatar";
import { AppShell } from "@/components/dashboard/app-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ActivityChart, buildActivityPoints } from "@/components/dashboard/activity-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { VerdictBadge } from "@/components/dashboard/verdict-badge";
import { GrantStatusBadge, grantStatusRank } from "@/components/dashboard/status-badge";
import { useApp } from "@/state/app-context";
import { scopeSummary } from "@/lib/checks";
import { timeAgo } from "@/lib/format";
import type { Grant, Identity } from "@/lib/types";

export default function BusinessDashboardPage() {
  const { loading, store, activeBusinessName } = useApp();

  if (loading || !store) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-72" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </AppShell>
    );
  }

  const businessId = store.activeBusinessId;
  const grants = store.grants.filter((g) => g.businessId === businessId);
  const current = grants.filter((g) => g.status === "granted").length;
  const pending = grants.filter((g) => g.status === "requested").length;
  const revoked = grants.filter((g) => g.status === "revoked").length;

  const verifications = store.verifications.filter((v) => v.businessId === businessId);
  const checksTotal = verifications.length;
  const chartData = buildActivityPoints(verifications.map((v) => v.requestedAt));

  const byIdentity = new Map(store.identities.map((i) => [i.id, i]));
  const users: { grant: Grant; identity: Identity }[] = [...grants]
    .sort(
      (a, b) =>
        grantStatusRank(a.status) - grantStatusRank(b.status) || a.identityId.localeCompare(b.identityId)
    )
    .slice(0, 4)
    .map((g) => {
      const identity = byIdentity.get(g.identityId);
      return identity ? { grant: g, identity } : null;
    })
    .filter((u): u is { grant: Grant; identity: Identity } => u !== null);

  const recent = verifications
    .slice()
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
    .slice(0, 5)
    .map((v) => ({
      id: v.id,
      icon: ShieldCheck,
      iconClass: "bg-gold-soft text-gold-strong",
      title: `Verified ${scopeSummary(v.checks.map((c) => c.checkId))}?`,
      sub: `${v.identityReference ?? "Unknown reference"} · ${timeAgo(v.requestedAt)}`,
      badge: <VerdictBadge verdict={v.verdict} />,
      href: `/receipt/${v.id}`,
      hrefLabel: "Receipt",
    }));

  return (
    <AppShell>
      <PageHeader
        eyebrow="Business dashboard"
        title={activeBusinessName}
        description="Everyone under your Quebec verification — how you're connected, what's been checked, and what you can still ask."
        actions={
          <Button variant="brand" size="sm" asChild>
            <Link href="/business/verify">
              <ScanSearch className="h-4 w-4" />
              Verify a reference
            </Link>
          </Button>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Current users"
          value={current}
          hint="can verify facts now"
          icon={Users}
          tone="gold"
        />
        <KpiCard
          label="Pending"
          value={pending}
          hint="awaiting holder approval"
          icon={Hourglass}
          tone="amber"
        />
        <KpiCard
          label="Revoked"
          value={revoked}
          hint="holders cut your access"
          icon={Ban}
          tone="rose"
        />
        <KpiCard
          label="Total checks"
          value={checksTotal}
          hint="signed verifications to date"
          icon={ShieldCheck}
          tone="brand"
        />
      </div>

      {/* Chart + recent verifications + users snapshot */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-gold-strong" />
                Checks this week
              </CardTitle>
              <CardDescription>
                Verifications your business has run over the last 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityChart data={chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ScanSearch className="h-4 w-4 text-gold-strong" />
                Recent verifications
              </CardTitle>
              <CardDescription>The latest signed checks, each re-checkable by receipt.</CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              <RecentActivity
                items={recent}
                emptyTitle="No checks yet"
                emptyBody="Verify a reference and the signed result will appear here."
              />
              <div className="mt-4 border-t border-border pt-3">
                <Link
                  href="/business/history"
                  className="inline-flex items-center gap-1 text-xs font-medium text-gold-strong hover:underline"
                >
                  View full history
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-gold-strong" />
                Users
              </CardTitle>
              <CardDescription>Who currently lets you verify facts about them.</CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              {users.length === 0 ? (
                <p className="rounded-xl border border-dashed border-brand-200 bg-brand-50/40 px-4 py-8 text-center text-xs text-muted-foreground">
                  No users yet — when a holder shares a reference with you they&apos;ll appear here.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {users.map(({ grant, identity }) => (
                    <li key={grant.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-xs font-bold text-gold-strong">
                        {initials(identity.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-brand-950">{identity.name}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {identity.uniqueId}
                        </p>
                      </div>
                      <GrantStatusBadge status={grant.status} />
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 border-t border-border pt-3">
                <Link
                  href="/business/users"
                  className="inline-flex items-center gap-1 text-xs font-medium text-gold-strong hover:underline"
                >
                  View all users ({grants.length})
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-strong" />
              Every check is signed and auditable.
            </span>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
