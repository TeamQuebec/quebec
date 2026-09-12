"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** The finished value, e.g. "3" or "100%". Any non-digit tail is kept as-is. */
  value: string;
  /** How long the count runs, in ms. */
  duration?: number;
}

const PARTS = /^(\d+)(.*)$/;

/**
 * Counts a number up from zero the first time it scrolls into view.
 *
 * The server renders the FINISHED value and the client only replaces it with a
 * running count — so the strip reads correctly with JS off, to a crawler, and to
 * anyone who never scrolls it into view. It also skips the count outright when
 * the element is already on screen at mount: there is no reveal to play, and
 * playing one anyway would mean flashing the real figure to "0" and counting
 * back up to where it already was.
 */
export function CountUp({ value, duration = 1100 }: CountUpProps) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const parts = PARTS.exec(value);
    if (!parts) return;
    const target = Number(parts[1]);
    const suffix = parts[2];

    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;

    setDisplay(`0${suffix}`);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // easeOutCubic : quick off the line, settling onto the figure.
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(`${Math.round(eased * target)}${suffix}`);
          if (t < 1) frame.current = requestAnimationFrame(tick);
        };
        frame.current = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  // tabular-nums so the glyphs don't shuffle sideways as the digits change.
  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}
