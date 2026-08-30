"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReceiptView } from "@/components/flows/receipt-view";
import { useApp } from "@/state/app-context";
import type { Verification } from "@/lib/types";

export default function ReceiptPage() {
  const params = useParams<{ ref: string }>();
  const { getVerification, businessesById } = useApp();
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

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
          <FileQuestion className="h-7 w-7 text-brand-400" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-brand-950">
          Receipt not found
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          No verification record matches <span className="ref-plate">{params.ref}</span>.
          Receipts live in the demo&apos;s in-memory trail — resetting demo data clears them.
        </p>
        <Button className="mt-7" variant="outline" asChild>
          <Link href="/business/verify">
            <ArrowLeft className="h-4 w-4" />
            Back to verifier portal
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto mb-8 flex max-w-2xl items-center justify-between">
        <Link
          href="/business/verify"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-900"
        >
          <ArrowLeft className="h-4 w-4" />
          New verification
        </Link>
        <p className="text-xs text-muted-foreground">
          {verification.businessId ? businessesById[verification.businessId]?.name : "A business"}
        </p>
      </div>
      <ReceiptView
        verification={verification}
        businessName={
          verification.businessId
            ? businessesById[verification.businessId]?.name ?? "A business"
            : "A business"
        }
      />
    </div>
  );
}
