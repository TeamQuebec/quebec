"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Reads a query param client-side and stays in sync as sidebar links navigate.
 * Avoids useSearchParams, so callers don't need a Suspense boundary.
 */
export function useQueryParam(key: string): string | null {
  const pathname = usePathname();
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setValue(new URLSearchParams(window.location.search).get(key));
  }, [key, pathname]);

  return value;
}
