/**
 * Static audit — webhook route signature verification in source code.
 * Complements lib/security/webhook-security-matrix.ts (policy classification).
 *
 * Usage: tsx scripts/audit-webhook-signatures.ts [--write]
 * Output: artifacts/webhook-signature-audit.json
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import {
  WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT,
  buildWebhookSecurityMatrix,
  listWebhookRouteFiles,
  routeFileToApiPath,
  type WebhookSecurityMatrixEntry,
} from "../lib/security/webhook-security-matrix";

export const WEBHOOK_SIGNATURE_AUDIT_ARTIFACT =
  "artifacts/webhook-signature-audit.json" as const;

export const WEBHOOK_SIGNATURE_AUDIT_POLICY_ID = "webhook-signature-static-audit-v1" as const;

/** Verification signals detected in route or resolved handler source. */
export const WEBHOOK_SIGNATURE_DETECTORS = [
  { id: "stripe_construct_event", pattern: /\bconstructEvent\s*\(/ },
  { id: "require_bearer_webhook_secret", pattern: /\brequireBearerWebhookSecret\s*\(/ },
  { id: "require_configured_webhook_secret", pattern: /\brequireConfiguredWebhookSecret\s*\(/ },
  { id: "verify_resend_hmac", pattern: /\bverifyResendWebhookSignature\s*\(/ },
  { id: "verify_woocommerce_hmac", pattern: /\bverifyWebhookSignature\s*\(/ },
  { id: "verify_shopify_hmac", pattern: /\bverifyShopifyHmac\s*\(/ },
  { id: "verify_uber_eats_hmac", pattern: /\bverifyUberEatsWebhookSignature\s*\(/ },
  { id: "verify_doordash_hmac", pattern: /\bverifyDoorDashWebhookSignature\s*\(/ },
  { id: "verify_grubhub_hmac", pattern: /\bverifyGrubhubWebhookSignature\s*\(/ },
  { id: "verify_capital_lender_hmac", pattern: /\bverifyCapitalLenderWebhookSignature\s*\(/ },
  { id: "verify_slack_signature", pattern: /\bverifySlackRequestSignature\s*\(/ },
  { id: "woocommerce_handler", pattern: /\bhandleWooCommerceWebhook\s*\(/ },
  { id: "shopify_handler", pattern: /\bhandleShopifyWebhook\s*\(/ },
  { id: "uber_direct_handler", pattern: /\bhandleUberDirectWebhook\s*\(/ },
  { id: "slack_handler", pattern: /\bhandleSlackExperimentInteractiveWebhook\s*\(/ },
  { id: "scim_bearer_provision", pattern: /\bprovisionExperimentAuditorFromScim\s*\(/ },
] as const;

const HANDLER_IMPORT_RE =
  /import\s*\{[^}]*\b(\w+)\s*\}\s*from\s*["']@\/lib\/webhooks\/([^"']+)["']/;

export type WebhookSignatureAuditRow = {
  apiPath: string;
  routeFile: string;
  handlerFiles: string[];
  detectedSignals: string[];
  signatureVerifiedInCode: boolean;
  matrixSignatureKind: string;
  matrixSignatureValidated: boolean;
  matrixRiskTier: string;
  codeMatchesMatrix: boolean;
  notes: string | null;
};

export type WebhookSignatureAuditReport = {
  version: typeof WEBHOOK_SIGNATURE_AUDIT_POLICY_ID;
  generatedAt: string;
  expectedRouteCount: number;
  totalRoutes: number;
  verifiedCount: number;
  missingVerificationCount: number;
  matrixMismatchCount: number;
  overall: "PASSED" | "FAILED";
  honestyNote: string;
  missingVerification: WebhookSignatureAuditRow[];
  matrixMismatches: WebhookSignatureAuditRow[];
  routes: WebhookSignatureAuditRow[];
};

function readSource(root: string, relPath: string): string {
  const full = join(root, relPath);
  if (!existsSync(full)) return "";
  return readFileSync(full, "utf8");
}

function resolveHandlerFiles(root: string, routeSource: string): string[] {
  const handlers: string[] = [];
  const match = routeSource.match(HANDLER_IMPORT_RE);
  if (!match) return handlers;

  const handlerModule = match[2].replace(/\.ts$/, "");
  const candidates = [
    `lib/webhooks/${handlerModule}.ts`,
    `lib/webhooks/${handlerModule}-handler.ts`,
  ];
  for (const candidate of candidates) {
    if (existsSync(join(root, candidate))) {
      handlers.push(candidate);
      break;
    }
  }
  return handlers;
}

function detectSignals(source: string): string[] {
  const found: string[] = [];
  for (const detector of WEBHOOK_SIGNATURE_DETECTORS) {
    if (detector.pattern.test(source)) {
      found.push(detector.id);
    }
  }
  return found;
}

function auditRoute(
  root: string,
  routeFile: string,
  matrixEntry: WebhookSecurityMatrixEntry,
): WebhookSignatureAuditRow {
  const routeSource = readSource(root, routeFile);
  const handlerFiles = resolveHandlerFiles(root, routeSource);
  const handlerSources = handlerFiles.map((f) => readSource(root, f)).join("\n");
  const combinedSource = `${routeSource}\n${handlerSources}`;

  const detectedSignals = detectSignals(combinedSource);
  const signatureVerifiedInCode = detectedSignals.length > 0;
  const codeMatchesMatrix =
    signatureVerifiedInCode === matrixEntry.signatureValidated;

  let notes: string | null = null;
  if (handlerFiles.length > 0 && detectedSignals.length > 0 && !detectSignals(routeSource).length) {
    notes = `Verification delegated to ${handlerFiles.join(", ")}`;
  }
  if (!signatureVerifiedInCode) {
    notes = "No signature verification pattern detected in route or handler";
  }

  return {
    apiPath: routeFileToApiPath(routeFile),
    routeFile,
    handlerFiles,
    detectedSignals,
    signatureVerifiedInCode,
    matrixSignatureKind: matrixEntry.signatureKind,
    matrixSignatureValidated: matrixEntry.signatureValidated,
    matrixRiskTier: matrixEntry.riskTier,
    codeMatchesMatrix,
    notes,
  };
}

export function buildWebhookSignatureAuditReport(root = process.cwd()): WebhookSignatureAuditReport {
  const matrixEntries = buildWebhookSecurityMatrix(root);
  const routeFiles = listWebhookRouteFiles(root);

  const matrixByPath = new Map(matrixEntries.map((e) => [e.routePath, e]));

  const routes = routeFiles.map((routeFile) => {
    const entry = matrixByPath.get(routeFile);
    if (!entry) {
      throw new Error(`Missing matrix entry for ${routeFile}`);
    }
    return auditRoute(root, routeFile, entry);
  });

  const missingVerification = routes.filter((r) => !r.signatureVerifiedInCode);
  const matrixMismatches = routes.filter((r) => !r.codeMatchesMatrix);
  const verifiedCount = routes.filter((r) => r.signatureVerifiedInCode).length;

  const overall =
    routes.length === WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT &&
    missingVerification.length === 0 &&
    matrixMismatches.length === 0
      ? "PASSED"
      : "FAILED";

  return {
    version: WEBHOOK_SIGNATURE_AUDIT_POLICY_ID,
    generatedAt: new Date().toISOString(),
    expectedRouteCount: WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT,
    totalRoutes: routes.length,
    verifiedCount,
    missingVerificationCount: missingVerification.length,
    matrixMismatchCount: matrixMismatches.length,
    overall,
    honestyNote:
      "Static source scan only — does not replace live penetration testing or provider replay drills.",
    missingVerification,
    matrixMismatches,
    routes,
  };
}

function main() {
  const root = process.cwd();
  const report = buildWebhookSignatureAuditReport(root);
  const shouldWrite = process.argv.includes("--write") || process.argv.includes("-w");

  console.log(`\nWebhook signature audit (${report.version})\n`);
  console.log(
    `Routes: ${report.totalRoutes}/${report.expectedRouteCount} | verified in code: ${report.verifiedCount} | overall: ${report.overall}`,
  );

  if (report.missingVerification.length > 0) {
    console.log("\nMissing verification:");
    for (const row of report.missingVerification) {
      console.log(`  - ${row.apiPath} (${row.routeFile})`);
    }
  }

  if (report.matrixMismatches.length > 0) {
    console.log("\nMatrix mismatches:");
    for (const row of report.matrixMismatches) {
      console.log(`  - ${row.apiPath}: code=${row.signatureVerifiedInCode} matrix=${row.matrixSignatureValidated}`);
    }
  }

  if (shouldWrite) {
    const artifactPath = join(root, WEBHOOK_SIGNATURE_AUDIT_ARTIFACT);
    mkdirSync(dirname(artifactPath), { recursive: true });
    writeFileSync(artifactPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`\nArtifact: ${relative(root, artifactPath)}\n`);
  }

  if (report.overall !== "PASSED") {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
