import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildExtendedWebhookIngressMatrix,
  listExtendedWebhookIngressRouteFiles,
} from "@/lib/security/webhook-ingress-extended";
import {
  buildWebhookSecurityMatrix,
  listWebhookRouteFiles,
  type WebhookReplayKind,
  type WebhookSecurityMatrixEntry,
} from "@/lib/security/webhook-security-matrix";
import {
  WEBHOOK_REPLAY_IDEMPOTENCY_DETECTORS,
  WEBHOOK_REPLAY_IDEMPOTENCY_E2E_POLICY_ID,
  WEBHOOK_REPLAY_IDEMPOTENCY_EXPECTED_ROUTE_COUNT,
} from "@/lib/qa/webhook-replay-idempotency-e2e-policy";

const HANDLER_IMPORT_RE =
  /import\s*\{[^}]*\b(\w+)\s*\}\s*from\s*["']@\/lib\/webhooks\/([^"']+)["']/;

export type WebhookReplayIdempotencyAuditRow = {
  apiPath: string;
  routeFile: string;
  replayProtection: WebhookReplayKind;
  riskTier: string;
  idempotencyWired: boolean;
  detectedSignals: string[];
  notes: string | null;
};

export type WebhookReplayIdempotencyAuditReport = {
  policyId: typeof WEBHOOK_REPLAY_IDEMPOTENCY_E2E_POLICY_ID;
  generatedAt: string;
  expectedRouteCount: number;
  totalRoutes: number;
  wiredCount: number;
  missingIdempotencyCount: number;
  commerceMissingReplayCount: number;
  overall: "PASSED" | "FAILED";
  missingIdempotency: WebhookReplayIdempotencyAuditRow[];
  routes: WebhookReplayIdempotencyAuditRow[];
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

function detectReplaySignals(
  source: string,
  replayProtection: WebhookReplayKind,
): string[] {
  if (replayProtection === "none") {
    return ["declared_none"];
  }

  const patterns = WEBHOOK_REPLAY_IDEMPOTENCY_DETECTORS[replayProtection];
  const found: string[] = [];
  for (const pattern of patterns) {
    if (pattern.test(source)) {
      found.push(pattern.source);
    }
  }
  return found;
}

function auditRoute(
  root: string,
  routeFile: string,
  matrixEntry: WebhookSecurityMatrixEntry,
): WebhookReplayIdempotencyAuditRow {
  const routeSource = readSource(root, routeFile);
  const handlerFiles = resolveHandlerFiles(root, routeSource);
  const handlerSources = handlerFiles.map((file) => readSource(root, file)).join("\n");
  const combinedSource = `${routeSource}\n${handlerSources}`;

  const detectedSignals = detectReplaySignals(combinedSource, matrixEntry.replayProtection);
  const idempotencyWired =
    matrixEntry.replayProtection === "none" ? true : detectedSignals.length > 0;

  let notes: string | null = null;
  if (matrixEntry.replayProtection === "none") {
    notes = "Replay protection explicitly none — signature-only ingress";
  } else if (
    handlerFiles.length > 0 &&
    !detectReplaySignals(routeSource, matrixEntry.replayProtection).length
  ) {
    notes = `Idempotency delegated to ${handlerFiles.join(", ")}`;
  }

  return {
    apiPath: matrixEntry.apiPath,
    routeFile,
    replayProtection: matrixEntry.replayProtection,
    riskTier: matrixEntry.riskTier,
    idempotencyWired,
    detectedSignals,
    notes,
  };
}

export function buildWebhookReplayIdempotencyAuditReport(
  root = process.cwd(),
): WebhookReplayIdempotencyAuditReport {
  const coreEntries = buildWebhookSecurityMatrix(root);
  const extendedEntries = buildExtendedWebhookIngressMatrix(root);
  const matrixEntries = [...coreEntries, ...extendedEntries];
  const routeFiles = [
    ...listWebhookRouteFiles(root),
    ...listExtendedWebhookIngressRouteFiles(root),
  ];

  const matrixByPath = new Map(matrixEntries.map((entry) => [entry.routePath, entry]));
  const routes = routeFiles.map((routeFile) => {
    const entry = matrixByPath.get(routeFile);
    if (!entry) {
      throw new Error(`Missing matrix entry for ${routeFile}`);
    }
    return auditRoute(root, routeFile, entry);
  });

  const missingIdempotency = routes.filter((row) => !row.idempotencyWired);
  const commerceMissingReplay = routes.filter(
    (row) =>
      row.replayProtection === "none" &&
      (row.riskTier === "P0" || row.riskTier === "P1") &&
      row.apiPath.includes("/webhooks/"),
  ).length;

  const wiredCount = routes.filter((row) => row.idempotencyWired).length;
  const overall =
    routes.length === WEBHOOK_REPLAY_IDEMPOTENCY_EXPECTED_ROUTE_COUNT &&
    missingIdempotency.length === 0 &&
    commerceMissingReplay === 0
      ? "PASSED"
      : "FAILED";

  return {
    policyId: WEBHOOK_REPLAY_IDEMPOTENCY_E2E_POLICY_ID,
    generatedAt: new Date().toISOString(),
    expectedRouteCount: WEBHOOK_REPLAY_IDEMPOTENCY_EXPECTED_ROUTE_COUNT,
    totalRoutes: routes.length,
    wiredCount,
    missingIdempotencyCount: missingIdempotency.length,
    commerceMissingReplayCount: commerceMissingReplay,
    overall,
    missingIdempotency,
    routes,
  };
}

export type WebhookReplayIdempotencyE2EAuditSummary = {
  policyId: typeof WEBHOOK_REPLAY_IDEMPOTENCY_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  webhookEventStoreWired: boolean;
  ingressReplayGuardWired: boolean;
  matrixRouteCount: number;
  auditPassed: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditWebhookReplayIdempotencyE2E(
  root = process.cwd(),
): WebhookReplayIdempotencyE2EAuditSummary {
  const specPath = join(root, "e2e/webhook-replay-idempotency.spec.ts");
  const flowPath = join(root, "e2e/helpers/webhook-replay-idempotency-flow.ts");
  const readyPath = join(root, "e2e/helpers/webhook-replay-idempotency-ready.ts");
  const eventStorePath = join(root, "lib/webhooks/webhook-event-store.ts");
  const ingressGuardPath = join(root, "lib/webhooks/webhook-ingress-replay-guard.ts");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);

  let webhookEventStoreWired = false;
  if (existsSync(eventStorePath)) {
    const source = readFileSync(eventStorePath, "utf8");
    webhookEventStoreWired =
      source.includes("createWebhookEvent") &&
      source.includes("connectionId_externalEventId") &&
      source.includes("duplicate");
  }

  let ingressReplayGuardWired = false;
  if (existsSync(ingressGuardPath)) {
    const source = readFileSync(ingressGuardPath, "utf8");
    ingressReplayGuardWired =
      source.includes("recordWebhookIngressOrDuplicate") &&
      source.includes("webhookIngressDedupe");
  }

  const report = buildWebhookReplayIdempotencyAuditReport(root);

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(WEBHOOK_REPLAY_IDEMPOTENCY_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("WEBHOOK_REPLAY_IDEMPOTENCY_E2E_POLICY_ID"));
  const flowReferencesDuplicate =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes("simulate_duplicate_ingest") ||
      readFileSync(flowPath, "utf8").includes("assertWebhookEventStoreDuplicate"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    webhookEventStoreWired &&
    ingressReplayGuardWired &&
    specReferencesPolicy &&
    flowReferencesDuplicate &&
    report.overall === "PASSED" &&
    report.totalRoutes === WEBHOOK_REPLAY_IDEMPOTENCY_EXPECTED_ROUTE_COUNT;

  return {
    policyId: WEBHOOK_REPLAY_IDEMPOTENCY_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    webhookEventStoreWired,
    ingressReplayGuardWired,
    matrixRouteCount: report.totalRoutes,
    auditPassed: report.overall === "PASSED",
    flowStepCount: 3,
    passed,
  };
}

export function formatWebhookReplayIdempotencyAuditLines(
  summary: WebhookReplayIdempotencyE2EAuditSummary,
  report: WebhookReplayIdempotencyAuditReport,
): string[] {
  return [
    `Webhook replay idempotency E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (e2e/webhook-replay-idempotency.spec.ts)`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Webhook event store wired: ${summary.webhookEventStoreWired ? "yes" : "no"}`,
    `Ingress replay guard wired: ${summary.ingressReplayGuardWired ? "yes" : "no"}`,
    `Routes: ${report.totalRoutes}/${report.expectedRouteCount}`,
    `Idempotency wired: ${report.wiredCount}`,
    `Missing idempotency: ${report.missingIdempotencyCount}`,
    `Commerce missing replay: ${report.commerceMissingReplayCount}`,
    `Matrix audit: ${report.overall}`,
    `Unit test: tests/unit/webhook-replay-idempotency-e2e.test.ts`,
    `Audit script: scripts/audit-webhook-replay-idempotency-e2e.ts`,
    `NPM script: audit:webhook-replay-idempotency-e2e`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
