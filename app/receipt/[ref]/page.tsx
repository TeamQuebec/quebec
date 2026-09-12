"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/dashboard/app-shell";
import { ReceiptView } from "@/components/flows/receipt-view";
import { useApp, type AuthKind } from "@/state/app-context";
import type { Verification } from "@/lib/types";

/**
 * The same receipt is reachable from a holder's activity log and from a
 * business's verification history, so "back" has to follow the portal you are
 * actually in. Sending a holder to the verifier portal, or a business to a
 * holder's activity log, would bounce them straight into the other sign-in.
 */
const BACK: Record<AuthKind, { href: string; label: string }> = {
  user: { href: "/user/activity", label: "Back to activity" },
  business: { href: "/business/verify", label: "New verification" },
};

export default function ReceiptPage() {
  const params = useParams<{ ref: string }>();
  const { getVerification, businessesById, authKind } = useApp();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getVerification(params.ref).then((v) => {
      if (alive) {
        setVerification(v);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [params.ref, getVerification]);

  // authKind is non-null whenever the shell renders its children — a signed-out
  // visitor is redirected before they get here. The fallback exists only so the
  // lookup stays total, and matches the shell's own default.
  const back = BACK[authKind ?? "user"];
  const businessName = verification?.businessId
    ? businessesById[verification.businessId]?.name ?? "A business"
    : "A business";

  return (
    <AppShell>
      {loading ? (
        <div className="mx-auto w-full max-w-2xl">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      ) : !verification ? (
        <div className="mx-auto max-w-xl py-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
            <FileQuestion className="h-7 w-7 text-brand-400" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-brand-950">
            Receipt not found
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            No verification record matches <span className="ref-plate">{params.ref}</span>. Receipts
            are stored in this browser : resetting demo data clears them.
          </p>
          <Button className="mt-7" variant="outline" asChild>
            <Link href={back.href}>
              <ArrowLeft className="h-4 w-4" />
              {back.label}
            </Link>
          </Button>
        </div>
      ) : (
        <div>
          <div className="no-print mx-auto mb-6 flex max-w-2xl items-center justify-between gap-3">
            <Link
              href={back.href}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-900"
            >
              <ArrowLeft className="h-4 w-4" />
              {back.label}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{businessName}</p>
          </div>
          <ReceiptView verification={verification} businessName={businessName} />
        </div>
      )}
    </AppShell>
  );
}
