import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The absence note — a claim that something did NOT happen.
 *
 * Every other mark in the product says a thing is PRESENT: gold is the answer,
 * green is a signature that checked out, rose is a refusal. Quebec's actual
 * claim is the opposite one — the record did not travel, the data is not
 * stored, there is nothing to leak — and those lines were being rendered in the
 * same tinted accent box as an ordinary aside. The thesis was styled as
 * boilerplate on exactly the screens where the product makes its point.
 *
 * So absence gets its own grammar: the dashed edge the empty states already
 * use, a bare warm ground, no tint and no accent. It is the one box in the
 * product that is deliberately left unfilled. Dashed = not substantive.
 *
 * No fill, literally — this carried a `bg-brand-50/50` wash at first, which is
 * the tint it is defined against. On a white card the box is now nothing but a
 * broken outline, which is the point: it is the shape of a thing that isn't
 * there. (The icon chip keeps a hairline border so the glyph stays legible, but
 * no fill either.)
 *
 * `block` for a titled note standing on its own; `inline` for a single line of
 * reassurance inside a document or a footer.
 */
export function AbsenceNote({
  icon: Icon,
  title,
  variant = "block",
  children,
  className,
}: {
  icon: LucideIcon;
  title?: string;
  variant?: "block" | "inline";
  children: ReactNode;
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-dashed border-brand-300 px-4 py-2.5",
          className
        )}
      >
        <Icon className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-brand-700">{children}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-dashed border-brand-300 p-4",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-200 text-brand-500"
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        {title && <p className="text-sm font-semibold text-brand-950">{title}</p>}
        <p className={cn("text-xs leading-relaxed text-brand-700", title && "mt-1")}>{children}</p>
      </div>
    </div>
  );
}
