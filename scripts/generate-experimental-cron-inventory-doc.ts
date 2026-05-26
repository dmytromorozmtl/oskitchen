/**
 * Regenerate docs/EXPERIMENTAL_CRON_INVENTORY.md from disk + production manifest.
 *
 *   npx tsx scripts/generate-experimental-cron-inventory-doc.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  listCronRouteSlugsFromDisk,
  partitionCronRouteSlugs,
} from "@/services/cron/cron-route-inventory";
import { ALLOWED_PRODUCTION_CRON_SLUGS } from "@/services/cron/production-manifest";

type Category = { id: string; title: string; match: (slug: string) => boolean; purpose: string };

const CATEGORIES: Category[] = [
  {
    id: "storefront-experiments",
    title: "Storefront experiments",
    match: (s) => s.startsWith("storefront-experiment"),
    purpose: "Theme/A-B experiment lifecycle, SRM, holdout, edge sync helpers.",
  },
  {
    id: "compliance-scaffold",
    title: "Regulatory / compliance scaffold",
    match: (s) =>
      /^(soc2|fedramp|iso|pci|hipaa|eu-ai|nist|cmmc|irap|gdpr|ccpa|sox|ferpa|csa|tisax|ens|dpa|appi)-/.test(s),
    purpose: "Compliance automation stubs — gated; not a certified control plane.",
  },
  {
    id: "research-scaffold",
    title: "Research / novelty scaffold",
    match: (s) =>
      /^(hypergraph|multiverse|omniverse|organoid|dtn|martian|galactic|brainstem|thalamus|basal|arctic|antarctic|cen-cenelec)/.test(
        s,
      ),
    purpose: "Experimental research cron hooks — no product SLA.",
  },
  {
    id: "ops-wiring",
    title: "Ops phase wiring",
    match: (s) => s.startsWith("phase-") && s.endsWith("-prod-wiring"),
    purpose: "One-off production wiring / evidence collection for ops phases.",
  },
  {
    id: "other",
    title: "Other experimental",
    match: () => true,
    purpose: "Misc experimental sync / scaffold routes.",
  },
];

function categorize(slug: string): Category {
  for (const c of CATEGORIES) {
    if (c.id !== "other" && c.match(slug)) return c;
  }
  return CATEGORIES[CATEGORIES.length - 1]!;
}

function main() {
  const slugs = listCronRouteSlugsFromDisk();
  const partition = partitionCronRouteSlugs(slugs);
  const byCategory = new Map<string, string[]>();

  for (const slug of partition.experimental) {
    const cat = categorize(slug);
    const list = byCategory.get(cat.id) ?? [];
    list.push(slug);
    byCategory.set(cat.id, list);
  }

  const lines: string[] = [
    "# Experimental cron inventory",
    "",
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "| Metric | Value |",
    "|--------|------:|",
    `| Total cron routes on disk | ${slugs.length} |`,
    `| Production allowlist | ${ALLOWED_PRODUCTION_CRON_SLUGS.length} |`,
    `| Experimental (active) | ${partition.experimental.length} |`,
    "",
    "Production slugs are defined in `services/cron/production-manifest.ts` and documented in `docs/CRON_INVENTORY.md`.",
    "",
    "Experimental routes return **404** in production unless `ENABLE_EXPERIMENTAL_CRONS=true`.",
    "Discovery: `listExperimentalCronPathsOnDisk()` in `services/cron/cron-route-inventory.ts`.",
    "",
    "## Categories",
    "",
  ];

  for (const cat of CATEGORIES) {
    const items = (byCategory.get(cat.id) ?? []).sort();
    if (items.length === 0) continue;
    lines.push(`### ${cat.title} (${items.length})`, "", cat.purpose, "", "| Slug | Path |", "|------|------|");
    for (const slug of items) {
      lines.push(`| \`${slug}\` | \`/api/cron/${slug}\` |`);
    }
    lines.push("");
  }

  lines.push("## Maintenance", "", "- Regenerate: `npx tsx scripts/generate-experimental-cron-inventory-doc.ts`", "- Validate: `npm run validate:cron-inventory`", "- Archive: `docs/CRON_ARCHIVE_RUNBOOK.md`", "");

  const out = join(process.cwd(), "docs/EXPERIMENTAL_CRON_INVENTORY.md");
  writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`Wrote ${out} (${partition.experimental.length} experimental slugs)`);
}

main();
