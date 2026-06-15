import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parseDotenv } from "./load-dotenv-file";
import {
  isValidUpstashToken,
  isValidUpstashUrl,
} from "./staging-env-placeholders";

export type UpstashPasteState =
  | "missing"
  | "template"
  | "url-only"
  | "ready";

const PASTE = ".env.upstash.paste.local";

export function upstashPastePath(root: string): string {
  return join(root, PASTE);
}

export function getUpstashPasteState(root: string): {
  state: UpstashPasteState;
  path: string;
} {
  const path = upstashPastePath(root);
  if (!existsSync(path)) {
    return { state: "missing", path };
  }
  const env = parseDotenv(readFileSync(path, "utf8"));
  const url = env.UPSTASH_REDIS_REST_URL?.trim() ?? "";
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? "";

  if (isValidUpstashUrl(url) && isValidUpstashToken(token)) {
    return { state: "ready", path };
  }
  if (isValidUpstashUrl(url) && !token) {
    return { state: "url-only", path };
  }
  return { state: "template", path };
}
