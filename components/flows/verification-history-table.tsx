"use client";

import { useMemo, useState } from "react";
import { ChevronRight, ReceiptText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/dashboard/pagination";
import { VerdictBadge } from "@/components/dashboard/verdict-badge";
import { useApp } from "@/state/app-context";
import { scopeSummary } from "@/lib/checks";
import { formatDateTime } from "@/lib/format";
import type { Verification } from "@/lib/types";

const PAGE_SIZE = 8;

/**
 * Every check the signed-in business has run, newest first, each linked to its
 * signed receipt. Fills the gap where the business only ever saw a count.
 */
export function VerificationHistoryTable() {
  const { store } = useApp();
  const [page, setPage] = useState(1);

  const rows: Verification[] = useMemo(() => {
    if (!store) return [];
    return store.verifications
      .filter((v) => v.businessId === store.activeBusinessId)
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  }, [store]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-12 text-center">
        <ReceiptText className="h-6 w-6 text-brand-300" />
        <p className="mt-2 text-sm font-medium text-brand-900">No checks on record yet</p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
          Every verification you run will appear here with its signed receipt — re-checkable at
          any time.
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead className="hidden sm:table-cell">Checks asked</TableHead>
            <TableHead>Verdict</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="text-right">Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-medium text-brand-950">
                    {v.identityReference ?? "—"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{v.id}</p>
                </div>
              </TableCell>
              <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                {scopeSummary(v.checks.map((c) => c.checkId))}
              </TableCell>
              <TableCell>
                <VerdictBadge verdict={v.verdict} />
              </TableCell>
              <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground md:table-cell">
                {formatDateTime(v.requestedAt)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/receipt/${v.id}`}>
                      View
                      <ChevronRight className="h-3.5 w-3.5" />
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
