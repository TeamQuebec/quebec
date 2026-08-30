/** Date & formatting helpers (client-safe; no timezone surprises). */

export function nowIso(): string {
  return new Date().toISOString();
}

export function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

export function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

/** "Aug 28, 2026 · 10:42 AM" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

/** "2 days ago", "5h ago", "just now" */
export function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "—";
  const diff = Date.now() - d;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDateTime(iso);
}

export function computeAge(dob: string): number {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return -1;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

/** "1994-03-12" -> "12 Mar 1994" */
export function formatDob(dob: string): string {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}
