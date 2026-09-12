#!/usr/bin/env node
/**
 * Quebec — synthetic dataset tool.
 *
 * Owns `lib/mockData/users.ts`: the fully fabricated identity records that power
 * the demo. No real personal data is used, collected or stored at any stage.
 *
 * Modes
 * -----
 *   node scripts/generate-mock-users.mjs           write users.ts from CURATED_CAST
 *   node scripts/generate-mock-users.mjs --check   verify users.ts still matches it
 *   node scripts/generate-mock-users.mjs --new     invent a FRESH cast -> users.new.ts
 *
 * Why a curated cast instead of a pure PRNG dump
 * ----------------------------------------------
 * The dataset is demo copy: names appear in screenshots, references appear in the
 * README, and the two anchors must produce specific verdicts. So the cast is
 * curated and authoritative here, and the file is a faithful serialisation of it.
 * `--check` makes that claim verifiable; `--new` still generates alternatives.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "lib", "mockData", "users.ts");
const OUT_NEW = join(__dirname, "..", "lib", "mockData", "users.new.ts");

/** Reference alphabet — no I, O, 0 (lookalikes). Mirrors lib/refs.ts. */
const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";
const REF_RE = /^QBC-[ABCDEFGHJKLMNPQRSTUVWXYZ1-9]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ1-9]{2}$/;

const DEMO_IDENTITY_REFERENCE = "QBC-8X92-1F";
const DEMO_UNDER18_REFERENCE = "QBC-7KD4-M3";
const DEMO_NOT_FOUND_REFERENCE = "QBC-9ZZZ-00";

/**
 * THE AUTHORITATIVE CAST.
 * Edits here are the only edits that survive `npm run generate:users`.
 * `npm run check:users` fails if users.ts has drifted from this list.
 */
