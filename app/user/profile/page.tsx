"use client";

import Link from "next/link";
import { ArrowRight, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/dashboard/app-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { IdentityProfile } from "@/components/flows/identity-profile";
import { useApp } from "@/state/app-context";

export default function ProfilePage() {
  const { loading, activeIdentity } = useApp();

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-5">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-[26rem] w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!activeIdentity) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl py-12 text-center sm:py-16">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-soft">
            <Fingerprint className="h-7 w-7 text-gold-strong" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-brand-950">
            No record to show yet
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Enroll once to build the record behind your Quebec reference.
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

  return (
    <AppShell>
      <PageHeader
        eyebrow="Your portal"
        title="Your record"
        description="Everything that exists behind your reference — a name, a date of birth, a NIN, and nothing else. Businesses only ever see signed YES / NO answers to what you grant."
      />
      <IdentityProfile />
    </AppShell>
  );
}
