/**
 * Remove placeholder Upstash lines from .env.staging.local (doc copy-paste mistakes).
 *
 *   npm run staging:env:clean-placeholders
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { isPlaceholderEnvValue } from "./lib/staging-env-placeholders";

const TARGET = join(process.cwd(), ".env.staging.local");

function main() {
  if (!existsSync(TARGET)) {
    console.log("No .env.staging.local — nothing to clean");
    return;
  }
  const lines = readFileSync(TARGET, "utf8").split("\n");
  const out: string[] = [];
  let removed = 0;

  for (const line of lines) {
    const m = line.match(/^(UPSTASH_REDIS_REST_(?:URL|TOKEN))=(.*)$/);
    if (m) {
      const val = m[2]!.replace(/^["']|["']$/g, "");
      if (isPlaceholderEnvValue(val)) {
        removed++;
        continue;
      }
    }
    const appUrl = line.match(/^NEXT_PUBLIC_APP_URL=(.*)$/);
    if (appUrl && isPlaceholderEnvValue(appUrl[1]!.replace(/^["']|["']$/g, ""))) {
      removed++;
      continue;
    }
    out.push(line);
  }

  if (removed > 0) {
    writeFileSync(TARGET, out.join("\n"), "utf8");
    console.log(`Removed ${removed} placeholder line(s) from .env.staging.local`);
    console.log("Run: npm run staging:upstash:set -- --url=... --token=...");
  } else {
    console.log("No placeholders found in .env.staging.local");
  }
}

main();
