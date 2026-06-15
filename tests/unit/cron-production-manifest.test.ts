import { describe, expect, it } from "vitest";

import {
  ALLOWED_PRODUCTION_CRON_SLUGS,
  ALLOWED_PRODUCTION_CRON_PATHS,
  CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS,
  buildProductionCronEntries,
  cronSlugFromPathname,
  isAllowedProductionCronSlug,
  isExperimentalCronSlug,
  listExperimentalCronPathsOnDisk,
} from "@/services/cron/production-manifest";
import { partitionCronRouteSlugs } from "@/services/cron/cron-route-inventory";

describe("cron production manifest", () => {
  it("parses cron slug from pathname", () => {
    expect(cronSlugFromPathname("/api/cron/webhook-jobs")).toBe("webhook-jobs");
    expect(cronSlugFromPathname("/api/cron/")).toBeNull();
  });

  it("classifies production vs experimental slugs", () => {
    expect(isAllowedProductionCronSlug("webhook-jobs")).toBe(true);
    expect(isExperimentalCronSlug("multiverse-causality-lock-crdt-sync")).toBe(true);
    expect(ALLOWED_PRODUCTION_CRON_SLUGS).toContain("storefront-edge-sync");
  });

  it("builds one Vercel entry per allowlisted slug", () => {
    const entries = buildProductionCronEntries();
    expect(entries).toHaveLength(ALLOWED_PRODUCTION_CRON_SLUGS.length);
    expect(entries.every((e) => e.path.startsWith("/api/cron/") && e.schedule.length > 0)).toBe(true);
  });

  it("tracks only fast production crons for readiness evidence", () => {
    expect(CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS).toEqual(
      expect.arrayContaining(["webhook-jobs", "storefront-edge-sync", "doordash-sync"]),
    );
    expect(CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS).not.toContain("reminders");
  });

  it("lists experimental paths disjoint from production allowlist", () => {
    const experimental = listExperimentalCronPathsOnDisk();
    const partition = partitionCronRouteSlugs();
    for (const path of experimental) {
      expect(path.startsWith("/api/cron/")).toBe(true);
      expect(ALLOWED_PRODUCTION_CRON_PATHS).not.toContain(path);
    }
    // Every on-disk cron route.ts folder is production-tier today; experimental inventory may be empty.
    expect(partition.production.length).toBeGreaterThan(0);
    expect(experimental.every((path) => !ALLOWED_PRODUCTION_CRON_PATHS.includes(path))).toBe(true);
  });
});
