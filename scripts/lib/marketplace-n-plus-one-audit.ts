import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export const MARKETPLACE_N_PLUS_ONE_AUDIT_ARTIFACT =
  "artifacts/marketplace-n-plus-one-audit.json" as const;

export const MARKETPLACE_N_PLUS_ONE_AUDIT_POLICY_ID =
  "marketplace-n-plus-one-audit-v1" as const;

export const MARKETPLACE_SERVICE_ROOT = "services/marketplace" as const;

/** Hot marketplace paths — zero high-severity loop findings expected before GA. */
export const MARKETPLACE_HOT_PATH_FILES = [
  "services/marketplace/marketplace-catalog-service.ts",
  "services/marketplace/cart-service.ts",
  "services/marketplace/checkout-service.ts",
  "services/marketplace/marketplace-orders-service.ts",
  "services/marketplace/marketplace-product-detail-service.ts",
] as const;

export type MarketplaceNPlusOnePattern =
  | "for_await_prisma"
  | "map_async_prisma"
  | "for_await_marketplace_db";

export type MarketplaceNPlusOneFinding = {
  file: string;
  line: number;
  pattern: MarketplaceNPlusOnePattern;
  severity: "high" | "medium";
  snippet: string;
  recommendation: string;
};

export type MarketplaceHotPathStatus = {
  file: string;
  highSeverityFindings: number;
  status: "PASS" | "ATTENTION";
};

export type MarketplaceNPlusOneAuditReport = {
  version: typeof MARKETPLACE_N_PLUS_ONE_AUDIT_POLICY_ID;
  generatedAt: string;
  scannedRoot: typeof MARKETPLACE_SERVICE_ROOT;
  scannedFiles: number;
  findings: MarketplaceNPlusOneFinding[];
  summary: {
    high: number;
    medium: number;
    byPattern: Record<MarketplaceNPlusOnePattern, number>;
  };
  hotPaths: MarketplaceHotPathStatus[];
  overall: "PASS" | "NEEDS_ATTENTION";
  recommendations: string[];
};

const MARKETPLACE_DB_AWAIT =
  /await\s+(?:prisma\.|clearCart|addToCart|checkoutMarketplaceCart|moderatePlatformProduct|moderatePlatformVendor|recordInventoryPurchase)\s*\(/;

const LOOP_LINE = /for\s*\(\s*(?:const|let|var|await)\s/;

function loopBodyWindow(lines: string[], startIndex: number): string {
  const chunks: string[] = [];
  let depth = 0;
  let started = false;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    chunks.push(line);

    for (const ch of line) {
      if (ch === "{") {
        depth += 1;
        started = true;
      } else if (ch === "}") {
        depth -= 1;
      }
    }

    if (started && depth <= 0) break;

    // Single-line for-without-braces: stop at next blank line or dedented statement.
    if (!started && i > startIndex) {
      if (line.trim() === "") break;
      if (/^\S/.test(line) || /^(export\s+)?(async\s+)?function\b/.test(line.trim())) break;
      if (/^\s{0,2}\}/.test(line)) break;
    }
  }

  return chunks.join("\n");
}

function listMarketplaceServiceFiles(root: string): string[] {
  const dir = join(root, MARKETPLACE_SERVICE_ROOT);
  if (!existsSync(dir)) return [];

  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isFile()) continue;
    if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out.sort();
}

function recommendationFor(pattern: MarketplaceNPlusOnePattern): string {
  switch (pattern) {
    case "for_await_prisma":
      return "Batch with findMany + Map, or use Prisma include/select in one query.";
    case "map_async_prisma":
      return "Replace map(async) over rows with a single query or transaction batch.";
    case "for_await_marketplace_db":
      return "Collapse marketplace service calls in loops — batch cart/checkout/moderation writes.";
    default:
      return "Review loop for query amplification.";
  }
}

export function scanMarketplaceNPlusOne(
  files: string[],
  root: string,
): MarketplaceNPlusOneFinding[] {
  const findings: MarketplaceNPlusOneFinding[] = [];

  for (const file of files) {
    const rel = relative(root, file);
    const lines = readFileSync(file, "utf8").split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!LOOP_LINE.test(line)) continue;

      const window = loopBodyWindow(lines, i);

      if (/await\s+prisma\./.test(window)) {
        findings.push({
          file: rel,
          line: i + 1,
          pattern: "for_await_prisma",
          severity: "high",
          snippet: line.trim().slice(0, 140),
          recommendation: recommendationFor("for_await_prisma"),
        });
        continue;
      }

      if (MARKETPLACE_DB_AWAIT.test(window)) {
        findings.push({
          file: rel,
          line: i + 1,
          pattern: "for_await_marketplace_db",
          severity: "medium",
          snippet: line.trim().slice(0, 140),
          recommendation: recommendationFor("for_await_marketplace_db"),
        });
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!/\.map\s*\(\s*async/.test(line)) continue;
      const window = lines.slice(i, Math.min(i + 10, lines.length)).join("\n");
      if (!/prisma\./.test(window)) continue;
      findings.push({
        file: rel,
        line: i + 1,
        pattern: "map_async_prisma",
        severity: "medium",
        snippet: line.trim().slice(0, 140),
        recommendation: recommendationFor("map_async_prisma"),
      });
    }
  }

  return findings.sort(
    (a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.pattern.localeCompare(b.pattern),
  );
}

export function buildMarketplaceNPlusOneReport(root: string): MarketplaceNPlusOneAuditReport {
  const files = listMarketplaceServiceFiles(root);
  const findings = scanMarketplaceNPlusOne(files, root);

  const byPattern: Record<MarketplaceNPlusOnePattern, number> = {
    for_await_prisma: 0,
    map_async_prisma: 0,
    for_await_marketplace_db: 0,
  };

  let high = 0;
  let medium = 0;
  for (const finding of findings) {
    byPattern[finding.pattern] += 1;
    if (finding.severity === "high") high += 1;
    else medium += 1;
  }

  const hotPaths: MarketplaceHotPathStatus[] = MARKETPLACE_HOT_PATH_FILES.map((file) => {
    const highSeverityFindings = findings.filter(
      (f) => f.file === file && f.severity === "high",
    ).length;
    return {
      file,
      highSeverityFindings,
      status: highSeverityFindings === 0 ? "PASS" : "ATTENTION",
    };
  });

  const recommendations: string[] = [];
  if (high > 0) {
    recommendations.push(
      "Fix high-severity prisma-in-loop findings before marketplace pilot scale.",
    );
  }
  if (byPattern.for_await_marketplace_db > 0) {
    recommendations.push(
      "Batch bulk moderation and recurring-order cart writes (see recurring-orders + platform moderation services).",
    );
  }
  if (findings.some((f) => f.file.includes("inventory-integration-service"))) {
    recommendations.push(
      "inventory-integration-service: prefetch ingredients with findMany({ id: { in } }) on PO receive.",
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      "No marketplace N+1 heuristics flagged — re-run after new vendor/checkout features ship.",
    );
  }

  const hotPathAttention = hotPaths.some((p) => p.status === "ATTENTION");
  const overall =
    high > 0 || hotPathAttention ? ("NEEDS_ATTENTION" as const) : ("PASS" as const);

  return {
    version: MARKETPLACE_N_PLUS_ONE_AUDIT_POLICY_ID,
    generatedAt: new Date().toISOString(),
    scannedRoot: MARKETPLACE_SERVICE_ROOT,
    scannedFiles: files.length,
    findings,
    summary: { high, medium, byPattern },
    hotPaths,
    overall,
    recommendations,
  };
}
