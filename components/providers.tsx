"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppProvider } from "@/state/app-context";
import { TopNav } from "@/components/site/top-nav";
import { Footer } from "@/components/site/footer";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  // The chrome rule, stated once so it stops being accidental:
  //
  //   1280px + LandingHeader/Footer = public marketing   (/ , /how-it-works)
  //   1024px + AppShell sidebar     = the app            (/user/*, /business/*, /receipt/*)
  //    672px + neither               = a document         (/auth)
  //
  // A page is now either obviously in a system or obviously out of one. If you
  // add a page, pick one of the three; don't invent a fourth.
  const pathname = usePathname();
  const isMarketing = pathname === "/" || pathname.startsWith("/how-it-works");
  const isPortal =
    pathname.startsWith("/user") ||
    pathname.startsWith("/business") ||
    pathname.startsWith("/receipt");
  // /auth is a document: it brings its own brand mark and its own narrow column,
  // so the global TopNav put a second Logo directly above the first. Neither
  // chrome renders there.
  const isDocument = pathname.startsWith("/auth");
  const showGlobalChrome = !isMarketing && !isPortal && !isDocument;

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
