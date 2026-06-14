import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DEVELOPER_API_RATE_LIMITS_P2_75_ARTIFACT,
  DEVELOPER_API_RATE_LIMITS_P2_75_DOCS_PAGE,
  DEVELOPER_API_RATE_LIMITS_P2_75_OPENAPI_TEST_ID,
  DEVELOPER_API_RATE_LIMITS_P2_75_PANEL,
  DEVELOPER_API_RATE_LIMITS_P2_75_PER_KEY_TEST_ID,
  DEVELOPER_API_RATE_LIMITS_P2_75_POLICY_ID,
  DEVELOPER_API_RATE_LIMITS_P2_75_SANDBOX_TEST_ID,
  DEVELOPER_API_RATE_LIMITS_P2_75_SCENARIO_COUNT,
  DEVELOPER_API_OPENAPI_PATH,
  DEVELOPER_API_SANDBOX_KEY_PREFIX,
  DEVELOPER_API_RATE_LIMITS_P2_75_WIRING_PATHS,
} from "@/lib/developer/developer-api-rate-limits-p2-75-policy";
import { runDeveloperApiRateLimitsBenchmarkP275 } from "@/lib/developer/developer-api-rate-limits-p2-75-scoring";
import { publicApiKeyBurstMax } from "@/lib/api-public/public-api-rate-limit-e2e-policy";

export type DeveloperApiRateLimitsP275AuditSummary = {
  policyId: typeof DEVELOPER_API_RATE_LIMITS_P2_75_POLICY_ID;
  wiringComplete: boolean;
  panelWired: boolean;
  docsPageWired: boolean;
  perKeyLimitWired: boolean;
  openapiWired: boolean;
  sandboxWired: boolean;
  apiKeysPanelWired: boolean;
  scoringPassed: boolean;
  passPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditDeveloperApiRateLimitsP275(
  root = process.cwd(),
): DeveloperApiRateLimitsP275AuditSummary {
  const wiringComplete = DEVELOPER_API_RATE_LIMITS_P2_75_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let panelWired = false;
  if (existsSync(join(root, DEVELOPER_API_RATE_LIMITS_P2_75_PANEL))) {
    const source = readFileSync(join(root, DEVELOPER_API_RATE_LIMITS_P2_75_PANEL), "utf8");
    panelWired =
      source.includes('data-testid="developer-api-rate-limits-panel"') &&
      source.includes(`data-testid="${DEVELOPER_API_RATE_LIMITS_P2_75_PER_KEY_TEST_ID}"`) &&
      source.includes(`data-testid="${DEVELOPER_API_RATE_LIMITS_P2_75_OPENAPI_TEST_ID}"`) &&
      source.includes(`data-testid="${DEVELOPER_API_RATE_LIMITS_P2_75_SANDBOX_TEST_ID}"`);
  }

  let docsPageWired = false;
  if (existsSync(join(root, DEVELOPER_API_RATE_LIMITS_P2_75_DOCS_PAGE))) {
    const source = readFileSync(join(root, DEVELOPER_API_RATE_LIMITS_P2_75_DOCS_PAGE), "utf8");
    docsPageWired =
      source.includes("DeveloperApiRateLimitsPanel") &&
      source.includes(DEVELOPER_API_OPENAPI_PATH);
  }

  let perKeyLimitWired = false;
  const rateLimitPath = join(root, "lib/api-public/public-api-rate-limit.ts");
  if (existsSync(rateLimitPath)) {
    const source = readFileSync(rateLimitPath, "utf8");
    perKeyLimitWired =
      source.includes("fingerprintPublicApiBearer") &&
      source.includes("resolveBurstPolicyForApiKey") &&
      source.includes("public_api_key_burst");
  }

  let openapiWired = false;
  const openapiSpecPath = join(root, "lib/api/openapi-spec.ts");
  const openapiRoutePath = join(root, "app/api/openapi.json/route.ts");
  if (existsSync(openapiSpecPath) && existsSync(openapiRoutePath)) {
    const specSource = readFileSync(openapiSpecPath, "utf8");
    const routeSource = readFileSync(openapiRoutePath, "utf8");
    openapiWired =
      specSource.includes("buildOpenApiDocument") &&
      specSource.includes("Sandbox") &&
      specSource.includes("429") &&
      routeSource.includes("buildOpenApiDocument");
  }

  let sandboxWired = false;
  const sandboxPath = join(root, "lib/developer/developer-api-sandbox-p2-75.ts");
  const policiesPath = join(root, "lib/rate-limit/rate-limit-policies.ts");
  if (existsSync(sandboxPath) && existsSync(policiesPath)) {
    const sandboxSource = readFileSync(sandboxPath, "utf8");
    const policiesSource = readFileSync(policiesPath, "utf8");
    sandboxWired =
      sandboxSource.includes("isSandboxDeveloperApiKey") &&
      sandboxSource.includes("DEVELOPER_API_SANDBOX_KEY_PREFIX") &&
      policiesSource.includes("public_api_sandbox_key_burst");
  }

  let apiKeysPanelWired = false;
  const apiKeysPanelPath = join(root, "components/developer/api-keys-panel.tsx");
  if (existsSync(apiKeysPanelPath)) {
    const source = readFileSync(apiKeysPanelPath, "utf8");
    apiKeysPanelWired = source.includes('name="sandbox"') && source.includes("Sandbox key");
  }

  const benchmark = runDeveloperApiRateLimitsBenchmarkP275();
  const artifactPresent = existsSync(join(root, DEVELOPER_API_RATE_LIMITS_P2_75_ARTIFACT));

  const burstOk = publicApiKeyBurstMax() === 600;

  const passed =
    wiringComplete &&
    panelWired &&
    docsPageWired &&
    perKeyLimitWired &&
    openapiWired &&
    sandboxWired &&
    apiKeysPanelWired &&
    burstOk &&
    benchmark.passed &&
    artifactPresent &&
    benchmark.scenarioCount === DEVELOPER_API_RATE_LIMITS_P2_75_SCENARIO_COUNT;

  return {
    policyId: DEVELOPER_API_RATE_LIMITS_P2_75_POLICY_ID,
    wiringComplete,
    panelWired,
    docsPageWired,
    perKeyLimitWired,
    openapiWired,
    sandboxWired,
    apiKeysPanelWired,
    scoringPassed: benchmark.passed,
    passPct: benchmark.passPct,
    artifactPresent,
    passed,
  };
}

export function formatDeveloperApiRateLimitsP275AuditLines(
  summary: DeveloperApiRateLimitsP275AuditSummary,
): string[] {
  return [
    `Developer API rate limits (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Rate limits panel: ${summary.panelWired ? "yes" : "no"}`,
    `Docs page: ${summary.docsPageWired ? "wired" : "missing"}`,
    `Per-key limiting: ${summary.perKeyLimitWired ? "wired" : "missing"}`,
    `OpenAPI spec: ${summary.openapiWired ? "wired" : "missing"}`,
    `Sandbox keys: ${summary.sandboxWired ? "wired" : "missing"}`,
    `API keys panel: ${summary.apiKeysPanelWired ? "wired" : "missing"}`,
    `Flow benchmark: ${summary.passPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
