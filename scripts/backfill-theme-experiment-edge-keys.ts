#!/usr/bin/env tsx
/**
 * Agency scale: re-sync experiments to Edge Config keys theme-exp:{workspaceId}:{slug}.
 * Run after setting workspaceId on storefront_settings (dry-run by default).
 *
 *   npx tsx scripts/backfill-theme-experiment-edge-keys.ts
 *   npx tsx scripts/backfill-theme-experiment-edge-keys.ts --apply
 */

import { prisma } from "@/lib/prisma";
import { edgeConfigKeyForStore } from "@/lib/storefront/theme-experiment-edge-config";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import { enqueueThemeExperimentEdgeSync } from "@/services/storefront/storefront-edge-sync-job-service";

const apply = process.argv.includes("--apply");

async function main() {
  const rows = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: {
      id: true,
      storeSlug: true,
      workspaceId: true,
      themeExperimentJson: true,
    },
  });

  const plan = rows
    .map((sf) => {
      const exp = parseThemeExperimentConfig(sf.themeExperimentJson);
      const newKey = edgeConfigKeyForStore(sf.storeSlug, sf.workspaceId);
      const legacyKey = edgeConfigKeyForStore(sf.storeSlug);
      return {
        storeSlug: sf.storeSlug,
        workspaceId: sf.workspaceId,
        experimentEnabled: exp?.enabled === true,
        legacyKey,
        newKey,
        needsMigration: Boolean(sf.workspaceId && legacyKey !== newKey),
      };
    })
    .filter((p) => p.needsMigration || p.experimentEnabled);

  console.log(JSON.stringify({ apply, count: plan.length, plan }, null, 2));

  if (!apply) {
    console.error("\nDry run only. Re-run with --apply to enqueue edge sync jobs.");
    return;
  }

  for (const p of plan) {
    const sf = rows.find((r) => r.storeSlug === p.storeSlug);
    if (!sf) continue;
    await enqueueThemeExperimentEdgeSync({
      storefrontId: sf.id,
      storeSlug: sf.storeSlug,
      themeExperimentJson: sf.themeExperimentJson,
    });
  }

  console.log(JSON.stringify({ ok: true, enqueued: plan.length }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
