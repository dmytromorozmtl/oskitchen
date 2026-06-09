/**
 * Force-read disk-backed vitest paths before the suite runs.
 * On iCloud Desktop, readdir can succeed while route files are evicted — causing
 * deploy-gate flakes (~53 failures: webhooks 58/59, cron archive ENOENT, wiring audits).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { CRITICAL_DASHBOARD_ERROR_ROUTES } from "@/lib/testing/dashboard-error-boundary-policy";
import { WEBHOOK_EXTENDED_INGRESS_ROUTE_FILES } from "@/lib/security/webhook-ingress-extended";
import { listWebhookRouteFiles } from "@/lib/security/webhook-security-matrix";
import { readCronArchiveManifest } from "@/services/cron/cron-archive";
import { ALLOWED_PRODUCTION_CRON_SLUGS } from "@/services/cron/production-manifest";

const EXTRA_WIRING_PATHS = [
  "app/api/internal/dsr/export/route.ts",
  "app/dashboard/settings/referrals/page.tsx",
  "app/dashboard/enterprise/commissary/page.tsx",
  "config/cron-archive-manifest.json",
] as const;

function collectPaths(root: string): string[] {
  const manifest = readCronArchiveManifest();
  const archiveRoot = manifest.archiveRoot.replace(/\\/g, "/");

  return [
    ...listWebhookRouteFiles(root),
    ...WEBHOOK_EXTENDED_INGRESS_ROUTE_FILES,
    ...ALLOWED_PRODUCTION_CRON_SLUGS.map((slug) => `app/api/cron/${slug}/route.ts`),
    ...CRITICAL_DASHBOARD_ERROR_ROUTES,
    ...manifest.slugs.map((slug) => `${archiveRoot}/${slug}/route.ts`),
    ...EXTRA_WIRING_PATHS,
  ];
}

export function materializeVitestDiskPaths(root = process.cwd()): number {
  const paths = [...new Set(collectPaths(root))];
  const missing: string[] = [];

  for (const rel of paths) {
    const abs = join(root, rel);
    if (!existsSync(abs)) {
      missing.push(rel);
      continue;
    }
    try {
      readFileSync(abs);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "read failed";
      missing.push(`${rel} (${detail})`);
    }
  }

  if (missing.length > 0) {
    const preview = missing.slice(0, 20).join("\n  ");
    const suffix = missing.length > 20 ? `\n  ... and ${missing.length - 20} more` : "";
    throw new Error(
      `[materialize-vitest-disk-paths] ${missing.length} path(s) unavailable — wait for iCloud sync or move repo off Desktop:\n  ${preview}${suffix}`,
    );
  }

  return paths.length;
}

export default function vitestGlobalSetup(): void {
  const count = materializeVitestDiskPaths();
  console.log(`[materialize-vitest-disk-paths] OK — ${count} paths materialized`);
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  process.argv[1].includes("materialize-vitest-disk-paths");

if (isDirectRun) {
  vitestGlobalSetup();
}
