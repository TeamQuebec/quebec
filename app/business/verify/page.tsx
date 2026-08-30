"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { VerifyConsole } from "@/components/flows/verify-console";
import { useApp } from "@/state/app-context";

export default function VerifyPage() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-12 sm:px-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-[28rem] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
          Verifier portal
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
          Verify a customer
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          All you need is their reference. Ask for a fact, get a signed answer.
        </p>
      </div>
      <VerifyConsole />
    </div>
  );
}
