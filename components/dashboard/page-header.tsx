import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared portal page header : eyebrow, display title, description, and an
 * optional right-aligned actions cluster. Replaces the hand-rolled headers so
 * every portal page reads as one system.
 *
 * THE TYPE IS THE LANDING'S. The portal and the marketing pages share a palette
 * (`--background` is literally `#f7f7f2`, the landing's `af-bg`) and a face
 * (`font-display`). So why did the dashboard not look like the product? Because
 * it used that face at half the size with none of the tracking. The landing sets
 * its headings at clamp(2.2rem,4.5vw,3.6rem) / leading-[1] / tracking-[-0.04em];
 * this header was a fixed 30px with `tracking-tight` and default leading. Same
 * paint, a much smaller room.
 *
 * It now runs the landing's scale and its negative tracking, which is where
 * essentially all of the landing's personality lives. Space Grotesk is drawn for
 * display sizes — at 30px with loose tracking it reads as a generic UI sans, and
 * that is exactly what the portal looked like.
 *
 * The eyebrow is a structural label, not an accent, so it takes the warm grey.
 * It was gold, on every page, which spent the accent before any content
 * appeared and taught the reader that gold means "heading", not "the answer".
 *
 * brand-600, not brand-500: at 12px uppercase this is body text, and brand-500
 * (#7c8077) measures 4.03:1 on white — just under AA. brand-600 is 5.9:1, still
 * visibly lighter than the title beneath it.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-brand-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 font-display text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.02] tracking-[-0.04em] text-brand-950">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
