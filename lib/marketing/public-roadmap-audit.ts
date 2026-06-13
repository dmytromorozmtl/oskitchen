import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PUBLIC_ROADMAP_META,
  PUBLIC_ROADMAP_PATH,
  PUBLIC_ROADMAP_REQUIRED_SECTIONS,
  PUBLIC_ROADMAP_TEST_ID,
} from "@/lib/marketing/public-roadmap-content";

export type PublicRoadmapAudit = {
  ok: boolean;
  failures: string[];
};

export function auditPublicRoadmapWiring(root = process.cwd()): PublicRoadmapAudit {
  const failures: string[] = [];
  const paths = [
    "app/roadmap/page.tsx",
    "components/marketing/public-roadmap-page.tsx",
    "lib/marketing/public-roadmap-content.ts",
  ];

  for (const rel of paths) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const pageSource = readFileSync(join(root, "components/marketing/public-roadmap-page.tsx"), "utf8");
  const contentSource = readFileSync(join(root, "lib/marketing/public-roadmap-content.ts"), "utf8");
  const routeSource = readFileSync(join(root, "app/roadmap/page.tsx"), "utf8");
  const combinedSource = `${pageSource}\n${contentSource}`;

  for (const section of PUBLIC_ROADMAP_REQUIRED_SECTIONS) {
    if (!combinedSource.includes(section)) {
      failures.push(`roadmap wiring missing section marker: ${section}`);
    }
  }

  if (!pageSource.includes(PUBLIC_ROADMAP_TEST_ID)) {
    failures.push(`roadmap page missing test id: ${PUBLIC_ROADMAP_TEST_ID}`);
  }

  if (!contentSource.includes(PUBLIC_ROADMAP_PATH)) {
    failures.push("content missing roadmap path constant");
  }

  if (!contentSource.includes(PUBLIC_ROADMAP_META.utmCampaign)) {
    failures.push("content missing utm campaign");
  }

  if (!routeSource.includes("PublicRoadmapPage")) {
    failures.push("route missing PublicRoadmapPage component");
  }

  if (!pageSource.includes("PUBLIC_ROADMAP_QUARTERS")) {
    failures.push("roadmap page must render PUBLIC_ROADMAP_QUARTERS");
  }

  if (!pageSource.includes("PUBLIC_ROADMAP_OUT_OF_SCOPE")) {
    failures.push("roadmap page must render out-of-scope section");
  }

  return { ok: failures.length === 0, failures };
}
