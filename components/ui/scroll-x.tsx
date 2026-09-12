"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * A horizontal scroller with a short, draggable thumb.
 *
 * A native horizontal scrollbar sizes its thumb to the scroll ratio, so on a
 * table that only just overflows the thumb runs almost the whole width of the
 * track and reads as a rule under the table rather than a control. No CSS
 * property overrides that length — `::-webkit-scrollbar-thumb` takes colours and
 * thickness, not size — so the bar is hidden and drawn here instead.
 *
 * The thumb still drags, still tracks wheel, touch and keyboard scrolling, and
 * still reflects position; it just refuses to grow past MAX_THUMB, so it stays a
 * pill you can see at a glance instead of a line you have to measure.
 */

/** Below this the thumb stops being grabbable. */
const MIN_THUMB = 56;
/** Above this it stops reading as a thumb. */
const MAX_THUMB = 120;

export function ScrollX({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);

  /** Recompute the thumb from the element itself — never from cached state. */
  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;

    const overflow = el.scrollWidth - el.clientWidth;
    if (overflow <= 1) {
      setThumb(null);
      return;
    }

    const track = el.clientWidth;
    const w = Math.max(
      MIN_THUMB,
      Math.min(Math.round(track * (el.clientWidth / el.scrollWidth)), MAX_THUMB)
    );
    const x = (el.scrollLeft / overflow) * (track - w);
    setThumb({ x, w });
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    measure();
    el.addEventListener("scroll", measure, { passive: true });

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // The content can reflow without the container changing size — a cell
    // wrapping onto a second line, a webfont landing — so watch it too.
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  /** Drag the thumb. Dragging maps thumb travel onto scroll travel, so the
   *  thumb keeps up with the pointer no matter how far it is capped. */
  const dragThumb = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scroller.current;
    const track = e.currentTarget.parentElement;
    if (!el || !track) return;

    const maxThumbX = track.clientWidth - e.currentTarget.offsetWidth;
    if (maxThumbX <= 0) return;

    e.preventDefault();
    // Stop the track handler below from also firing and jumping the scroll.
    e.stopPropagation();

    const startX = e.clientX;
    const startScroll = el.scrollLeft;
    const node = e.currentTarget;
    node.setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      const overflow = el.scrollWidth - el.clientWidth;
      el.scrollLeft = startScroll + ((ev.clientX - startX) * overflow) / maxThumbX;
    };
    const end = () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", end);
      node.removeEventListener("pointercancel", end);
    };

    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", end);
    node.addEventListener("pointercancel", end);
  };

  /** Click the empty track to jump, centring the thumb where you clicked. */
  const jumpTo = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scroller.current;
    if (!el || !thumb) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const maxThumbX = rect.width - thumb.w;
    if (maxThumbX <= 0) return;

    const x = Math.max(0, Math.min(e.clientX - rect.left - thumb.w / 2, maxThumbX));
    el.scrollLeft = (x / maxThumbX) * (el.scrollWidth - el.clientWidth);
  };

  return (
    <div className={cn("relative", className)}>
      <div ref={scroller} className="no-scrollbar w-full overflow-x-auto">
        {children}
      </div>

      {/* Decorative: the scroller above is the real control and stays reachable
          by wheel, touch and keyboard. This is the indicator for it. */}
      {thumb && (
        <div
          aria-hidden="true"
          onPointerDown={jumpTo}
          className="group relative mt-2 h-1.5 cursor-pointer"
        >
          <div
            onPointerDown={dragThumb}
            style={{ width: thumb.w, transform: `translateX(${thumb.x}px)` }}
            className="absolute inset-y-0 left-0 cursor-grab rounded-full bg-brand-300 transition-colors group-hover:bg-brand-400 active:cursor-grabbing"
          />
        </div>
      )}
    </div>
  );
}
