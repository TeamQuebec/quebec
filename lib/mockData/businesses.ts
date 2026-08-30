import type { Business } from "@/lib/types";

/**
 * Invented businesses used across the synthetic dataset. None correspond to a
 * real company — they exist so dashboards, access logs and verifications look
 * populated without touching real-world data.
 */
export const BUSINESSES: Business[] = [
  { id: "biz_safebank", name: "SafeBank NG", sector: "Banking" },
  { id: "biz_smiletrust", name: "SmileTrust", sector: "Identity & KYC" },
  { id: "biz_paycycle", name: "PayCycle Ltd", sector: "Payments & lending" },
  { id: "biz_novapay", name: "NovaPay", sector: "Mobile money" },
  { id: "biz_glidecredit", name: "GlideCredit", sector: "Micro-lending" },
  { id: "biz_healthsure", name: "HealthSure HMO", sector: "Health insurance" },
  { id: "biz_quickmart", name: "QuickMart", sector: "Retail & SIM registration" },
  { id: "biz_citycabs", name: "CityCabs", sector: "Ride-hailing" },
  { id: "biz_faithbanc", name: "FaithBanc", sector: "Cooperative banking" },
];

export const BUSINESS_BY_ID: Record<string, Business> = Object.fromEntries(
  BUSINESSES.map((b) => [b.id, b])
);
