#!/usr/bin/env node
/**
 * Quebec — technical write-up -> .docx
 *
 * Zero dependencies. A .docx is a ZIP of OOXML parts, so this script parses a
 * small subset of Markdown and emits the package directly: no `npm install`,
 * no network, nothing to go stale.
 *
 *   node scripts/build-writeup-docx.mjs
 *
 * Supported Markdown (deliberately a subset — anything else is treated as text):
 *   # ## ###      headings
 *   -             bullet list (2-space indent nests one level)
 *   1.            numbered list
 *   | a | b |     tables with a |---|---| separator row
 *   >             callout
 *   ---           horizontal rule
 *   **bold**  `code`
 *
 * Output: Quebec-Technical-Writeup.docx in the repo root.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { deflateRawSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "docs", "quebec-technical-writeup.md");
const OUT = join(ROOT, "Quebec-Technical-Writeup.docx");

// ---------------------------------------------------------------------------
// ZIP container
// ---------------------------------------------------------------------------

let CRC_TABLE = null;
function crcTable() {
  if (CRC_TABLE) return CRC_TABLE;
  CRC_TABLE = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    CRC_TABLE[n] = c;
  }
  return CRC_TABLE;
}

function crc32(buf) {
  const t = crcTable();
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

/** DOS date/time. Fixed so builds are byte-reproducible. */
const DOS_TIME = 0;
const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;

/** Build a ZIP (deflate) from [{ name, data: Buffer }]. */
function makeZip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const e of entries) {
    const nameBuf = Buffer.from(e.name, "ascii");
    const raw = e.data;
    const deflated = deflateRawSync(raw, { level: 9 });
    // Only compress when it actually helps; otherwise store.
    const useDeflate = deflated.length < raw.length;
    const body = useDeflate ? deflated : raw;
    const method = useDeflate ? 8 : 0;
    const crc = crc32(raw);

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);
    locals.push(local, body);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(DOS_TIME, 12);
    central.writeUInt16LE(DOS_DATE, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);
    centrals.push(central);

    offset += local.length + body.length;
  }

  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...locals, cd, eocd]);
}

// ---------------------------------------------------------------------------
// XML helpers
// ---------------------------------------------------------------------------

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Inline `code` and **bold** -> runs. */
function runs(text, base = {}) {
  const out = [];
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p !== "");
  for (const part of parts) {
    let props = { ...base };
    let body = part;
    if (part.startsWith("**") && part.endsWith("**")) {
      body = part.slice(2, -2);
      props.bold = true;
    } else if (part.startsWith("`") && part.endsWith("`")) {
      body = part.slice(1, -1);
      props.code = true;
    }
    if (body === "") continue;
    const rPr = [];
    if (props.bold) rPr.push("<w:b/>");
    if (props.italic) rPr.push("<w:i/>");
    if (props.color) rPr.push(`<w:color w:val="${props.color}"/>`);
    if (props.size) rPr.push(`<w:sz w:val="${props.size}"/><w:szCs w:val="${props.size}"/>`);
    if (props.code) {
      rPr.push('<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>');
      rPr.push('<w:shd w:val="clear" w:color="auto" w:fill="F1F3F5"/>');
      rPr.push("<w:sz w:val=\"19\"/><w:szCs w:val=\"19\"/>");
    }
    out.push(
      `<w:r>${rPr.length ? `<w:rPr>${rPr.join("")}</w:rPr>` : ""}` +
        `<w:t xml:space="preserve">${esc(body)}</w:t></w:r>`
    );
  }
  return out.join("");
}

function para({ text = "", style = null, indent = 0, hanging = false, bullet = null, spaceBefore = 0, spaceAfter = 120, border = false, base = {} }) {
  const pPr = [];
  if (style) pPr.push(`<w:pStyle w:val="${style}"/>`);
  if (border) {
    pPr.push(
      '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="D8DEE4"/></w:pBdr>'
    );
  }
  if (indent || hanging) {
    pPr.push(
      `<w:ind w:left="${indent}"${hanging ? ` w:hanging="${hanging}"` : ""}/>`
    );
  }
  pPr.push(`<w:spacing w:before="${spaceBefore}" w:after="${spaceAfter}" w:line="276" w:lineRule="auto"/>`);
  const content = bullet
    ? `<w:r><w:t xml:space="preserve">${esc(bullet)}</w:t></w:r>` + runs(text, base)
    : runs(text, base);
  return `<w:p><w:pPr>${pPr.join("")}</w:pPr>${content}</w:p>`;
}

