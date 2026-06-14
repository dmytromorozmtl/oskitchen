import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ARTIFACT,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_E2E_FLOW_HELPER,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_E2E_SPEC,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_FLOW_MODULE,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_FLOW_STEPS,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_POLICY_ID,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ROUTES,
  PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_UNIT_TEST,
} from "@/lib/qa/preview-route-redirect-regression-p2-52-policy";

export type PreviewRouteRedirectRegressionP252AuditSummary = {
  policyId: typeof PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_POLICY_ID;
  flowModulePresent: boolean;
  unitTestPresent: boolean;
  e2eSpecPresent: boolean;
  e2eFlowHelperPresent: boolean;
  middlewareWired: boolean;
  routesHiddenInNavRegistry: boolean;
  regressionWired: boolean;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditPreviewRouteRedirectRegressionP252(
  root = process.cwd(),
): PreviewRouteRedirectRegressionP252AuditSummary {
  const flowModulePresent = existsSync(
    join(root, PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_FLOW_MODULE),
  );
  const unitTestPresent = existsSync(
    join(root, PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_UNIT_TEST),
  );
  const e2eSpecPresent = existsSync(
    join(root, PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_E2E_SPEC),
  );
  const e2eFlowHelperPresent = existsSync(
    join(root, PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_E2E_FLOW_HELPER),
  );

  let middlewareWired = false;
  let regressionWired = false;
  if (existsSync(join(root, "middleware.ts"))) {
    const middleware = readFileSync(join(root, "middleware.ts"), "utf8");
    middlewareWired =
      middleware.includes("enforcePreviewRouteGuard") &&
      middleware.includes("preview-route-guard");
  }

  if (flowModulePresent) {
    const flow = readFileSync(join(root, PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_FLOW_MODULE), "utf8");
    regressionWired =
      flow.includes("assertPreviewRouteRedirectRegression") &&
      flow.includes("previewRouteRedirectUrl") &&
      flow.includes("resolveDashboardLoginReturnPath");
  }

  let routesHiddenInNavRegistry = false;
  const navRegistryPath = join(root, "lib/navigation/nav-maturity-hide-registry.ts");
  if (existsSync(navRegistryPath)) {
    const navRegistry = readFileSync(navRegistryPath, "utf8");
    routesHiddenInNavRegistry =
      navRegistry.includes('"/dashboard/ai"') &&
      navRegistry.includes('"/dashboard/enterprise"') &&
      navRegistry.includes('"/dashboard/quick-start"');
  }

  let artifactPresent = false;
  const artifactPath = join(root, PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ARTIFACT);
  if (existsSync(artifactPath)) {
    const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      policyId?: string;
      routes?: string[];
      flowSteps?: string[];
    };
    artifactPresent =
      artifact.policyId === PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_POLICY_ID &&
      JSON.stringify(artifact.routes) ===
        JSON.stringify([...PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_ROUTES]) &&
      JSON.stringify(artifact.flowSteps) ===
        JSON.stringify([...PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_FLOW_STEPS]);
  }

  const passed =
    flowModulePresent &&
    unitTestPresent &&
    e2eSpecPresent &&
    e2eFlowHelperPresent &&
    middlewareWired &&
    routesHiddenInNavRegistry &&
    regressionWired &&
    artifactPresent;

  return {
    policyId: PREVIEW_ROUTE_REDIRECT_REGRESSION_P2_52_POLICY_ID,
    flowModulePresent,
    unitTestPresent,
    e2eSpecPresent,
    e2eFlowHelperPresent,
    middlewareWired,
    routesHiddenInNavRegistry,
    regressionWired,
    artifactPresent,
    passed,
  };
}

export function formatPreviewRouteRedirectRegressionP252AuditLines(
  summary: PreviewRouteRedirectRegressionP252AuditSummary,
): string[] {
  return [
    `Preview route redirect regression (${summary.policyId})`,
    `Flow module: ${summary.flowModulePresent ? "present" : "missing"}`,
    `Unit test: ${summary.unitTestPresent ? "present" : "missing"}`,
    `E2E spec: ${summary.e2eSpecPresent ? "present" : "missing"}`,
    `E2E flow helper: ${summary.e2eFlowHelperPresent ? "present" : "missing"}`,
    `Middleware wired: ${summary.middlewareWired ? "yes" : "no"}`,
    `Routes hidden in nav registry: ${summary.routesHiddenInNavRegistry ? "yes" : "no"}`,
    `Regression wired: ${summary.regressionWired ? "yes" : "no"}`,
    `Artifact present: ${summary.artifactPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
