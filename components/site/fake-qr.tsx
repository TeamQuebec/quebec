import type { ReactNode } from "react";
import { pseudoHash } from "@/lib/refs";

/**
 * Deterministic QR-style grid derived from a receipt's hash. Purely decorative
 * for the tamper-evident look — Phase 2 replaces it with a real signature /
 * verification endpoint. Same input always produces the same pattern.
 */
export function FakeQr({ value, className }: { value: string; className?: string }) {
  const N = 21;
  const F = 7; // finder pattern size

  const hash = pseudoHash(value);
  const bytes: number[] = [];
  for (let i = 0; i < hash.length; i += 2) {
    bytes.push(parseInt(hash.slice(i, i + 2), 16));
  }

  const inFinder = (r: number, c: number): boolean => {
    const zones = [
      [0, 0],
      [0, N - F],
      [N - F, 0],
    ];
    return zones.some(([zr, zc]) => r >= zr && r < zr + F && c >= zc && c < zc + F);
  };

  const dark = (r: number, c: number): boolean => {
    if (inFinder(r, c)) return false;
    const idx = r * N + c;
    return (bytes[idx % bytes.length] & (1 << (idx % 8))) !== 0;
  };

  const finderDark = (r: number, c: number): boolean => {
    // 7x7 finder: 3x3 dark core + one-module ring
    const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
    const ring = r === 0 || r === 6 || c === 0 || c === 6;
    return inner || ring;
  };

  const modules: ReactNode[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (inFinder(r, c)) {
        const zone = r < F ? (c < F ? "tl" : "tr") : "bl";
        let darkLocal = false;
        if (zone === "tl") darkLocal = finderDark(r, c);
        if (zone === "tr") darkLocal = finderDark(r, c - (N - F));
        if (zone === "bl") darkLocal = finderDark(r - (N - F), c);
        if (darkLocal) modules.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} />);
      } else if (dark(r, c)) {
        modules.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} />);
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${N} ${N}`}
      className={className}
      role="img"
      aria-label="Receipt verification code"
      shapeRendering="crispEdges"
    >
      <rect width={N} height={N} fill="#ffffff" />
      {modules}
    </svg>
  );
}
