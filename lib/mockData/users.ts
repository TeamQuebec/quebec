import type { KycStatus } from "@/lib/types";
import { daysAgo } from "@/lib/format";

/**
 * SYNTHETIC IDENTITY DATASET
 * ---------------------------
 * Every record below is fabricated for demonstration: invented Nigerian-style
 * names, random dates of birth, and 11-digit NIN-format numbers that resemble
 * no real registry entry. No real personal information is used, collected or
 * stored at any stage of this project.
 *
 * Ages are deliberately mixed so the "Is over 18?" check has real YES and NO
 * outcomes to demo (see the UNDER-18 entries).
 *
 * Regenerate an equivalent dataset with:  npm run generate:users
 */

export interface SyntheticUserRecord {
  id: string;
  uniqueId: string;
  name: string;
  dob: string; // ISO yyyy-mm-dd
  nin: string; // 11 digits, fake
  kycStatus: KycStatus;
}

/** Reference used in copy / demos — the curated, document-verified identity. */
export const DEMO_IDENTITY_REFERENCE = "QBC-8X92-1F";
/** Reference used to demo a NO on "Is over 18?". */
export const DEMO_UNDER18_REFERENCE = "QBC-7KD4-M3";
/** Deliberately not present in the dataset, for the NO MATCH outcome. */
export const DEMO_NOT_FOUND_REFERENCE = "QBC-9ZZZ-00";

export const SYNTHETIC_USERS: SyntheticUserRecord[] = [
  { id: "id_adaeze", uniqueId: "QBC-8X92-1F", name: "Adaeze Okafor", dob: "1994-03-12", nin: "40172345678", kycStatus: "verified" },
  { id: "id_chinedu", uniqueId: "QBC-3T2M-7K", name: "Chinedu Nwachukwu", dob: "2001-11-02", nin: "51209876543", kycStatus: "verified" },
  { id: "id_amina", uniqueId: "QBC-6NQ4-2P", name: "Amina Bello", dob: "2005-06-23", nin: "38901234567", kycStatus: "verified" },
  { id: "id_oluwaseun", uniqueId: "QBC-9KH5-4R", name: "Oluwaseun Adeyemi", dob: "1988-09-15", nin: "44781239051", kycStatus: "verified" },
  { id: "id_ngozi", uniqueId: "QBC-2PL8-6M", name: "Ngozi Eze", dob: "2010-04-19", nin: "50123984726", kycStatus: "self_asserted" },
  { id: "id_ibrahim", uniqueId: "QBC-7KD4-M3", name: "Ibrahim Musa", dob: "2009-12-07", nin: "46329087154", kycStatus: "self_asserted" },
  { id: "id_tobi", uniqueId: "QBC-4NW7-9Q", name: "Tobi Akinloye", dob: "1999-02-28", nin: "52190847631", kycStatus: "verified" },
  { id: "id_funke", uniqueId: "QBC-8RJB-2X", name: "Funke Adebayo", dob: "2003-07-11", nin: "38102456719", kycStatus: "self_asserted" },
  { id: "id_emeka", uniqueId: "QBC-5MK9-3C", name: "Emeka Obi", dob: "1996-05-30", nin: "45219038746", kycStatus: "verified" },
  { id: "id_zainab", uniqueId: "QBC-1TD6-8S", name: "Zainab Abdullahi", dob: "2007-10-05", nin: "49384721506", kycStatus: "self_asserted" },
  { id: "id_ifeanyi", uniqueId: "QBC-3VX8-5N", name: "Ifeanyi Uche", dob: "2011-01-25", nin: "47162908354", kycStatus: "self_asserted" },
  { id: "id_yemi", uniqueId: "QBC-6PW2-9D", name: "Yemi Alabi", dob: "1992-08-08", nin: "40567891234", kycStatus: "verified" },
  { id: "id_chiamaka", uniqueId: "QBC-9JB4-1G", name: "Chiamaka Nwosu", dob: "2006-03-16", nin: "51983472605", kycStatus: "self_asserted" },
  { id: "id_abubakar", uniqueId: "QBC-2RM6-4T", name: "Abubakar Sani", dob: "1985-12-01", nin: "43456201987", kycStatus: "verified" },
  { id: "id_simi", uniqueId: "QBC-7XK3-9V", name: "Simi Ogunleye", dob: "2012-09-03", nin: "48729034516", kycStatus: "self_asserted" },
  { id: "id_kelechi", uniqueId: "QBC-5CN8-7J", name: "Kelechi Umeh", dob: "2002-04-14", nin: "45678901234", kycStatus: "self_asserted" },
];

/** Built from SYNTHETIC_USERS at runtime so createdAt stays "recent" for demos. */
export interface SeedIdentity extends SyntheticUserRecord {
  createdAt: string;
}

export function buildSeedIdentities(): SeedIdentity[] {
  return SYNTHETIC_USERS.map((u, i) => ({
    ...u,
    createdAt: daysAgo(9 - (i % 7)),
  }));
}
