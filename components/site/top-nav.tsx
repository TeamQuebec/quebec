"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Menu, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { ModeSwitch, modeFromPath } from "@/components/site/mode-switch";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
}

function useNavLinks(): NavLink[] {
  const pathname = usePathname();
  const mode = modeFromPath(pathname);
  const links: NavLink[] = [];
  if (mode === "user") links.push({ label: "My dashboard", href: "/user/dashboard" });
  if (mode === "business") links.push({ label: "Verify a reference", href: "/business/verify" });
  links.push({ label: "How it works", href: "/how-it-works" });
  return links;
}

function NavLinks({ links, pathname }: { links: NavLink[]; pathname: string }) {
  return (
    <>
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "text-brand-950"
                : "text-brand-600 hover:bg-brand-50 hover:text-brand-900"
            )}
          >
            {l.label}
            {active && (
              <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-teal-600" />
            )}
          </Link>
        );
      })}
    </>
  );
}

export function TopNav() {
  const pathname = usePathname();
  const mode = modeFromPath(pathname);
  const links = useNavLinks();

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo />
          {mode && (
            <span className="hidden items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-800 sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              {mode === "user" ? "User portal" : "Business portal"}
            </span>
          )}
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <NavLinks links={links} pathname={pathname} />
          {mode === "business" && (
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-800">
              <Building2 className="h-3.5 w-3.5 text-brand-500" />
              Signed in as SafeBank NG
            </span>
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ModeSwitch />
        </div>

        {/* Mobile menu — mode switch lives inside the sheet on small screens */}
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col gap-6 pt-8">
                <Logo />
                <div className="flex flex-col gap-1">
                  {links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={cn(
                        "rounded-md px-3 py-2.5 text-sm font-medium",
                        pathname === l.href
                          ? "bg-brand-50 text-brand-950"
                          : "text-brand-700 hover:bg-brand-50"
                      )}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
                {mode === "business" && (
                  <p className="inline-flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-xs text-brand-800">
                    <Building2 className="h-4 w-4 text-brand-500" />
                    Verifying as SafeBank NG (demo)
                  </p>
                )}
                <div className="border-t border-border pt-4">
                  <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Switch portal
                  </p>
                  <ModeSwitch />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
