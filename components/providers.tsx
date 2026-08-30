"use client";

import type { ReactNode } from "react";
import { AppProvider } from "@/state/app-context";
import { TopNav } from "@/components/site/top-nav";
import { Footer } from "@/components/site/footer";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <div className="flex min-h-screen flex-col">
        <TopNav />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </AppProvider>
  );
}
