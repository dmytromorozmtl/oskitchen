/**
 * Scan all root .env* files for valid Upstash REST credentials.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parseDotenv } from "./load-dotenv-file";
import {
  isValidUpstashToken,
  isValidUpstashUrl,
} from "./staging-env-placeholders";

export type UpstashScanHit = {
  url: string;
  token: string;
  source: string;
};

const PASTE_FILES = [".env.upstash.paste.local", ".env.upstash.paste"];

export function scanUpstashCredentials(root: string): UpstashScanHit | undefined {
  const hits: UpstashScanHit[] = [];

  const tryPair = (url: string | undefined, token: string | undefined, source: string) => {
    const u = url?.trim();
    const t = token?.trim();
    if (isValidUpstashUrl(u) && isValidUpstashToken(t)) {
      hits.push({ url: u!, token: t!, source });
    }
  };

  for (const rel of PASTE_FILES) {
    const p = join(root, rel);
    if (!existsSync(p)) continue;
    const env = parseDotenv(readFileSync(p, "utf8"));
    tryPair(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN, rel);
  }

  let files: string[] = [];
  try {
    files = readdirSync(root).filter((f) => f.startsWith(".env"));
  } catch {
    return hits[0];
  }

  const priority = [
    ".env.staging.local",
    ".env.vercel.staging",
    ".env.production.local",
    ".env.local",
    ".env.beta.local",
  ];

  const ordered = [
    ...priority.filter((f) => files.includes(f)),
    ...files.filter((f) => !priority.includes(f)).sort(),
  ];

  for (const rel of ordered) {
    const p = join(root, rel);
    if (!existsSync(p)) continue;
    const env = parseDotenv(readFileSync(p, "utf8"));
    tryPair(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN, rel);
  }

  return hits[0];
}
