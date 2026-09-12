"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  ArrowLeft,
  Building2,
  Fingerprint,
  HelpCircle,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  ScanSearch,
  ScrollText,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { BusinessAvatar, avatarColor, initials } from "@/components/site/business-avatar";
import { modeFromPath } from "@/components/site/mode-switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useApp, type AuthKind } from "@/state/app-context";
import { cn } from "@/lib/utils";

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

function titleFor(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  // A receipt is not a section of either portal — it opens over whichever one
  // you verified from — so the bar names it directly instead of falling back to
  // a generic "portal".
  if (pathname.startsWith("/receipt")) return "Verification receipt";
  return "Quebec portal";
}

function SectionLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  // The active section is a STATE, so it is ink. It was gold, which put the
  // accent on every page's navigation and made "where am I" the same colour as
  // "the answer is yes".
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
        isActive
          ? "bg-brand-100 text-brand-950"
          : "text-brand-700 hover:bg-brand-50 hover:text-brand-950"
      )}
    >
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-900"
        />
      )}
      <Icon className={cn("h-4 w-4", isActive ? "text-brand-900" : "text-brand-400")} />
      {item.label}
    </Link>
  );
}

/**
 * Modern portal shell: a fixed sidebar on desktop, a drawer on mobile, and a
 * sticky top bar. The nav is the sections and nothing else : the entity lists
 * that used to expand under "Third parties" and "Your users" made the sidebar a
 * second copy of the page it linked to, and pushed the sections themselves off
 * a 640px-tall screen. Those entities are on their pages, where there is room to
 * read them. The sidebar footer is who you are and the way out.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { store, activeIdentity, businessesById, signedIn, authKind, signOut } = useApp();
  const router = useRouter();

  // /user/* and /business/* name their portal outright. Any other route under
  // this shell — a receipt — belongs to whichever portal the session signed in
  // to, so it inherits that sidebar rather than guessing from the path.
  const mode: AuthKind = modeFromPath(pathname) ?? authKind ?? "user";

  // A session only opens the portal it signed in to. Every hook runs before this
  // return: an earlier version bailed out above the sidebar's own hooks, so the
  // hook count changed on the signed-out -> signed-in transition.
  //
  // The destination is /auth, not /auth/{mode}/signin. Two reasons, and the
  // second is the load-bearing one: signing out should put you back at the
  // choice rather than at the form you came in through, AND this effect runs on
  // the same commit that clears the session — so anything narrower here would
  // fire straight after sign-out and overwrite the redirect the footer asked
  // for. One destination means there is no race to lose.
  const mustSignIn = !signedIn || authKind !== mode;
  useEffect(() => {
    if (mustSignIn) router.replace("/auth");
  }, [mustSignIn, router]);
  if (mustSignIn) return null;

  const sections = mode === "business" ? BUSINESS_SECTIONS : USER_SECTIONS;
  const title = titleFor(pathname);
  const portalLabel = mode === "business" ? "Business" : "User";

  // Who is signed in, as the footer row sees them : an avatar, a name, and the
  // one line of detail that tells two holders apart. A row, so one line each.
  const session =
    mode === "business"
      ? store && businessesById[store.activeBusinessId]
        ? (() => {
            const biz = businessesById[store.activeBusinessId];
            return {
              avatar: <BusinessAvatar name={biz.name} seed={biz.id} className="h-9 w-9 text-xs" />,
              name: biz.name,
              sub: biz.sector,
              mono: false,
            };
          })()
        : null
      : activeIdentity
        ? {
            avatar: (
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1",
                  avatarColor(activeIdentity.id)
                )}
              >
                {initials(activeIdentity.name)}
              </span>
            ),
            name: activeIdentity.name,
            sub: activeIdentity.uniqueId,
            mono: true,
          }
        : null;

  const SidebarFooter = (
    <div className="mt-auto flex flex-col gap-2.5">
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl p-2.5",
          session ? "border border-border bg-brand-50/60" : "border border-dashed border-brand-300"
        )}
      >
        {session ? (
          <>
            {session.avatar}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-950">{session.name}</p>
              <p
                className={cn(
                  "truncate text-[11px] text-muted-foreground",
                  session.mono && "font-mono"
                )}
              >
                {session.sub}
              </p>
            </div>
          </>
        ) : (
          <p className="min-w-0 flex-1 px-1 text-[11px] leading-snug text-muted-foreground">
            {mode === "user" ? (
              <>
                No reference yet.{" "}
                <Link
                  href="/user/enroll"
                  className="font-medium text-brand-900 underline underline-offset-2 hover:text-brand-950"
                >
                  Enroll
                </Link>{" "}
                to get one.
              </>
            ) : (
              "Loading session…"
            )}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            signOut();
            router.push("/auth");
          }}
          aria-label="Sign out"
          title="Sign out"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
      {/* Dashed, not tinted : this note is about what is NOT here. See the
          colour grammar in globals.css. */}
      <p className="rounded-lg border border-dashed border-brand-300 px-3 py-2 text-[11px] leading-relaxed text-brand-700">
        Demo session : synthetic identity data. Nothing here is real.
      </p>
    </div>
  );

  const SidebarContent = (
    <div className="flex h-full flex-col gap-6 overflow-y-auto">
      <Logo href="/" />

      <nav aria-label="Portal navigation" className="flex flex-col gap-0.5">
        {sections.map((item) => (
          <SectionLink key={item.href} item={item} isActive={pathname === item.href} />
        ))}

        <Link
          href="/how-it-works"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-brand-700 transition-colors hover:bg-brand-50 hover:text-brand-950"
        >
          <HelpCircle className="h-4 w-4 text-brand-400" />
          How it works
        </Link>
      </nav>

      {SidebarFooter}
    </div>
  );

  return (
    <Sheet>
      <div className="min-h-screen bg-background">
        {/* Desktop sidebar. no-print, like the old site header it replaces : a
            receipt prints on its own, not with the portal wrapped around it. */}
        <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-64 overflow-hidden border-r border-border bg-white p-5 lg:block">
          {SidebarContent}
        </aside>

        {/* Mobile drawer */}
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Portal navigation</SheetTitle>
          <div className="h-full p-5">{SidebarContent}</div>
        </SheetContent>

        {/* Main column : print:pl-0 because the sidebar is hidden on paper. */}
        <div className="lg:pl-64 print:pl-0">
          {/* Sticky top bar */}
          <header className="no-print sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation"
                className="-ml-1.5 inline-flex h-9 w-9 items-center justify-center rounded-md text-brand-700 transition-colors hover:bg-brand-50 hover:text-brand-950 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <h1 className="font-display text-[17px] font-bold tracking-[-0.02em] text-brand-950">{title}</h1>
            <Badge variant="outline" className="ml-auto hidden gap-1.5 sm:inline-flex">
              <ShieldCheck className="h-3 w-3 text-brand-500" />
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

          {/* py-14, up from py-10: the landing runs py-24 between sections. The
              portal should not match that — it is a tool, not a brochure — but it
              was packed tight enough that nothing had room to read as important. */}
          <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">{children}</main>
        </div>
      </div>
    </Sheet>
  );
}
