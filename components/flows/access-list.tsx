"use client";

import { useState } from "react";
import { Ban, Check, Clock3, ShieldCheck, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BusinessAvatar } from "@/components/site/business-avatar";
import { useApp } from "@/state/app-context";
import { scopeSummary } from "@/lib/checks";
import { timeAgo } from "@/lib/format";
import type { Grant } from "@/lib/types";

export function AccessList() {
  const { activeGrants, businessesById, revokeGrant, approveGrant, denyGrant, restoreGrant } =
    useApp();
  const [toRevoke, setToRevoke] = useState<Grant | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const run = async (id: string, fn: (gid: string) => Promise<void>, message: string) => {
    setBusyId(id);
    try {
      await fn(id);
      toast.success(message);
    } finally {
      setBusyId(null);
    }
  };

  const granted = activeGrants.filter((g) => g.status === "granted");
  const requested = activeGrants.filter((g) => g.status === "requested");
  const revoked = activeGrants.filter((g) => g.status === "revoked");

  const renderRow = (g: Grant) => {
    const biz = businessesById[g.businessId];
    if (!biz) return null;
    const canVerify = g.scopes.length > 0 ? scopeSummary(g.scopes) : "Facts you allow";
    const busy = busyId === g.id;

    if (g.status === "granted") {
      return (
        <div
          key={g.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3.5 shadow-sm"
        >
          <div className="flex min-w-0 items-center gap-3">
            <BusinessAvatar name={biz.name} seed={biz.id} />
            <div className="min-w-0">
              <p className="flex items-center gap-2 truncate font-medium text-brand-950">
                {biz.name}
                <Badge variant="accent" className="hidden sm:inline-flex">
                  <ShieldCheck className="h-3 w-3" />
                  Can verify
                </Badge>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {biz.sector} · {canVerify} · granted {g.grantedAt ? timeAgo(g.grantedAt) : "recently"}
              </p>
            </div>
          </div>
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
        </div>
      );
    }

    if (g.status === "requested") {
      return (
        <div
          key={g.id}
          className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-center gap-3">
            <BusinessAvatar name={biz.name} seed={biz.id} />
            <div className="min-w-0">
              <p className="flex items-center gap-2 truncate font-medium text-brand-950">
                {biz.name}
                <Badge variant="warning">
                  <Clock3 className="h-3 w-3" />
                  Requested
                </Badge>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Wants to verify {canVerify.toLowerCase()} ·{" "}
                {g.requestedAt ? timeAgo(g.requestedAt) : ""}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant="accent"
              onClick={() => run(g.id, approveGrant, `${biz.name} can now verify facts about you.`)}
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
          </div>
        </div>
      );
    }

    // revoked
    return (
      <div
        key={g.id}
        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3.5 opacity-75"
      >
        <div className="flex min-w-0 items-center gap-3">
          <BusinessAvatar name={biz.name} seed={biz.id} className="grayscale" />
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-medium text-brand-950">
              {biz.name}
              <Badge variant="muted">Revoked</Badge>
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Access removed{g.revokedAt ? ` ${timeAgo(g.revokedAt)}` : ""} — they can no longer
              verify anything.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={() => run(g.id, restoreGrant, `You allowed ${biz.name} to verify facts again.`)}
          disabled={busy}
        >
          <Undo2 className="h-3.5 w-3.5" />
          Allow again
        </Button>
      </div>
    );
  };

  const section = (label: string, grants: Grant[]) =>
    grants.length === 0 ? null : (
      <div>
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <div className="space-y-2.5">{grants.map(renderRow)}</div>
      </div>
    );

  if (activeGrants.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-10 text-center">
        <p className="text-sm font-medium text-brand-900">No businesses have access yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
          Share your Quebec reference with a business and it will appear here the moment it
          checks a fact about you.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {section("Currently granted", granted)}
        {section("Awaiting your approval", requested)}
        {section("Revoked", revoked)}
      </div>

      <Dialog open={toRevoke !== null} onOpenChange={(open) => !open && setToRevoke(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Revoke {toRevoke ? businessesById[toRevoke.businessId]?.name : ""}&apos;s access?
            </DialogTitle>
            <DialogDescription>
              {toRevoke ? businessesById[toRevoke.businessId]?.name : "This business"} will
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
