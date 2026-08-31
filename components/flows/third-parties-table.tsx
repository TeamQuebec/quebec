"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, Check, SearchX, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/dashboard/pagination";
import { GrantStatusBadge, grantStatusRank } from "@/components/dashboard/status-badge";
import { useQueryParam } from "@/components/dashboard/use-query-param";
import { BusinessAvatar } from "@/components/site/business-avatar";
import { useApp } from "@/state/app-context";
import { scopeSummary } from "@/lib/checks";
import { timeAgo } from "@/lib/format";
import type { Grant } from "@/lib/types";

const PAGE_SIZE = 8;

function dateLabel(g: Grant): string {
  switch (g.status) {
    case "granted":
      return `Access granted ${g.grantedAt ? timeAgo(g.grantedAt) : "recently"}`;
    case "requested":
      return `Requested ${g.requestedAt ? timeAgo(g.requestedAt) : ""}`;
    case "revoked":
      return `Revoked ${g.revokedAt ? timeAgo(g.revokedAt) : ""}`;
  }
}

export function ThirdPartiesTable() {
  const { activeGrants, businessesById, revokeGrant, approveGrant, denyGrant, restoreGrant } =
    useApp();
  const filter = useQueryParam("b");
  const [page, setPage] = useState(1);
  const [toRevoke, setToRevoke] = useState<Grant | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Changing the sidebar filter starts back at page 1.
  useEffect(() => setPage(1), [filter]);

  const rows = useMemo(() => {
    const list = filter ? activeGrants.filter((g) => g.businessId === filter) : activeGrants;
    return [...list].sort(
      (a, b) =>
        grantStatusRank(a.status) - grantStatusRank(b.status) ||
        (b.requestedAt ?? "").localeCompare(a.requestedAt ?? "")
    );
  }, [activeGrants, filter]);

  const run = async (id: string, fn: (gid: string) => Promise<void>, message: string) => {
    setBusyId(id);
    try {
      await fn(id);
      toast.success(message);
    } finally {
      setBusyId(null);
    }
  };

  if (activeGrants.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-12 text-center">
        <SearchX className="h-6 w-6 text-brand-300" />
        <p className="mt-2 text-sm font-medium text-brand-900">No third parties yet</p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
          Share your Quebec reference with a business and it will appear here the moment it
          checks a fact about you — current, pending or revoked.
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
            {businessesById[filter]?.name ?? "this third party"}
          </span>{" "}
          ·{" "}
          <a
            href="/user/third-parties"
            className="font-medium text-gold-strong hover:underline"
          >
            show all
          </a>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Third party</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Checks allowed</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((g) => {
            const biz = businessesById[g.businessId];
            if (!biz) return null;
            const busy = busyId === g.id;
            const checks = g.scopes.length > 0 ? scopeSummary(g.scopes) : "Facts you allow";

            return (
              <TableRow key={g.id}>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-3">
                    <BusinessAvatar
                      name={biz.name}
                      seed={biz.id}
                      className={g.status === "revoked" ? "grayscale" : undefined}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-brand-950">{biz.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{biz.sector}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <GrantStatusBadge status={g.status} />
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                  {checks}
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground sm:table-cell">
                  {dateLabel(g)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {g.status === "granted" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                        onClick={() => setToRevoke(g)}
                        disabled={busy}
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Revoke
                      </Button>
                    )}
                    {g.status === "requested" && (
                      <>
                        <Button
                          size="sm"
                          variant="accent"
                          onClick={() =>
                            run(g.id, approveGrant, `${biz.name} can now verify facts about you.`)
                          }
                          disabled={busy}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-brand-600"
                          onClick={() => run(g.id, denyGrant, `Request from ${biz.name} declined.`)}
                          disabled={busy}
                        >
                          <X className="h-3.5 w-3.5" />
                          Decline
                        </Button>
                      </>
                    )}
                    {g.status === "revoked" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={() =>
                          run(g.id, restoreGrant, `You allowed ${biz.name} to verify facts again.`)
                        }
                        disabled={busy}
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        Allow again
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Pagination page={safePage} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      {/* Confirm revoke — same copy as the old access-list dialog */}
      <Dialog open={toRevoke !== null} onOpenChange={(open) => !open && setToRevoke(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Revoke {toRevoke ? businessesById[toRevoke.businessId]?.name : ""}&apos;s access?
            </DialogTitle>
            <DialogDescription>
              {toRevoke ? businessesById[toRevoke.businessId]?.name : "This third party"} will
              immediately lose the ability to verify any facts against your reference. Their past
              checks stay in your log — but no new ones will succeed. You can allow them again
              later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setToRevoke(null)}>
              Keep access
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (toRevoke) {
                  await run(
                    toRevoke.id,
                    revokeGrant,
                    `Access revoked for ${businessesById[toRevoke.businessId]?.name}.`
                  );
                  setToRevoke(null);
                }
              }}
            >
              <Ban className="h-4 w-4" />
              Yes, revoke access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
