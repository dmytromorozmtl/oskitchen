#!/usr/bin/env npx tsx
/**
 * Staging smoke for roadmap steps A–C (edge experiment 5C).
 *
 * Usage:
 *   STOREFRONT_SMOKE_SLUG=your-store npx tsx scripts/staging-edge-experiment-smoke.ts
 *   STOREFRONT_SMOKE_SLUG=your-store npx tsx scripts/staging-edge-experiment-smoke.ts --check-publish-gate
 */
import { PrismaClient } from "@prisma/client";

import { getThemeExperimentVersion } from "../lib/storefront/theme-experiment-version";
import { edgeVersionMatchesExpected } from "../lib/storefront/theme-experiment-edge-verify";
import { parseThemeExperimentConfig } from "../lib/storefront/theme-experiment";
import { countBlockingEdgeSyncJobs } from "../services/storefront/storefront-edge-sync-job-service";
import { readEdgeExperimentVersion } from "../services/storefront/theme-experiment-edge-sync";
import { evaluateExperimentCdnPurgeGate } from "../lib/storefront/theme-experiment-cdn-gate";

const prisma = new PrismaClient();

async function main() {
  const slug = process.env.STOREFRONT_SMOKE_SLUG?.trim();
  if (!slug) {
    console.error("Set STOREFRONT_SMOKE_SLUG to your storefront slug.");
    process.exit(1);
  }

  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug: slug },
    select: {
      id: true,
      storeSlug: true,
      themeExperimentJson: true,
      themePublishedAt: true,
    },
  });
  if (!sf) {
    console.error(`Storefront not found for slug: ${slug}`);
    process.exit(1);
  }

  const dbVersion = getThemeExperimentVersion(sf.themeExperimentJson);
  const enabled = parseThemeExperimentConfig(sf.themeExperimentJson)?.enabled === true;
  const edgeVersion = await readEdgeExperimentVersion(sf.storeSlug);
  const match = edgeVersionMatchesExpected({
    experimentEnabled: enabled,
    expectedVersion: dbVersion,
    edgeVersion,
  });

  console.log("\n=== A) Migrate + version parity ===");
  console.log(`  DB version:        ${dbVersion}`);
  console.log(`  Edge version:      ${edgeVersion ?? "null"}`);
  console.log(`  Experiment enabled: ${enabled}`);
  console.log(`  Versions match:    ${match ? "YES ✓" : "NO ✗"}`);
  if (!match) {
    console.log("  → Save experiment on Advanced or wait for edge-sync cron.");
  }

  const blocking = await countBlockingEdgeSyncJobs(sf.id);
  console.log("\n=== B) Publish gate ===");
  console.log(`  Blocking jobs (QUEUED/PROCESSING): ${blocking}`);
  if (process.argv.includes("--check-publish-gate")) {
    if (blocking > 0) {
      console.log("  ✓ Publish would be BLOCKED (expected right after save).");
    } else {
      console.log("  ✗ No blocking jobs — publish would proceed.");
    }
  } else {
    console.log("  Run with --check-publish-gate immediately after Save experiment.");
  }

  const gate = await evaluateExperimentCdnPurgeGate({
    storeSlug: sf.storeSlug,
    themeExperimentJson: sf.themeExperimentJson,
  });
  console.log("\n=== C) CDN gate ===");
  console.log(`  skipArmTags:    ${gate.skipArmTags}`);
  console.log(`  versionsMatch:  ${gate.versionsMatch}`);
  console.log(`  arm tag count:  ${gate.armTags.length}`);
  if (gate.skipArmTags) {
    console.log("  ✓ Arm CDN tags would be SKIPPED (stale edge — expected for smoke C).");
  } else {
    console.log("  Arm tags would be purged:", gate.armTags.join(", "));
  }

  console.log("\n=== Manual follow-ups ===");
  console.log("  D–F: Advanced ?days=7|30, CSV export, GA4 compare (ops).");
  console.log("  G: Set STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL for Slack on DEAD jobs.");
  console.log("  H: ./scripts/sprint5-commit-pr.sh when git is initialized.\n");

  await prisma.$disconnect();
  process.exit(match && !gate.skipArmTags ? 0 : match ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
