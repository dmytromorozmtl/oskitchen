import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  REMOVE_SERIES_A_ALLOWLIST_PATTERNS,
  REMOVE_SERIES_A_EXTERNAL_SURFACES,
  REMOVE_SERIES_A_FORBIDDEN_PHRASES,
} from "@/lib/pm/remove-series-a-p3-130-policy";

export type SeriesAReferenceScanResult = {
  surfaceId: string;
  path: string;
  clean: boolean;
  violations: string[];
};

export function scanSurfaceForSeriesAViolations(
  source: string,
  surfacePath: string,
  surfaceId: string,
): SeriesAReferenceScanResult {
  const violations: string[] = [];
  const lines = source.split("\n");

  for (const phrase of REMOVE_SERIES_A_FORBIDDEN_PHRASES) {
    for (const line of lines) {
      if (!line.toLowerCase().includes(phrase)) {
        continue;
      }
      if (/forbidden/i.test(line)) {
        continue;
      }
      if (/series-a-hold-notice/i.test(line)) {
        continue;
      }
      const allowed = REMOVE_SERIES_A_ALLOWLIST_PATTERNS.some((pattern) => pattern.test(line));
      if (!allowed) {
        violations.push(phrase);
      }
    }
  }

  for (const line of lines) {
    if (!/\bseries a\b/i.test(line)) {
      continue;
    }
    if (/forbidden/i.test(line)) {
      continue;
    }
    if (/series-a-hold-notice/i.test(line)) {
      continue;
    }
    const allowed = REMOVE_SERIES_A_ALLOWLIST_PATTERNS.some((pattern) => pattern.test(line));
    if (!allowed) {
      violations.push(`bare Series A: ${line.trim().slice(0, 80)}`);
    }
  }

  return {
    surfaceId,
    path: surfacePath,
    clean: violations.length === 0,
    violations: [...new Set(violations)],
  };
}

export function auditExternalSeriesAReferences(root = process.cwd()): {
  results: SeriesAReferenceScanResult[];
  allClean: boolean;
} {
  const results = REMOVE_SERIES_A_EXTERNAL_SURFACES.map((surface) => {
    const fullPath = join(root, surface.path);
    if (!existsSync(fullPath)) {
      return {
        surfaceId: surface.id,
        path: surface.path,
        clean: false,
        violations: ["missing surface file"],
      };
    }
    const source = readFileSync(fullPath, "utf8");
    return scanSurfaceForSeriesAViolations(source, surface.path, surface.id);
  });

  return {
    results,
    allClean: results.every((result) => result.clean),
  };
}

export type SeriesAReferenceAuditArtifact = {
  version: string;
  policyId: string;
  auditedAt: string;
  holdDoc: string;
  externalSurfaceCount: number;
  allClean: boolean;
  surfaces: SeriesAReferenceScanResult[];
};

export function buildSeriesAReferenceAuditArtifact(
  root = process.cwd(),
): SeriesAReferenceAuditArtifact {
  const audit = auditExternalSeriesAReferences(root);
  return {
    version: "series-a-reference-audit-p3-130-v1",
    policyId: "remove-series-a-p3-130-v1",
    auditedAt: new Date().toISOString(),
    holdDoc: "docs/series-a-hold-notice.md",
    externalSurfaceCount: REMOVE_SERIES_A_EXTERNAL_SURFACES.length,
    allClean: audit.allClean,
    surfaces: audit.results,
  };
}

export function loadSeriesAReferenceAuditArtifact(
  root = process.cwd(),
  artifactPath = "artifacts/series-a-reference-audit.json",
): SeriesAReferenceAuditArtifact {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as SeriesAReferenceAuditArtifact;
}

export function validateSeriesAReferenceAuditArtifact(
  artifact: SeriesAReferenceAuditArtifact,
): boolean {
  return (
    artifact.policyId === "remove-series-a-p3-130-v1" &&
    artifact.allClean === true &&
    artifact.surfaces.length === REMOVE_SERIES_A_EXTERNAL_SURFACES.length &&
    artifact.surfaces.every((surface) => surface.clean)
  );
}
