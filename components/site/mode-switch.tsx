"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export type PortalMode = "user" | "business" | null;

export function modeFromPath(pathname: string): PortalMode {
  if (pathname.startsWith("/user")) return "user";
  if (pathname.startsWith("/business")) return "business";
  return null;
}

const ITEMS: { mode: Exclude<PortalMode, null>; href: string; label: string; icon: typeof UserRound }[] = [
  { mode: "user", href: "/user/dashboard", label: "User", icon: UserRound },
  { mode: "business", href: "/business/dashboard", label: "Business", icon: Building2 },
];

export function ModeSwitch({ className }: { className?: string }) {
  const pathname = usePathname();
  const active = modeFromPath(pathname);

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-brand-200 bg-white p-1 shadow-sm",
        className
      )}
      role="tablist"
      aria-label="Portal mode"
    >
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.mode;
        return (
          <Link
            key={item.mode}
            href={item.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-800 text-white shadow-sm"
                : "text-brand-700 hover:bg-brand-50"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
