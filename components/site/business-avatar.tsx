import { cn } from "@/lib/utils";

// Decorative identity colours, used only so two names never look alike. Gold is
// deliberately absent: these chips appear on every row of every table, and the
// accent is not available to be "a colour a name might get".
const PALETTE = [
  "bg-teal-50 text-teal-700 ring-teal-100",
  "bg-brand-50 text-brand-700 ring-brand-100",
  "bg-indigo-50 text-indigo-700 ring-indigo-100",
  "bg-violet-50 text-violet-700 ring-violet-100",
  "bg-amber-50 text-amber-700 ring-amber-100",
  "bg-rose-50 text-rose-700 ring-rose-100",
  "bg-sky-50 text-sky-700 ring-sky-100",
];

export function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export function BusinessAvatar({
  name,
  seed,
  className,
}: {
  name: string;
  seed: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1",
        avatarColor(seed),
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
