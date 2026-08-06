// Polite, cached fetching.
//
// Three rules, all of them about not being a nuisance to schools whose material
// we are republishing in summary:
//   1. Identify ourselves and give a contact route.
//   2. Rate-limit per host.
//   3. Cache to disk, so re-running a harvest during development costs the
//      school nothing. Cached responses are reused until --fresh is passed.
//
// Deliberately not a crawler. Adapters name the exact pages they need.

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

const CACHE_DIR = join(process.cwd(), ".harvest-cache");
const MIN_GAP_MS = 1500; // per host
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // a week

const UA =
  "DiscerningACallBot/1.0 (+https://discern.wrootlabs.com; a non-commercial UMC vocational-discernment resource; contact via site)";

const lastHit = new Map<string, number>();
const robotsCache = new Map<string, string | null>();

function cacheKey(url: string) {
  return createHash("sha256").update(url).digest("hex").slice(0, 32);
}

async function pace(host: string) {
  const last = lastHit.get(host) ?? 0;
  const wait = MIN_GAP_MS - (Date.now() - last);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastHit.set(host, Date.now());
}

// A deliberately simple robots check: we only ever request specific pages a
// human could click to, so we look for a blanket disallow that would cover them.
async function allowed(url: string): Promise<boolean> {
  const u = new URL(url);
  const origin = u.origin;
  if (!robotsCache.has(origin)) {
    try {
      await pace(u.host);
      const res = await fetch(`${origin}/robots.txt`, { headers: { "user-agent": UA } });
      robotsCache.set(origin, res.ok ? await res.text() : null);
    } catch {
      robotsCache.set(origin, null);
    }
  }
  const txt = robotsCache.get(origin);
  if (!txt) return true;

  // Walk the * group only. Anything more elaborate than this and we should be
  // asking the school for permission rather than parsing harder.
  const lines = txt.split("\n").map((l) => l.replace(/#.*/, "").trim());
  let inStar = false;
  const disallows: string[] = [];
  for (const line of lines) {
    const m = /^user-agent:\s*(.+)$/i.exec(line);
    if (m) {
      inStar = m[1].trim() === "*";
      continue;
    }
    const d = /^disallow:\s*(.*)$/i.exec(line);
    if (d && inStar && d[1].trim()) disallows.push(d[1].trim());
  }
  return !disallows.some((p) => u.pathname.startsWith(p));
}

export interface FetchOptions {
  fresh?: boolean; // bypass cache
  binary?: boolean; // return a Buffer path instead of text (PDFs)
}

export interface Fetched {
  url: string;
  body: string;
  path: string; // where it landed on disk
  fromCache: boolean;
  fetchedAt: string; // ISO date
}

export async function get(url: string, opts: FetchOptions = {}): Promise<Fetched> {
  await mkdir(CACHE_DIR, { recursive: true });
  const ext = opts.binary ? "bin" : "txt";
  const path = join(CACHE_DIR, `${cacheKey(url)}.${ext}`);

  if (!opts.fresh) {
    try {
      const s = await stat(path);
      if (Date.now() - s.mtimeMs < CACHE_TTL_MS) {
        return {
          url,
          body: opts.binary ? "" : await readFile(path, "utf8"),
          path,
          fromCache: true,
          fetchedAt: new Date(s.mtimeMs).toISOString().slice(0, 10),
        };
      }
    } catch {
      // not cached yet
    }
  }

  if (!(await allowed(url))) {
    throw new Error(`robots.txt disallows ${url} — do not work around this`);
  }

  const u = new URL(url);
  await pace(u.host);
  const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);

  if (opts.binary) {
    await writeFile(path, Buffer.from(await res.arrayBuffer()));
    return { url, body: "", path, fromCache: false, fetchedAt: today() };
  }

  const body = await res.text();
  await writeFile(path, body, "utf8");
  return { url, body, path, fromCache: false, fetchedAt: today() };
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
