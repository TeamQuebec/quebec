"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  Building2,
  Fingerprint,
  Hourglass,
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
import { BusinessAvatar } from "@/components/site/business-avatar";
import { AppShell } from "@/components/dashboard/app-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ActivityChart, buildActivityPoints } from "@/components/dashboard/activity-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { GrantStatusBadge, grantStatusRank } from "@/components/dashboard/status-badge";
import { TYPE_STYLE } from "@/components/flows/access-log";
import { useApp } from "@/state/app-context";
import { timeAgo } from "@/lib/format";

export default function DashboardPage() {
  const { loading, store, activeIdentity, setActiveIdentity, activeGrants, activeLog, businessesById } =
    useApp();

  if (loading || !store) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full rounded-xl" />
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

  // No identity at all (storage cleared) → guide to enrollment.
  if (!activeIdentity) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl py-12 text-center sm:py-16">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-soft">
            <Fingerprint className="h-7 w-7 text-gold-strong" />
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
      </AppShell>
    );
  }

  const firstName = activeIdentity.name.trim().split(/\s+/)[0];
  const verified = activeIdentity.kycStatus === "verified";
  const current = activeGrants.filter((g) => g.status === "granted").length;
  const pending = activeGrants.filter((g) => g.status === "requested").length;
  const revoked = activeGrants.filter((g) => g.status === "revoked").length;

  const myVerifications = store.verifications.filter((v) => v.identityId === activeIdentity.id);
  const checksTotal = myVerifications.length;
  const chartData = buildActivityPoints(myVerifications.map((v) => v.requestedAt));

  const parties = [...activeGrants]
    .sort(
      (a, b) =>
        grantStatusRank(a.status) - grantStatusRank(b.status) ||
        a.businessId.localeCompare(b.businessId)
    )
    .slice(0, 4);

  const recent = activeLog.slice(0, 5).map((entry) => {
    const style = TYPE_STYLE[entry.type];
    return {
      id: entry.id,
      icon: style.icon,
      iconClass: style.classes,
      title: entry.message,
      sub: timeAgo(entry.at),
      href: entry.verificationId ? `/receipt/${entry.verificationId}` : undefined,
      hrefLabel: "Receipt",
    };
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Your portal"
        title={firstName}
        description="Every business that can verify facts about you, what's been checked recently, and the activity on your reference."
        actions={
          <>
            <Select value={activeIdentity.id} onValueChange={(v) => setActiveIdentity(v)}>
              <SelectTrigger className="h-9 w-auto gap-2 rounded-full border-brand-200 bg-white text-xs font-medium">
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
            <Badge variant={verified ? "accent" : "muted"} className="hidden gap-1 sm:inline-flex">
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
            <Button variant="outline" size="sm" asChild>
              <Link href="/user/enroll">
                <Plus className="h-4 w-4" />
                Enroll
              </Link>
            </Button>
          </>
        }
      />

      {/* Reference card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-700 via-brand-500 to-gold" />
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="hidden h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-gold-strong sm:flex">
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
                <Link href="/user/profile">
                  View record
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

      {/* KPI row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Current"
          value={current}
          hint="can verify facts now"
          icon={KeyRound}
          tone="gold"
        />
        <KpiCard
          label="Pending"
          value={pending}
          hint="awaiting your approval"
          icon={Hourglass}
          tone="amber"
        />
        <KpiCard
          label="Revoked"
          value={revoked}
          hint="no longer have access"
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

      {/* Chart + recent activity + third-party snapshot */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-gold-strong" />
                Checks this week
              </CardTitle>
              <CardDescription>
                Signed verifications against your reference over the last 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityChart data={chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-gold-strong" />
                Recent activity
              </CardTitle>
              <CardDescription>The latest checks and permission changes on your record.</CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              <RecentActivity
                items={recent}
                emptyTitle="No activity yet"
                emptyBody="Every check a business runs and every permission change will appear here."
              />
              <div className="mt-4 border-t border-border pt-3">
                <Link
                  href="/user/activity"
                  className="inline-flex items-center gap-1 text-xs font-medium text-gold-strong hover:underline"
                >
                  View full activity
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
                <KeyRound className="h-4 w-4 text-gold-strong" />
                Third parties
              </CardTitle>
              <CardDescription>Who currently holds access to your reference.</CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              {parties.length === 0 ? (
                <p className="rounded-xl border border-dashed border-brand-200 bg-brand-50/40 px-4 py-8 text-center text-xs text-muted-foreground">
                  No businesses yet — share your reference and they&apos;ll appear here.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {parties.map((g) => {
                    const biz = businessesById[g.businessId];
                    if (!biz) return null;
                    return (
                      <li key={g.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <BusinessAvatar name={biz.name} seed={biz.id} className="h-9 w-9 text-xs" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-brand-950">{biz.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{biz.sector}</p>
                        </div>
                        <GrantStatusBadge status={g.status} />
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-4 border-t border-border pt-3">
                <Link
                  href="/user/third-parties"
                  className="inline-flex items-center gap-1 text-xs font-medium text-gold-strong hover:underline"
                >
                  Manage all ({activeGrants.length})
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-gold-strong" />
            Every action above is a real event in this demo&apos;s audit trail.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
