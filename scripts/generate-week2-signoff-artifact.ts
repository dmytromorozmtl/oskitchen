/**
 * Week 2 media pilot sign-off record.
 *   npm run storefront:week2-artifacts
 */
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { isStorefrontMediaUploadConfigured } from "@/lib/storefront-builder/media-config";
import { loadStorefrontScriptEnv } from "./lib/load-storefront-script-env";

const ROOT = process.cwd();
const OUT = join(ROOT, "docs", "artifacts", "WEEK2_MEDIA_SIGNOFF_RECORD.md");

async function main(): Promise<void> {
  loadStorefrontScriptEnv();
  const date = new Date().toISOString().slice(0, 10);
  const media = isStorefrontMediaUploadConfigured();
  const bucket =
    process.env.STOREFRONT_SUPABASE_STORAGE_BUCKET?.trim() ||
    process.env.STOREFRONT_MEDIA_UPLOAD_BUCKET?.trim() ||
    "storefront-media";

  const md = [
    "# Week 2 — Media pilot sign-off (`hello`)",
    "",
    `**Generated:** ${date}`,
    "",
    "## Automated",
    "",
    `| Check | Status |`,
    `|-------|--------|`,
    `| Bucket env configured | ${media ? "✅" : "🟡"} |`,
    `| Bucket name | \`${bucket}\` |`,
    `| setup-media-bucket script | ${existsSync(join(ROOT, "scripts/setup-storefront-media-bucket.ts")) ? "✅ in repo" : "—"} |`,
    "",
    "## Manual (required)",
    "",
    "| Step | Done |",
    "|------|------|",
    "| Vercel `STOREFRONT_SUPABASE_STORAGE_BUCKET` + redeploy | ☐ |",
    "| Admin upload test JPEG | ☐ |",
    "| Image on public `/s/hello` | ☐ |",
    "| Slider uses bucket URL (Week 3 QA) | ☐ |",
    "",
    "## Week 3 next",
    "",
    "[`STOREFRONT_SLIDER_QA_CHECKLIST.md`](STOREFRONT_SLIDER_QA_CHECKLIST.md)",
    "",
    "## Week 4 backlog",
    "",
    "GitHub → New issue → **Storefront — forms file upload**",
    "",
  ].join("\n");

  writeFileSync(OUT, md, "utf8");
  console.log(`Wrote ${OUT}`);
}

void main();
