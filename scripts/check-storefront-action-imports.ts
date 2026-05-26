/**
 * Static guard: storefront-related server actions that call revalidate helpers must import them.
 * Does not execute action bodies (avoids server-only side effects).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const FILES = [
  "actions/storefront-pillar-settings.ts",
  "actions/storefront-advanced.ts",
  "actions/storefront-forms.ts",
  "actions/storefront-pages.ts",
  "actions/storefront-domains.ts",
  "actions/storefront-product-public.ts",
  "actions/storefront-contact.ts",
  "actions/storefront-settings.ts",
];

const NEEDLE = "revalidateStorefrontDashboardAndPublic";
const IMPORT_LINE = /from\s+["']@\/lib\/storefront\/revalidate-storefront-dashboard["']/;

function main() {
  let failed = false;
  for (const rel of FILES) {
    const abs = join(ROOT, rel);
    let src: string;
    try {
      src = readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    if (!src.includes(`${NEEDLE}(`)) continue;
    if (!IMPORT_LINE.test(src)) {
      console.error(`Missing import for ${NEEDLE} in ${rel}`);
      failed = true;
    }
  }
  if (failed) {
    process.exit(1);
  }
  console.log("Storefront action revalidate imports: OK");
}

main();
