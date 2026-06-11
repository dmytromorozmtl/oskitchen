import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  scanTextForForbiddenClaimMatches,
  summarizeForbiddenClaimsManualAudit,
  type ForbiddenClaimMatch,
} from "@/lib/governance/forbidden-claims-manual-audit-policy";

import {
  FORBIDDEN_CLAIMS_AUDIT_ARTIFACT,
  FORBIDDEN_CLAIMS_AUDIT_DOC,
  FORBIDDEN_CLAIMS_AUDIT_DOC_ROUTE_MARKERS,
  FORBIDDEN_CLAIMS_AUDIT_POLICY_ID,
  FORBIDDEN_CLAIMS_AUDIT_ROUTES,
  FORBIDDEN_CLAIMS_AUDIT_UPSTREAM_POLICY,
} from "@/lib/marketing/forbidden-claims-audit-policy";

export type ForbiddenClaimsRouteAudit = {
  route: string;
  pagePresent: boolean;
  honestyMarkerPresent: boolean;
  realClaimCount: number;
  passed: boolean;
};

export type ForbiddenClaimsAuditSummary = {
  policyId: typeof FORBIDDEN_CLAIMS_AUDIT_POLICY_ID;
  docPresent: boolean;
  artifactPresent: boolean;
  upstreamPolicyPresent: boolean;
  routes: ForbiddenClaimsRouteAudit[];
  totalRealClaims: number;
  passed: boolean;
};

function readModuleText(root: string, relPath: string): string {
  const full = join(root, relPath);
  if (!existsSync(full)) return "";
  return readFileSync(full, "utf8");
}

function collectRouteMatches(root: string, modules: readonly string[]): ForbiddenClaimMatch[] {
  const matches: ForbiddenClaimMatch[] = [];
  for (const modulePath of modules) {
    const text = readModuleText(root, modulePath);
    if (!text) continue;
    matches.push(...scanTextForForbiddenClaimMatches(text, modulePath));
  }
  return matches;
}

export function auditForbiddenClaimsMarketingPages(
  root = process.cwd(),
): ForbiddenClaimsAuditSummary {
  const docPresent = existsSync(join(root, FORBIDDEN_CLAIMS_AUDIT_DOC));
  const artifactPresent = existsSync(join(root, FORBIDDEN_CLAIMS_AUDIT_ARTIFACT));
  const upstreamPolicyPresent = existsSync(join(root, FORBIDDEN_CLAIMS_AUDIT_UPSTREAM_POLICY));

  let docRoutesOk = false;
  if (docPresent) {
    const docSource = readFileSync(join(root, FORBIDDEN_CLAIMS_AUDIT_DOC), "utf8");
    docRoutesOk = FORBIDDEN_CLAIMS_AUDIT_DOC_ROUTE_MARKERS.every((route) =>
      docSource.includes(route),
    );
  }

  const routes: ForbiddenClaimsRouteAudit[] = FORBIDDEN_CLAIMS_AUDIT_ROUTES.map((entry) => {
    const pagePresent = existsSync(join(root, entry.pageModule));
    const combinedText = entry.scanModules
      .map((modulePath) => readModuleText(root, modulePath))
      .join("\n");
    const honestyMarkerPresent = entry.honestyMarkers.some((marker) =>
      combinedText.includes(marker),
    );
    const matches = collectRouteMatches(root, entry.scanModules);
    const summary = summarizeForbiddenClaimsManualAudit(matches);
    const realClaimCount = summary.realClaimCount;

    return {
      route: entry.route,
      pagePresent,
      honestyMarkerPresent,
      realClaimCount,
      passed: pagePresent && honestyMarkerPresent && realClaimCount === 0,
    };
  });

  const totalRealClaims = routes.reduce((sum, route) => sum + route.realClaimCount, 0);
  const passed =
    docPresent &&
    docRoutesOk &&
    artifactPresent &&
    upstreamPolicyPresent &&
    routes.every((route) => route.passed) &&
    totalRealClaims === 0;

  return {
    policyId: FORBIDDEN_CLAIMS_AUDIT_POLICY_ID,
    docPresent,
    artifactPresent,
    upstreamPolicyPresent,
    routes,
    totalRealClaims,
    passed,
  };
}

export function formatForbiddenClaimsAuditLines(
  summary: ForbiddenClaimsAuditSummary,
): string[] {
  const lines = [
    `Forbidden claims audit (${summary.policyId})`,
    `Doc (${FORBIDDEN_CLAIMS_AUDIT_DOC}): ${summary.docPresent ? "yes" : "no"}`,
    `Artifact (${FORBIDDEN_CLAIMS_AUDIT_ARTIFACT}): ${summary.artifactPresent ? "yes" : "no"}`,
    `Upstream governance: ${summary.upstreamPolicyPresent ? "yes" : "no"}`,
  ];

  for (const route of summary.routes) {
    lines.push(
      `${route.route}: page=${route.pagePresent ? "yes" : "no"} honesty=${route.honestyMarkerPresent ? "yes" : "no"} realClaims=${route.realClaimCount}`,
    );
  }

  lines.push(`Total real claims: ${summary.totalRealClaims}`);
  lines.push(`Passed: ${summary.passed ? "YES" : "NO"}`);
  return lines;
}
