import type { CheckId } from "@/lib/types";

export interface CheckDef {
  id: CheckId;
  label: string;
  /** short label used inside chips / log summaries */
  shortLabel: string;
  description: string;
}

export const CHECK_DEFS: CheckDef[] = [
  {
    id: "over_18",
    label: "Is over 18?",
    shortLabel: "Age",
    description: "Confirms the holder is at least 18 — no date of birth is revealed.",
  },
  {
    id: "name_matches",
    label: "Name matches?",
    shortLabel: "Name",
    description: "Confirms the holder's name is on a verified record — the name itself is never shown.",
  },
  {
    id: "nin_matches",
    label: "NIN matches?",
    shortLabel: "NIN",
    description: "Confirms the National ID number is on file — the number itself is never shown.",
  },
  {
    id: "has_verified_identity",
    label: "Verified identity on file?",
    shortLabel: "Identity",
    description: "Confirms a document-verified identity record exists for this reference.",
  },
];

export const CHECK_BY_ID: Record<CheckId, CheckDef> = Object.fromEntries(
  CHECK_DEFS.map((c) => [c.id, c])
) as Record<CheckId, CheckDef>;

export function scopeSummary(ids: CheckId[]): string {
  if (ids.length === 0) return "No checks";
  return ids.map((id) => CHECK_BY_ID[id]?.shortLabel ?? id).join(", ");
}
