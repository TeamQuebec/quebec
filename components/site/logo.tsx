import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="qbc-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3f423c" />
          <stop offset="1" stopColor="#171717" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#qbc-logo-g)" />
      <path
        d="M9.5 16.5l4.2 4.2 8.8-9.4"
        stroke="#f4c542"
        strokeWidth="3.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  href = "/",
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <LogoMark className="transition-transform group-hover:scale-[1.03]" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[17px] font-semibold tracking-tight text-brand-950">
            Quebec
          </span>
          {!compact && (
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-brand-400">
              identity vault
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
