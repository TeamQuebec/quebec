"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ScanSearch, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/dashboard/pagination";
import { GrantStatusBadge, grantStatusRank } from "@/components/dashboard/status-badge";
import { useQueryParam } from "@/components/dashboard/use-query-param";
import { useApp } from "@/state/app-context";
import { scopeSummary } from "@/lib/checks";
import { timeAgo } from "@/lib/format";
import type { Grant, Identity, Verification } from "@/lib/types";

const PAGE_SIZE = 8;

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

interface Row {
  grant: Grant;
  identity: Identity;
  lastVerifiedAt: string | null;
  verificationCount: number;
}

export function BusinessUsersTable() {
  const { store } = useApp();
  const filter = useQueryParam("u");
  const [page, setPage] = useState(1);

  // Changing the sidebar filter starts back at page 1.
  useEffect(() => setPage(1), [filter]);

  const rows: Row[] = useMemo(() => {
    if (!store) return [];
    const businessId = store.activeBusinessId;
    const byIdentity = new Map(store.identities.map((i) => [i.id, i]));

    const verificationsByIdentity = new Map<string, Verification[]>();
    for (const v of store.verifications) {
      if (v.businessId !== businessId || !v.identityId) continue;
      const list = verificationsByIdentity.get(v.identityId) ?? [];
      list.push(v);
      verificationsByIdentity.set(v.identityId, list);
    }

    // Build rows explicitly — no nulls can reach the array, so `Row[]` always holds.
    const list: Row[] = [];
    for (const grant of store.grants) {
      if (grant.businessId !== businessId) continue;
      const identity = byIdentity.get(grant.identityId);
      if (!identity) continue;
      const vs = [...(verificationsByIdentity.get(grant.identityId) ?? [])].sort((a, b) =>
        b.requestedAt.localeCompare(a.requestedAt)
      );
      list.push({
        grant,
        identity,
        lastVerifiedAt: vs[0]?.requestedAt ?? null,
        verificationCount: vs.length,
      });
    }

    return list.sort(
      (a, b) =>
        grantStatusRank(a.grant.status) - grantStatusRank(b.grant.status) ||
        (b.grant.requestedAt ?? "").localeCompare(a.grant.requestedAt ?? "")
    );
  }, [store]);

  if (!store) return null;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-12 text-center">
        <Users className="h-6 w-6 text-brand-300" />
        <p className="mt-2 text-sm font-medium text-brand-900">No users yet</p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
          When someone shares their Quebec reference with you and runs a check, they&apos;ll
          appear here — along with their status and verification history.
        </p>
      </div>
    );
  }

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      {filter && (
        <div className="border-b border-border bg-brand-50/50 px-4 py-2.5 text-xs text-muted-foreground">
          Filtered to{" "}
          <span className="font-medium text-brand-900">
            {rows.find((r) => r.grant.identityId === filter)?.identity.name ?? "this user"}
          </span>{" "}
          ·{" "}
          <a
            href="/business/users"
            className="font-medium text-gold-strong hover:underline"
          >
            show all
          </a>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Checks allowed</TableHead>
            <TableHead className="hidden sm:table-cell">Last verified</TableHead>
            <TableHead className="hidden md:table-cell">Verifications</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map(({ grant, identity, lastVerifiedAt, verificationCount }) => (
            <TableRow key={grant.id}>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-xs font-bold text-gold-strong">
                    {initials(identity.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-brand-950">{identity.name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {identity.uniqueId}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <GrantStatusBadge status={grant.status} />
              </TableCell>
              <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                {grant.scopes.length > 0 ? scopeSummary(grant.scopes) : "—"}
              </TableCell>
              <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground sm:table-cell">
                {lastVerifiedAt ? timeAgo(lastVerifiedAt) : "Never"}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="secondary" className="font-mono">
                  {verificationCount}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/business/verify">
                      <ScanSearch className="h-3.5 w-3.5" />
                      Verify
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination page={safePage} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </>
  );
}
