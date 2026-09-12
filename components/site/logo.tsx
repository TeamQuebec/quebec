import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The Quebec mark : a gold Q on a near-black plate.
 *
 * Drawn, not typed. The header used to set a literal "Q" character in the page
 * font, which meant the mark's shape was whatever the webfont happened to do —
 * and it could not be reused as the favicon at all, because a favicon renders
 * outside the page and has no access to its fonts. A ring and a tail are
 * geometry, so the mark is now identical in the sidebar, on the landing, on a
 * receipt, and in the browser tab at 16px.
 *
 * `plate` exists for dark grounds: the black plate disappears against the
 * footer and the receipt's header band, so those pass a lighter fill and keep
 * the gold Q.
 */
export function LogoMark({
  className,
  plate = "#171717",
}: {
  className?: string;
  /** Plate fill. Defaults to the brand black; dark grounds pass a lighter one. */
  plate?: string;
}) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill={plate} />
      <circle cx="16" cy="15" r="6.25" fill="none" stroke="#f4c542" strokeWidth="3.25" />
      <path
        d="M20.4 19.4 23 22"
        stroke="#f4c542"
        strokeWidth="3.25"
        strokeLinecap="round"
        fill="none"
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