const CURATED_CAST = [
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

// ---- helpers ---------------------------------------------------------------

/** True age in whole years, month/day aware (mirrors lib/format.ts computeAge). */
function ageOf(dob, now = new Date()) {
  const d = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return -1;
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age -= 1;
  return age;
}

// ---- validation ------------------------------------------------------------

/** @returns {{errors: string[], warnings: string[]}} */
function validate(records) {
  const errors = [];
  const warnings = [];
  const seen = { id: new Map(), uniqueId: new Map(), nin: new Map() };
  const REF_CHARSET = new Set(REF_CHARS);

  if (!Array.isArray(records) || records.length === 0) {
    return { errors: ["cast is empty"], warnings };
  }

  records.forEach((r, i) => {
    const at = `record[${i}] (${r.id ?? "?"})`;
    for (const field of ["id", "uniqueId", "name", "dob", "nin", "kycStatus"]) {
      if (typeof r[field] !== "string" || r[field].length === 0) {
        errors.push(`${at}: missing or empty "${field}"`);
      }
    }
    if (typeof r.id === "string" && !/^id_[a-z]+$/.test(r.id)) {
      errors.push(`${at}: id "${r.id}" should look like "id_adaeze" (id_ + lowercase letters)`);
    }
    if (typeof r.uniqueId === "string" && !REF_RE.test(r.uniqueId)) {
      errors.push(`${at}: reference "${r.uniqueId}" is not QBC-XXXX-XX over the lookalike-free alphabet`);
    }
    if (typeof r.nin === "string" && !/^\d{11}$/.test(r.nin)) {
      errors.push(`${at}: nin "${r.nin}" must be exactly 11 digits`);
    }
    if (typeof r.dob === "string") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(r.dob) || Number.isNaN(new Date(`${r.dob}T00:00:00Z`).getTime())) {
        errors.push(`${at}: dob "${r.dob}" is not a valid ISO yyyy-mm-dd date`);
      } else if (ageOf(r.dob) < 0) {
        errors.push(`${at}: dob "${r.dob}" is in the future`);
      }
    }
    if (typeof r.name === "string" && r.name.trim().split(/\s+/).length < 2) {
      warnings.push(`${at}: name "${r.name}" is a single word`);
    }
    if (r.kycStatus !== "verified" && r.kycStatus !== "self_asserted") {
      errors.push(`${at}: kycStatus "${r.kycStatus}" must be "verified" or "self_asserted"`);
    }
    for (const key of ["id", "uniqueId", "nin"]) {
      if (typeof r[key] !== "string") continue;
      const prev = seen[key].get(r[key]);
      if (prev !== undefined) errors.push(`${at}: duplicate ${key} "${r[key]}" (also at record[${prev}])`);
      else seen[key].set(r[key], i);
    }
  });

  // ---- anchors the demo copy depends on -----------------------------------
  const anchor = records.find((r) => r.uniqueId === DEMO_IDENTITY_REFERENCE);
  if (!anchor) {
    errors.push(`anchor ${DEMO_IDENTITY_REFERENCE} (over-18 YES demo) is missing from the cast`);
  } else if (ageOf(anchor.dob) < 18) {
    errors.push(`anchor ${DEMO_IDENTITY_REFERENCE} must be over 18 to demo a YES — currently ${ageOf(anchor.dob)}`);
  } else if (anchor.kycStatus !== "verified") {
    errors.push(`anchor ${DEMO_IDENTITY_REFERENCE} must have kycStatus "verified"`);
  }

  const under = records.find((r) => r.uniqueId === DEMO_UNDER18_REFERENCE);
  if (!under) {
    errors.push(`anchor ${DEMO_UNDER18_REFERENCE} (under-18 NO demo) is missing from the cast`);
  } else if (ageOf(under.dob) >= 18) {
    errors.push(
      `anchor ${DEMO_UNDER18_REFERENCE} is ${ageOf(under.dob)} — it aged out of the under-18 demo on its 18th birthday (${under.dob}). Pick a younger dob or a different record.`
    );
  } else if (ageOf(under.dob) === 17) {
    warnings.push(`anchor ${DEMO_UNDER18_REFERENCE} turns 18 within a year — the NO demo has a shelf life`);
  }

  // The NO-MATCH reference must not exist in the cast, and must be impossible to
  // generate — otherwise a real record could collide with it and the NO MATCH
  // demo would silently start returning a match.
  if (records.some((r) => r.uniqueId === DEMO_NOT_FOUND_REFERENCE)) {
    errors.push(`${DEMO_NOT_FOUND_REFERENCE} is reserved for the NO MATCH demo but is present in the cast`);
  }
  const body = DEMO_NOT_FOUND_REFERENCE.replace(/^QBC-/, "").replace(/-/g, "");
  if ([...body].every((c) => REF_CHARSET.has(c))) {
    errors.push(
      `${DEMO_NOT_FOUND_REFERENCE} is made only of characters the generator can produce, so a real record could collide with it. Include a character outside "${REF_CHARS}" (e.g. 0, I or O).`
    );
  }

  // the whole point of the mix
  if (!records.some((r) => ageOf(r.dob) < 18)) errors.push("cast has no under-18 record, so the NO demo has nothing to show");
  if (!records.some((r) => ageOf(r.dob) >= 18)) errors.push("cast has no over-18 record");
  if (!records.some((r) => r.kycStatus === "verified")) errors.push("cast has no document-verified record");
  if (!records.some((r) => r.kycStatus === "self_asserted")) errors.push("cast has no self-asserted record");

  return { errors, warnings };
}

// ---- module rendering ------------------------------------------------------

function renderRecords(records) {
  return records
    .map(
      (r) =>
        `  { id: "${r.id}", uniqueId: "${r.uniqueId}", name: "${r.name}", dob: "${r.dob}", nin: "${r.nin}", kycStatus: "${r.kycStatus}" },`
    )
    .join("\n");
}