function table(rows) {
  const cols = Math.max(...rows.map((r) => r.length));
  const CONTENT = 9026; // A4 width minus margins, in twips
  const colW = Math.floor(CONTENT / cols);
  const grid = Array.from({ length: cols }, () => `<w:gridCol w:w="${colW}"/>`).join("");

  const borders =
    "<w:tblBorders>" +
    ["top", "left", "bottom", "right", "insideH", "insideV"]
      .map((s) => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="C9D2DA"/>`)
      .join("") +
    "</w:tblBorders>";

  const body = rows
    .map((cells, ri) => {
      const isHeader = ri === 0;
      const tcs = Array.from({ length: cols }, (_, ci) => {
        const text = cells[ci] ?? "";
        const shade = isHeader
          ? '<w:shd w:val="clear" w:color="auto" w:fill="F1F3F5"/>'
          : "";
        const p = para({
          text,
          spaceBefore: 40,
          spaceAfter: 40,
          base: isHeader ? { bold: true } : {},
        });
        return `<w:tc><w:tcPr><w:tcW w:w="${colW}" w:type="dxa"/>${shade}<w:vAlign w:val="center"/></w:tcPr>${p}</w:tc>`;
      }).join("");
      return `<w:tr>${isHeader ? '<w:trPr><w:tblHeader/></w:trPr>' : ""}${tcs}</w:tr>`;
    })
    .join("");

  return (
    `<w:tbl><w:tblPr><w:tblW w:w="${CONTENT}" w:type="dxa"/>${borders}` +
    '<w:tblCellMar><w:left w:w="108" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar>' +
    `</w:tblPr><w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl>` +
    // A table must be followed by a paragraph or Word merges the next block into it.
    para({ text: "", spaceAfter: 0 })
  );
}

// ---------------------------------------------------------------------------
// Markdown -> body
// ---------------------------------------------------------------------------

function convert(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const body = [];
  let i = 0;

  const isTableRow = (s) => /^\s*\|.*\|\s*$/.test(s);
  const isTableSep = (s) => /^\s*\|[\s:|-]+\|\s*$/.test(s) && s.includes("-");

  // Drop a leading H1 block: it is rendered on its own as the document title.
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^\s*---+\s*$/.test(line)) {
      body.push(para({ text: "", border: true, spaceBefore: 120, spaceAfter: 200 }));
      i++;
      continue;
    }

    // Headings
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const style = `Heading${level}`;
      body.push(para({ text: h[2].trim(), style, spaceBefore: level === 1 ? 0 : 320, spaceAfter: 140 }));
      i++;
      continue;
    }

    // Table
    if (isTableRow(line)) {
      const rows = [];
      while (i < lines.length && isTableRow(lines[i])) {
        if (!isTableSep(lines[i])) {
          rows.push(
            lines[i]
              .trim()
              .replace(/^\|/, "")
              .replace(/\|$/, "")
              .split("|")
              .map((c) => c.trim())
          );
        }
        i++;
      }
      if (rows.length) body.push(table(rows));
      continue;
    }

    // Blockquote / callout
    if (/^\s*>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      body.push(
        para({
          text: buf.join(" "),
          indent: 288,
          base: { italic: true, color: "3F4A56" },
          spaceBefore: 120,
          spaceAfter: 160,
        })
      );
      continue;
    }

    // Bullet list
    if (/^\s*-\s+/.test(line)) {
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        const m = /^(\s*)-\s+(.*)$/.exec(lines[i]);
        const depth = Math.min(1, Math.floor(m[1].length / 2));
        const left = 288 + depth * 288;
        body.push(
          para({
            text: m[2].trim(),
            indent: left,
            hanging: 216,
            bullet: depth === 0 ? "•  " : "–  ",
            spaceAfter: 80,
          })
        );
        i++;
      }
      continue;
    }

    // Numbered list
    if (/^\s*\d+\.\s+/.test(line)) {
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const m = /^\s*(\d+)\.\s+(.*)$/.exec(lines[i]);
        body.push(
          para({
            text: m[2].trim(),
            indent: 288,
            hanging: 288,
            bullet: `${m[1]}.  `,
            spaceAfter: 80,
          })
        );
        i++;
      }
      continue;
    }

    // Paragraph: consume until a blank line or the start of another block.
    const buf = [line.trim()];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^\s*-\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !isTableRow(lines[i]) &&
      !/^\s*---+\s*$/.test(lines[i])
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    body.push(para({ text: buf.join(" ") }));
  }

  return body.join("");
}

// ---------------------------------------------------------------------------
// Package
// ---------------------------------------------------------------------------

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const DOC_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr>
<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
<w:color w:val="1A1F24"/><w:sz w:val="22"/><w:szCs w:val="22"/>
</w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>
</w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/>
<w:pPr><w:keepNext/><w:outlineLvl w:val="0"/></w:pPr>
<w:rPr><w:b/><w:color w:val="0F2A3F"/><w:sz w:val="36"/><w:szCs w:val="36"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/>
<w:pPr><w:keepNext/><w:outlineLvl w:val="1"/><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="2" w:color="C9D2DA"/></w:pBdr></w:pPr>
<w:rPr><w:b/><w:color w:val="14405C"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/>
<w:pPr><w:keepNext/><w:outlineLvl w:val="2"/></w:pPr>
<w:rPr><w:b/><w:color w:val="1B5677"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>
</w:styles>`;

const md = readFileSync(SRC, "utf8");
const bodyXml = convert(md);

const DOCUMENT = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>${bodyXml}
<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>
<w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1418" w:header="708" w:footer="708" w:gutter="0"/>
</w:sectPr></w:body></w:document>`;

const zip = makeZip([
  { name: "[Content_Types].xml", data: Buffer.from(CONTENT_TYPES, "utf8") },
  { name: "_rels/.rels", data: Buffer.from(RELS, "utf8") },
  { name: "word/_rels/document.xml.rels", data: Buffer.from(DOC_RELS, "utf8") },
  { name: "word/document.xml", data: Buffer.from(DOCUMENT, "utf8") },
  { name: "word/styles.xml", data: Buffer.from(STYLES, "utf8") },
]);

writeFileSync(OUT, zip);

const words = md.split(/\s+/).filter(Boolean).length;
console.log(`wrote ${OUT}`);
console.log(`  source : ${SRC}`);
console.log(`  ${(zip.length / 1024).toFixed(1)} KB · ~${words} words`);
