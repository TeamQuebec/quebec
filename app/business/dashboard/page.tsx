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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { initials } from "@/components/site/business-avatar";
import { AppShell } from "@/components/dashboard/app-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatStrip } from "@/components/dashboard/stat-strip";
import { ActivityChart, buildActivityPoints } from "@/components/dashboard/activity-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { VerdictBadge } from "@/components/dashboard/verdict-badge";
import { GrantStatusBadge, grantStatusRank } from "@/components/dashboard/status-badge";
import { useApp } from "@/state/app-context";
import { scopeSummary } from "@/lib/checks";
import { timeAgo } from "@/lib/format";
import type { Grant, Identity, Verdict } from "@/lib/types";

/**
 * The verdict, at hero scale, on the dark plate. Only YES takes gold — it is the
 * answer, and gold is the answer's colour. Everything else is legible white or a
 * semantic rose/amber, never a decorative hue.
 */
const VERDICT_HERO: Record<Verdict, { label: string; cls: string }> = {
  yes: { label: "YES", cls: "text-af-accent" },
  no: { label: "NO", cls: "text-rose-300" },
  no_match: { label: "NO MATCH", cls: "text-white/70" },
  revoked: { label: "REVOKED", cls: "text-rose-300" },
  pending: { label: "PENDING", cls: "text-amber-300" },
  unconfirmed: { label: "UNCONFIRMED", cls: "text-amber-300" },
};

export default function BusinessDashboardPage() {
  const { loading, store, activeBusinessName, setActiveBusiness } = useApp();

  if (loading || !store) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-36 w-full rounded-xl" />
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

  const lastVerdict =
    verifications.length > 0
      ? verifications.reduce((a, b) => (b.requestedAt.localeCompare(a.requestedAt) > 0 ? b : a))
      : null;

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
      iconClass: "bg-brand-50 text-brand-700",
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
        description="Everyone under your Quebec verification: how you're connected, what's been checked, and what you can still ask."
        actions={
          <>
            <Select value={businessId} onValueChange={(v) => setActiveBusiness(v)}>
              <SelectTrigger className="h-9 w-auto gap-2 rounded-full border-brand-200 bg-white text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {store.businesses.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="font-normal">
                    {b.name} · {b.sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="brand" size="sm" asChild>
              <Link href="/business/verify">
                <ScanSearch className="h-4 w-4" />
                Verify a reference
              </Link>
            </Button>
          </>
        }
      />

      {/* The signed answer — the hero object.
          For a holder the hero is the reference; the reference IS the product.
          For a business the product's output is a verdict, so the most recent
          signed answer gets the plate. It is also the portal's one dark moment
          (every surface here was white on white) and the one place gold earns its
          keep on this page: a YES is the answer, and the answer is what gold is
          for. Every other colour on the page is structure. */}
      <section className="relative overflow-hidden rounded-xl bg-brand-900 p-6 sm:p-8">
        <div className="bg-grid-light absolute inset-0" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/60">
              Latest signed answer
            </p>
            {lastVerdict ? (
              <>
                <p
                  className={cn(
                    "mt-3 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-bold leading-none tracking-[-0.04em]",
                    VERDICT_HERO[lastVerdict.verdict].cls
                  )}
                >
                  {VERDICT_HERO[lastVerdict.verdict].label}
                </p>
                <p className="mt-4 max-w-[560px] text-[13px] leading-relaxed text-white/70">
                  {scopeSummary(lastVerdict.checks.map((c) => c.checkId))} ·{" "}
                  {lastVerdict.identityReference ?? "Unknown reference"} ·{" "}
                  {timeAgo(lastVerdict.requestedAt)}
                </p>
              </>
            ) : (
              <>
                <p className="mt-3 font-display text-[clamp(1.5rem,3.5vw,2.2rem)] font-bold leading-[1.05] tracking-[-0.04em] text-white">
                  Nothing checked yet.
                </p>
                <p className="mt-4 max-w-[560px] text-[13px] leading-relaxed text-white/70">
                  Ask a holder for their Quebec reference and verify one fact. The signed answer
                  lands here, with a receipt you can keep.
                </p>
              </>
            )}
          </div>
          <Link
            href="/business/verify"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[7px] bg-af-accent px-[18px] py-[11px] text-[14px] font-semibold text-brand-950 transition-colors hover:bg-af-accent/90"
          >
            <ScanSearch className="h-4 w-4" aria-hidden="true" />
            Verify a reference
          </Link>
        </div>
      </section>

      {/* Metric strip */}
      <StatStrip
        className="mt-8"
        stats={[
          {
            label: "Current users",
            value: current,
            hint: "can verify facts now",
            icon: Users,
            tone: "neutral",
          },
          {
            label: "Pending",
            value: pending,
            hint: "awaiting holder approval",
            icon: Hourglass,
            tone: "amber",
          },
          {
            label: "Revoked",
            value: revoked,
            hint: "holders cut your access",
            icon: Ban,
            tone: "rose",
          },
          {
            label: "Total checks",
            value: checksTotal,
            hint: "signed verifications to date",
            icon: ShieldCheck,
            tone: "neutral",
          },
        ]}
      />

      {/* Chart + recent verifications + users snapshot */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-brand-400" />
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
                <ScanSearch className="h-4 w-4 text-brand-400" />
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
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-900 hover:underline"
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
                <Users className="h-4 w-4 text-brand-400" />
                Users
              </CardTitle>
              <CardDescription>Who currently lets you verify facts about them.</CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              {users.length === 0 ? (
                <p className="rounded-xl border border-dashed border-brand-200 bg-brand-50/40 px-4 py-8 text-center text-xs text-muted-foreground">
                  No users yet: when a holder shares a reference with you they&apos;ll appear here.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {users.map(({ grant, identity }) => (
                    <li key={grant.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
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
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-900 hover:underline"
                >
                  View all users ({grants.length})
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
              Every check is signed and auditable.
            </span>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
