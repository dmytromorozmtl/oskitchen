import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditPublicRoadmapWiring } from "@/lib/marketing/public-roadmap-audit";
import {
  PUBLIC_ROADMAP_P3_69_CANONICAL_PATH,
  publicRoadmapPathsAligned,
} from "@/lib/marketing/public-roadmap-p3-69-policy";

export type PublicRoadmapContractValidation = {
  passed: boolean;
  pathsAligned: boolean;
  sitemapWired: boolean;
  upstreamDocOk: boolean;
  wiringOk: boolean;
  failures: string[];
};

export function validatePublicRoadmapContract(
  root = process.cwd(),
): PublicRoadmapContractValidation {
  const failures: string[] = [];

  if (!publicRoadmapPathsAligned()) {
    failures.push("public roadmap path constants are not aligned to /roadmap");
  }

  let sitemapWired = false;
  const sitemapPath = join(root, "lib/marketing/sitemap-urls.ts");
  if (!existsSync(sitemapPath)) {
    failures.push("missing sitemap-urls.ts");
  } else {
    const source = readFileSync(sitemapPath, "utf8");
    sitemapWired = source.includes(PUBLIC_ROADMAP_P3_69_CANONICAL_PATH);
    if (!sitemapWired) {
      failures.push(`${PUBLIC_ROADMAP_P3_69_CANONICAL_PATH} missing from sitemap-urls.ts`);
    }
  }

  const wiring = auditPublicRoadmapWiring(root);
  if (!wiring.ok) {
    failures.push(...wiring.failures);
  }

  let upstreamDocOk = false;
  const upstreamPath = join(root, "docs/PRODUCT_ROADMAP_2026.md");
  if (!existsSync(upstreamPath)) {
    failures.push("missing upstream doc: docs/PRODUCT_ROADMAP_2026.md");
  } else {
    const upstream = readFileSync(upstreamPath, "utf8");
    upstreamDocOk =
      upstream.includes("Quarterly roadmap") &&
      upstream.includes("Q2 2026") &&
      upstream.includes("Explicitly out of scope");
    if (!upstreamDocOk) {
      failures.push("PRODUCT_ROADMAP_2026.md missing quarterly roadmap sections");
    }
  }

  return {
    passed: failures.length === 0 && publicRoadmapPathsAligned() && wiring.ok && upstreamDocOk,
    pathsAligned: publicRoadmapPathsAligned(),
    sitemapWired,
    upstreamDocOk,
    wiringOk: wiring.ok,
    failures,
  };
}