function renderModule(records) {
  return `import type { KycStatus } from "@/lib/types";
import { daysAgo } from "@/lib/format";

/**
 * SYNTHETIC IDENTITY DATASET — curated, fully fabricated
 * ------------------------------------------------------
 * Every record below is invented for demonstration: Nigerian-style name
 * combinations, random dates of birth, and 11-digit NIN-format numbers that
 * correspond to no real person and no real registry entry. No real personal
 * information is used, collected or stored at any stage of this project.
 *
 * GENERATED FILE — do not edit by hand. The authoritative cast lives in
 * \`scripts/generate-mock-users.mjs\`:
 *
 *   npm run generate:users    rewrite this file from that cast
 *   npm run check:users       verify this file still matches it (fails loudly)
 *
 * Ages are deliberately mixed so the "Is over 18?" check has both YES and NO
 * outcomes to demo. The two pinned anchors below are asserted by the generator,
 * which errors rather than emit a cast that can no longer demo its own story.
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
export const DEMO_IDENTITY_REFERENCE = "${DEMO_IDENTITY_REFERENCE}";
/** Reference used to demo a NO on "Is over 18?". */
export const DEMO_UNDER18_REFERENCE = "${DEMO_UNDER18_REFERENCE}";
/** Deliberately not present in the dataset, for the NO MATCH outcome. */
export const DEMO_NOT_FOUND_REFERENCE = "${DEMO_NOT_FOUND_REFERENCE}";

export const SYNTHETIC_USERS: SyntheticUserRecord[] = [
${renderRecords(records)}
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
`;
}

// ---- fresh generation (--new) ---------------------------------------------

