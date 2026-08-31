"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Role {
  id: string;
  name: string;
  desc: string;
}

const ROLES: Role[] = [
  {
    id: "holder",
    name: "Holder",
    desc: "Enrolls once in three fields. Shares a single reference — never a document — and sees every check ever run against it.",
  },
  {
    id: "verifier",
    name: "Verifier",
    desc: "Asks one yes/no fact with just a reference. Gets a signed answer and a tamper-evident receipt in seconds.",
  },
  {
    id: "auditor",
    name: "Auditor",
    desc: "Re-checks any receipt against the registry. Sees proof and a verdict — never the record behind it.",
  },
];

/** Enterprise segmented role selector — active role carries the yellow accent. */
export function RolesSelector() {
  const [active, setActive] = useState("verifier");
  const current = ROLES.find((r) => r.id === active) ?? ROLES[1];

  return (
    <div>
      <div
        className="inline-flex flex-wrap gap-1 rounded-lg border border-af-border bg-af-surface p-1"
        role="tablist"
        aria-label="Roles"
      >
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={active === r.id}
            onClick={() => setActive(r.id)}
            className={cn(
              "rounded-md px-4 py-2 text-[13px] font-semibold transition-colors",
              active === r.id
                ? "bg-af-accent text-af-ink"
                : "text-af-muted hover:text-af-ink"
            )}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div
        key={current.id}
        className="mt-8 max-w-[640px] border-l-2 border-af-accent pl-6"
      >
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-af-muted">
          Role · {current.name}
        </p>
        <p className="mt-3 text-[17px] leading-relaxed text-af-ink">{current.desc}</p>
      </div>
    </div>
  );
}
