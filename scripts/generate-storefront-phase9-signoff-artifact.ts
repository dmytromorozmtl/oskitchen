/**
 * Phase 9 go-live artifact: env + optional HTTP smoke + phase 9 checklist.
 *
 *   STOREFRONT_SMOKE_BASE_URL=https://your-app.vercel.app npm run storefront:phase9-artifact
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { formatSmokeUrlError, validateSmokeBaseUrl } from "./lib/validate-smoke-base-url";
import { runStorefrontHttpSmoke, smokeSlug } from "./storefront-release-smoke";

const ROOT = process.cwd();

async function main(): Promise<void> {
  const rawBase = process.env.STOREFRONT_SMOKE_BASE_URL?.trim() || "";
  const slug = smokeSlug();
  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# Storefront Phase 9 sign-off — ${date}`,
    "",
    "## Scope",
    "- kos_brand cookie + middleware host resolution (brand before market)",
    "- Per-brand robots.txt + sitemap canonical",
    "- Invite audit CSV export + 90d retention cron",
    "- Multi-store switcher + brand vanity E2E",
    "",
  ];

  if (!rawBase) {
    lines.push("## P0 gate", "", "⚠️ **BLOCKED** — set `STOREFRONT_SMOKE_BASE_URL` to your Vercel deployment URL.", "");
  } else {
    const urlCheck = validateSmokeBaseUrl(rawBase);
    if (!urlCheck.ok) {
      console.error(formatSmokeUrlError(urlCheck));
      process.exit(1);
    }
    const base = urlCheck.origin;
    lines.push("## P0 HTTP smoke", "", `- Base: \`${base}\``, `- Slug: \`${slug}\``, "");

    try {
      const results = await runStorefrontHttpSmoke(base, slug);
      for (const r of results) {
        lines.push(`- ${r.pass ? "✓" : "✗"} ${r.label} — ${r.detail ?? r.status ?? "—"}`);
      }
      lines.push("");
      const robots = await fetch(`${base}/s/${slug}/robots.txt`);
      lines.push(`- robots.txt: ${robots.status} ${robots.ok ? "✓" : "✗"}`);
      const sitemap = await fetch(`${base}/s/${slug}/sitemap.xml`);
      lines.push(`- sitemap.xml: ${sitemap.status} ${sitemap.ok ? "✓" : "✗"}`);
      lines.push("");
    } catch (e) {
      lines.push(`Smoke error: ${e instanceof Error ? e.message : String(e)}`, "");
    }
  }

  const gitSha = spawnSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" });
  if (gitSha.status === 0) {
    lines.push("## Build", "", `- git: \`${gitSha.stdout.trim()}\``, "");
  }

  lines.push(
    "## Manual sign-off",
    "",
    "- [ ] Brand vanity host sets kos_brand and brand theme on menu",
    "- [ ] Audit CSV downloads from dashboard",
    "- [ ] CRON_SECRET + retention cron scheduled on Vercel",
    "- [ ] Multi-store switcher switches admin cookie",
    "",
  );

  const outPath =
    process.env.STOREFRONT_PHASE9_ARTIFACT?.trim() ||
    join(ROOT, "docs", "artifacts", `storefront-phase9-signoff-${date}.md`);

  mkdirSync(join(ROOT, "docs", "artifacts"), { recursive: true });
  writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${outPath}`);
}

void main();
