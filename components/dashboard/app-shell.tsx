"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Building2,
  Fingerprint,
  HelpCircle,
  History,
  LayoutDashboard,
  Menu,
  ScanSearch,
  ScrollText,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { BusinessAvatar, avatarColor, initials } from "@/components/site/business-avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { StatusDot, grantStatusRank } from "@/components/dashboard/status-badge";
import { useQueryParam } from "@/components/dashboard/use-query-param";
import { useApp } from "@/state/app-context";
import { cn } from "@/lib/utils";
import type { GrantStatus } from "@/lib/types";

type NavItem = { href: string; label: string; icon: typeof Building2 };

const USER_SECTIONS: NavItem[] = [
  { href: "/user/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/user/third-parties", label: "Third parties", icon: Building2 },
  { href: "/user/activity", label: "Activity", icon: History },
  { href: "/user/profile", label: "Profile", icon: UserRound },
  { href: "/user/enroll", label: "Enroll an identity", icon: Fingerprint },
];

const BUSINESS_SECTIONS: NavItem[] = [
  { href: "/business/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/business/users", label: "Your users", icon: Users },
  { href: "/business/history", label: "History", icon: ScrollText },
  { href: "/business/verify", label: "Verify a reference", icon: ScanSearch },
];

const TITLES: Record<string, string> = {
  "/user/dashboard": "Overview",
  "/user/third-parties": "Third parties",
  "/user/activity": "Activity",
  "/user/profile": "Profile",
  "/user/enroll": "Enroll an identity",
  "/business/dashboard": "Overview",
  "/business/users": "Your users",
  "/business/history": "History",
  "/business/verify": "Verify a reference",
};

function SectionLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-gold-soft text-af-ink"
          : "text-brand-700 hover:bg-brand-50 hover:text-brand-950"
      )}
    >
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gold"
        />
      )}
      <Icon className={cn("h-4 w-4", isActive ? "text-gold-strong" : "text-brand-400")} />
      {item.label}
    </Link>
  );
}

function FilterLink({
  href,
  label,
  active,
  status,
}: {
  href: string;
  label: string;
  active: boolean;
  status?: GrantStatus;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md py-1.5 pl-[2.35rem] pr-2 text-xs transition-colors",
        active
          ? "bg-gold-soft/70 font-medium text-brand-950"
          : "text-brand-600 hover:bg-brand-50 hover:text-brand-950"
      )}
    >
      {status ? (
        <StatusDot status={status} />
      ) : (
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full border border-brand-300" />
      )}
      <span className="truncate">{label}</span>
    </Link>
  );
}

