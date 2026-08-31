"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppProvider } from "@/state/app-context";
import { TopNav } from "@/components/site/top-nav";
import { Footer } from "@/components/site/footer";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  // The landing page renders its own Quebec-style header/footer, and the portal
  // pages (/user, /business) own their chrome via the AppShell sidebar — so the
  // global TopNav/Footer only appear on the pages between.
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isPortal = pathname.startsWith("/user") || pathname.startsWith("/business");
  const showGlobalChrome = !isLanding && !isPortal;

  return (
    <AppProvider>
      <div className="flex min-h-screen flex-col">
        {showGlobalChrome && <TopNav />}
        <main className="flex-1">{children}</main>
        {showGlobalChrome && <Footer />}
      </div>
      <Toaster />
    </AppProvider>
  );
}
