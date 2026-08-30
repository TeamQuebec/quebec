"use client";

import Link from "next/link";
import { Info, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { useApp } from "@/state/app-context";

export function Footer() {
  const { resetDemo } = useApp();

  const handleReset = async () => {
    await resetDemo();
    toast.success("Demo data reset", {
      description: "The synthetic dataset has been restored to its starting state.",
    });
  };

  return (
    <footer className="no-print border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <Logo />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Verify a single fact about someone — their age, their name, that
              they have a verified identity — without ever exposing the full
              record.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm">
            <div className="space-y-3">
              <p className="font-semibold text-brand-950">Explore</p>
              <ul className="space-y-2 text-brand-600">
                <li><Link className="hover:text-brand-900" href="/how-it-works">How it works</Link></li>
                <li><Link className="hover:text-brand-900" href="/user/dashboard">User dashboard</Link></li>
                <li><Link className="hover:text-brand-900" href="/business/verify">Verifier portal</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-brand-950">Prototype</p>
              <ul className="space-y-2 text-brand-600">
                <li>ICSC 2026 · Track B</li>
                <li>Digital Identity &amp; Trust</li>
                <li>
                  <Button variant="link" size="sm" className="h-auto p-0 text-brand-600 hover:text-brand-900" onClick={handleReset}>
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Reset demo data
                  </Button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 rounded-lg border border-amber-200/70 bg-amber-50/60 px-4 py-3 sm:flex-row sm:items-center sm:gap-2.5">
          <Info className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-amber-800">
            <span className="font-semibold">Synthetic data only.</span>{" "}
            All identity data in this application is synthetically generated for
            demonstration purposes. No real personal information is used or stored.
          </p>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Quebec — proving a fact without revealing the whole record.
        </p>
      </div>
    </footer>
  );
}