/** mulberry32: deterministic PRNG. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "Adaeze", "Chinedu", "Amina", "Oluwaseun", "Ngozi", "Ibrahim", "Tobi",
  "Funke", "Emeka", "Zainab", "Ifeanyi", "Yemi", "Chiamaka", "Abubakar",
  "Simi", "Kelechi", "Halima", "Bayo", "Nneka", "Tunde", "Fatima", "Musa",
];
const LAST = [
  "Okafor", "Nwachukwu", "Bello", "Adeyemi", "Eze", "Musa", "Akinloye",
  "Adebayo", "Obi", "Abdullahi", "Uche", "Alabi", "Nwosu", "Sani", "Ogunleye",
  "Umeh", "Danjuma", "Lawal", "Okeke", "Balogun", "Yusuf", "Adeleke",
];

function generateCast(seed = 20260830, count = 16) {
  const rand = mulberry32(seed);
  const refFrom = (len) =>
    Array.from({ length: len }, () => REF_CHARS[Math.floor(rand() * REF_CHARS.length)]).join("");
  const records = [];
  const usedNames = new Set();
  const usedRefs = new Set();
  const usedIds = new Set();

  const nameAt = () => {
    if (usedNames.size >= FIRST.length * LAST.length) throw new Error("name pool exhausted");
    let name;
    do {
      name = `${FIRST[Math.floor(rand() * FIRST.length)]} ${LAST[Math.floor(rand() * LAST.length)]}`;
    } while (usedNames.has(name));
    usedNames.add(name);
    return name;
  };
  const uniqueIdAt = () => {
    let ref;
    do {
      ref = `QBC-${refFrom(4)}-${refFrom(2)}`;
    } while (usedRefs.has(ref));
    usedRefs.add(ref);
    return ref;
  };
  const idAt = (name) => {
    let id = `id_${name.split(" ")[0].toLowerCase()}`;
    let n = 2;
    while (usedIds.has(id)) id = `id_${name.split(" ")[0].toLowerCase()}${n++}`;
    usedIds.add(id);
    return id;
  };

  while (records.length < count) {
    const name = nameAt();
    const uniqueId = uniqueIdAt();
    // every 4th record is a teenager: born 17 years ago, so still under 18 today
    const teen = records.length % 4 === 1;
    const now = new Date();
    const year = teen
      ? now.getUTCFullYear() - 17
      : 1985 + Math.floor(rand() * (now.getUTCFullYear() - 18 - 1985));
    const dob = `${year}-${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}-${String(1 + Math.floor(rand() * 28)).padStart(2, "0")}`;
    records.push({
      id: idAt(name),
      uniqueId,
      name,
      dob,
      nin: Array.from({ length: 11 }, () => Math.floor(rand() * 10)).join(""),
      kycStatus: teen ? "self_asserted" : rand() > 0.35 ? "verified" : "self_asserted",
    });
  }

  // Pin the anchors by exact age, not by birth year — a year test can pick an
  // 18-year-old for the "under 18" slot the moment the seed changes.
  const over = records.find((r) => ageOf(r.dob) >= 18);
  if (over) Object.assign(over, { id: "id_adaeze", uniqueId: DEMO_IDENTITY_REFERENCE, name: "Adaeze Okafor", dob: "1994-03-12", nin: "40172345678", kycStatus: "verified" });
  const under = records.find((r) => ageOf(r.dob) < 18 && r !== over);
  if (under) Object.assign(under, { id: "id_ibrahim", uniqueId: DEMO_UNDER18_REFERENCE, name: "Ibrahim Musa", dob: `${new Date().getUTCFullYear() - 17}-12-07`, nin: "46329087154", kycStatus: "self_asserted" });

  return records;
}

// ---- comparison ------------------------------------------------------------

function parseRecordsFrom(source) {
  const body = source.slice(source.indexOf("export const SYNTHETIC_USERS"));
  const out = [];
  const re = /\{\s*id:\s*"([^"]*)",\s*uniqueId:\s*"([^"]*)",\s*name:\s*"([^"]*)",\s*dob:\s*"([^"]*)",\s*nin:\s*"([^"]*)",\s*kycStatus:\s*"([^"]*)"\s*\}/g;
  let m;
  while ((m = re.exec(body))) {
    out.push({ id: m[1], uniqueId: m[2], name: m[3], dob: m[4], nin: m[5], kycStatus: m[6] });
  }
  return out;
}

function compare(expected, actual) {
  const problems = [];
  if (expected.length !== actual.length) {
    problems.push(`record count: cast has ${expected.length}, file has ${actual.length}`);
  }
  const n = Math.max(expected.length, actual.length);
  for (let i = 0; i < n; i++) {
    const e = expected[i];
    const a = actual[i];
    if (!e) { problems.push(`record[${i}]: file has an extra record (${a.uniqueId})`); continue; }
    if (!a) { problems.push(`record[${i}]: file is missing ${e.uniqueId}`); continue; }
    for (const f of ["id", "uniqueId", "name", "dob", "nin", "kycStatus"]) {
      if (e[f] !== a[f]) problems.push(`record[${i}] ${e.uniqueId}: ${f} is "${a[f]}" but the cast says "${e[f]}"`);
    }
  }
  return problems;
}

// ---- main ------------------------------------------------------------------

const args = new Set(process.argv.slice(2));
const report = (r) => {
  for (const w of r.warnings) console.warn(`  warning: ${w}`);
  for (const e of r.errors) console.error(`  error:   ${e}`);
};

if (args.has("--check")) {
  let source;
  try {
    source = readFileSync(OUT, "utf8");
  } catch {
    console.error(`FAIL  ${OUT} does not exist. Run: npm run generate:users`);
    process.exit(1);
  }
  const inFile = parseRecordsFrom(source);
  const problems = compare(CURATED_CAST, inFile);
  const v = validate(inFile);
  console.log(`Checking ${OUT} against the cast in scripts/generate-mock-users.mjs ...`);
  report(v);
  for (const p of problems) console.error(`  drift:   ${p}`);
  if (problems.length === 0 && v.errors.length === 0) {
    console.log(`PASS  ${inFile.length} synthetic records match the curated cast.`);
    process.exit(0);
  }
  console.error(`\nFAIL  ${v.errors.length + problems.length} problem(s).`);
  console.error("      Fix by editing CURATED_CAST in scripts/generate-mock-users.mjs,");
  console.error("      then run: npm run generate:users");
  process.exit(1);
}

if (args.has("--new")) {
  const records = generateCast();
  const v = validate(records);
  report(v);
  if (v.errors.length) {
    console.error(`\nRefusing to write ${records.length} records that do not validate.`);
    process.exit(1);
  }
  mkdirSync(dirname(OUT_NEW), { recursive: true });
  writeFileSync(OUT_NEW, renderModule(records), "utf8");
  console.log(`Wrote ${records.length} freshly generated records -> ${OUT_NEW}`);
  console.log("This is a PROPOSAL. users.ts is untouched.");
  console.log("To adopt it: review it, move it over users.ts, and update CURATED_CAST to match.");
  process.exit(0);
}

// default: serialise the curated cast
const v = validate(CURATED_CAST);
report(v);
if (v.errors.length) {
  console.error(`\nRefusing to write ${OUT} — the curated cast does not validate.`);
  process.exit(1);
}
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, renderModule(CURATED_CAST), "utf8");
console.log(`Wrote ${CURATED_CAST.length} synthetic records -> ${OUT}`);
console.log("Verify with: npm run check:users");
