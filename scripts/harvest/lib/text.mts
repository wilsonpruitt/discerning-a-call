// HTML and PDF to readable text.
//
// Written three times by hand during the Perkins, Austin, and Brite harvests
// before being pulled out here. The block-element handling matters: without it,
// a faculty name and their title collapse onto one line and the pairing is lost.

import { execFileSync } from "node:child_process";

export function htmlToText(html: string): string {
  let s = html;
  s = s.replace(/<(script|style|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, " ");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/(p|div|li|h[1-6]|tr|td|th|section|article)>/gi, "\n");
  s = s.replace(/<[^>]+>/g, " ");
  s = decodeEntities(s);
  s = s.replace(/[ \t ]+/g, " ");

  const out: string[] = [];
  for (const raw of s.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (out[out.length - 1] === line) continue; // collapse nav duplication
    out.push(line);
  }
  return out.join("\n");
}

function decodeEntities(s: string): string {
  const named: Record<string, string> = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
    rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
    mdash: "—", ndash: "–", hellip: "…", eacute: "é",
  };
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => named[n.toLowerCase()] ?? m);
}

// Requires poppler's pdftotext on PATH. Layout mode preserved because the
// Perkins degree-progress sheets are column-formatted and collapse without it.
export function pdfToText(path: string): string {
  try {
    return execFileSync("pdftotext", ["-layout", path, "-"], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (e) {
    throw new Error(
      `pdftotext failed on ${path}. Install poppler (brew install poppler). ${String(e)}`,
    );
  }
}

// Extract every href from an HTML document, absolutised.
export function links(html: string, base: string): { text: string; url: string }[] {
  const out: { text: string; url: string }[] = [];
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      out.push({
        url: new URL(m[1], base).toString(),
        text: decodeEntities(m[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(),
      });
    } catch {
      // unparseable href, skip
    }
  }
  return out;
}