/**
 * Modern portal shell: a fixed sidebar on desktop, a drawer on mobile, and a
 * sticky top bar. The sidebar is the dashboard itself — an identity chip, then
 * a nav whose sections each expand to the entities on that page (third parties
 * on the user side, users on the business side). No portal switch in here.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { store, activeIdentity, activeGrants, businessesById } = useApp();
  const filterB = useQueryParam("b");
  const filterU = useQueryParam("u");

  const mode = pathname.startsWith("/business") ? "business" : "user";
  const sections = mode === "business" ? BUSINESS_SECTIONS : USER_SECTIONS;
  const title = TITLES[pathname] ?? "Quebec portal";
  const portalLabel = mode === "business" ? "Business" : "User";

  // Third parties for the user sidebar, status-sorted.
  const parties = activeGrants
    .map((g) => ({
      id: g.businessId,
      name: businessesById[g.businessId]?.name ?? g.businessId,
      status: g.status,
    }))
    .sort((a, b) => grantStatusRank(a.status) - grantStatusRank(b.status) || a.name.localeCompare(b.name));

  // Users for the business sidebar, status-sorted.
  const businessUsers = store
    ? store.grants
        .filter((g) => g.businessId === store.activeBusinessId)
        .map((g) => ({
          identityId: g.identityId,
          name: store.identities.find((i) => i.id === g.identityId)?.name ?? g.identityId,
          status: g.status,
        }))
        .sort(
          (a, b) => grantStatusRank(a.status) - grantStatusRank(b.status) || a.name.localeCompare(b.name)
        )
    : [];

  const identityChip =
    mode === "business" ? (
      store && businessesById[store.activeBusinessId] ? (
        (() => {
          const biz = businessesById[store.activeBusinessId];
          return (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-brand-50/60 p-3">
              <BusinessAvatar name={biz.name} seed={biz.id} className="h-9 w-9 text-xs" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brand-950">{biz.name}</p>
                <p className="truncate text-xs text-muted-foreground">{biz.sector}</p>
              </div>
            </div>
          );
        })()
      ) : (
        <div className="rounded-xl border border-dashed border-brand-200 p-3 text-xs text-muted-foreground">
          Loading session…
        </div>
      )
    ) : activeIdentity ? (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-brand-50/60 p-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1",
            avatarColor(activeIdentity.id)
          )}
        >
          {initials(activeIdentity.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-brand-950">{activeIdentity.name}</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {activeIdentity.uniqueId}
          </p>
        </div>
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-brand-200 p-3 text-xs leading-relaxed text-muted-foreground">
        No reference yet —{" "}
        <Link href="/user/enroll" className="font-medium text-gold-strong hover:underline">
          enroll
        </Link>{" "}
        to get one.
      </div>
    );

  const SidebarContent = (
    <div className="flex h-full flex-col gap-5 overflow-y-auto">
      <Logo href="/" />
      {identityChip}

      <nav aria-label="Portal navigation" className="flex flex-col gap-4">
        {sections.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div key={item.href} className="flex flex-col gap-0.5">
              <SectionLink item={item} isActive={isActive} />
              {mode === "user" && item.href === "/user/third-parties" && (
                <div className="mt-1 flex flex-col gap-px">
                  <FilterLink
                    href="/user/third-parties"
                    label="All third parties"
                    active={pathname === "/user/third-parties" && !filterB}
                  />
                  {parties.map((p) => (
                    <FilterLink
                      key={p.id}
                      href={`/user/third-parties?b=${p.id}`}
                      label={p.name}
                      status={p.status}
                      active={filterB === p.id}
                    />
                  ))}
                </div>
              )}
              {mode === "business" && item.href === "/business/users" && (
                <div className="mt-1 flex flex-col gap-px">
                  <FilterLink
                    href="/business/users"
                    label="All users"
                    active={pathname === "/business/users" && !filterU}
                  />
                  {businessUsers.map((u) => (
                    <FilterLink
                      key={u.identityId}
                      href={`/business/users?u=${u.identityId}`}
                      label={u.name}
                      status={u.status}
                      active={filterU === u.identityId}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <Link
          href="/how-it-works"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 hover:text-brand-950"
        >
          <HelpCircle className="h-4 w-4 text-brand-400" />
          How it works
        </Link>
      </nav>

      <div className="flex-1" />
      <div className="rounded-lg border border-gold-border bg-gold-soft/60 px-3 py-2.5 text-xs leading-relaxed text-brand-800">
        Demo session — synthetic identity data. Nothing here is real.
      </div>
    </div>
  );

  return (
    <Sheet>
      <div className="min-h-screen bg-background">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 overflow-hidden border-r border-border bg-white p-5 lg:block">
          {SidebarContent}
        </aside>

        {/* Mobile drawer */}
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Portal navigation</SheetTitle>
          <div className="h-full p-5">{SidebarContent}</div>
        </SheetContent>

        {/* Main column */}
        <div className="lg:pl-64">
          {/* Sticky top bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation"
                className="-ml-1.5 inline-flex h-9 w-9 items-center justify-center rounded-md text-brand-700 transition-colors hover:bg-brand-50 hover:text-brand-950 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <h1 className="font-display text-lg font-bold tracking-tight text-brand-950">{title}</h1>
            <Badge variant="outline" className="ml-auto hidden gap-1.5 sm:inline-flex">
              <ShieldCheck className="h-3 w-3 text-gold-strong" />
              {portalLabel} portal
            </Badge>
            <Link
              href="/"
              className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-muted-foreground transition-colors hover:text-brand-950"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to home
            </Link>
          </header>

          <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
        </div>
      </div>
    </Sheet>
  );
}
