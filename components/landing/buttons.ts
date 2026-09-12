/**
 * The marketing pages' two buttons.
 *
 * `/` and `/how-it-works` are one system, and they had drifted into two: the
 * landing hand-rolled these as rounded-[7px] buttons while /how-it-works used
 * the portal's shadcn `Button`, so the same action — "verify a reference" —
 * looked like a different product depending on which page you were standing on.
 * The class strings live here so there is one definition of each.
 *
 * BTN_OUTLINE is for light grounds. The dark CTA panels on both pages need a
 * white-hairline button instead, which is why those two stay hand-rolled — the
 * same shape, a different edge, because there is nothing `af-border-strong` can
 * do on near-black.
 */
export const BTN_DARK =
  "inline-flex items-center justify-center gap-1.5 rounded-[7px] bg-af-ink px-[18px] py-[11px] text-[14px] font-semibold text-white transition-colors hover:bg-af-dark";

export const BTN_OUTLINE =
  "inline-flex items-center justify-center gap-1.5 rounded-[7px] border border-af-border-strong bg-transparent px-[18px] py-[11px] text-[14px] font-semibold text-af-ink transition-colors hover:border-af-ink";
