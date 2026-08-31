import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Capabilities", href: "#capabilities" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Roles", href: "#roles" },
      { label: "Checks", href: "#checks" },
      { label: "Pricing", href: "#pricing" },
      { label: "Built on", href: "#built-on" },
      { label: "User portal", href: "/user/dashboard" },
      { label: "Business portal", href: "/business/dashboard" },
    ],
  },
  {
    title: "Demo",
    links: [
      { label: "User dashboard", href: "/user/dashboard" },
      { label: "Verifier portal", href: "/business/verify" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Sample receipt", href: "/receipt/VFY-4N7C-2Q" },
    ],
  },
  {
    title: "Prototype",
    links: [
      { label: "ICSC 2026 · Track B", href: "#" },
      { label: "Digital Identity & Trust", href: "#" },
      { label: "Synthetic data only", href: "#" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "hello@quebec-demo.dev", href: "mailto:hello@quebec-demo.dev", external: true },
      { label: "Book a demo", href: "/how-it-works" },
      { label: "@quebec_hack", href: "#" },
    ],
  },
];

/** Dark, structured landing footer. */
export function LandingFooter() {
  return (
    <footer className="bg-af-dark text-af-muted-2">
      <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-6">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 font-sans text-[13px] font-bold text-af-accent">
                Q
              </span>
              <span className="text-[17px] font-bold tracking-tight text-white">Quebec</span>
            </div>
            <p className="mt-5 max-w-[300px] text-sm leading-relaxed text-af-muted-2">
              The identity verification layer for African businesses. Verify a fact — not the
              whole record.
            </p>
            <div className="mt-6 rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs leading-relaxed text-af-muted-2">
                <span className="font-semibold text-white/80">Synthetic data only.</span> All
                identity data in this application is synthetically generated for demonstration
                purposes. No real personal information is used or stored.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-af-muted-2">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-af-muted-2 transition-colors hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-af-muted-2 sm:flex-row sm:items-center sm:justify-between">
          <p>Quebec — proving a fact without revealing the whole record.</p>
          <p className="font-mono">ICSC 2026 · TRACK B · DEMO</p>
        </div>
      </div>
    </footer>
  );
}
