import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ERROR_TEMPLATE_BOUNDARY_MODULE,
  ERROR_TEMPLATE_DARK_MODE_TOKENS,
  ERROR_TEMPLATE_DESIGN_TOKENS_POLICY_ID,
  ERROR_TEMPLATE_ILLUSTRATION_MODULE,
  ERROR_TEMPLATE_REQUIRED_ELEMENTS,
  ERROR_TEMPLATE_STATE_MODULE,
} from "@/lib/design/error-template-design-tokens-policy";

const POLICY_MODULE = "lib/design/error-template-design-tokens-policy.ts" as const;

export type ErrorTemplateDesignTokensAuditSummary = {
  policyId: typeof ERROR_TEMPLATE_DESIGN_TOKENS_POLICY_ID;
  boundaryModulePresent: boolean;
  stateModulePresent: boolean;
  illustrationModulePresent: boolean;
  illustrationWired: boolean;
  titleWired: boolean;
  descriptionWired: boolean;
  actionsWired: boolean;
  darkModeWired: boolean;
  boundaryUsesStateChain: boolean;
  passed: boolean;
};

export function auditErrorTemplateDesignTokens(
  root = process.cwd(),
): ErrorTemplateDesignTokensAuditSummary {
  const boundaryPath = join(root, ERROR_TEMPLATE_BOUNDARY_MODULE);
  const statePath = join(root, ERROR_TEMPLATE_STATE_MODULE);
  const illustrationPath = join(root, ERROR_TEMPLATE_ILLUSTRATION_MODULE);

  const boundaryModulePresent = existsSync(boundaryPath);
  const stateModulePresent = existsSync(statePath);
  const illustrationModulePresent = existsSync(illustrationPath);

  let illustrationWired = false;
  let titleWired = false;
  let descriptionWired = false;
  let actionsWired = false;
  let darkModeWired = false;
  let boundaryUsesStateChain = false;

  if (stateModulePresent) {
    const source = readFileSync(statePath, "utf8");
    illustrationWired = source.includes("ErrorStateIllustration");
    titleWired =
      source.includes("CardTitle") && source.includes("ERROR_TEMPLATE_TITLE_CLASS");
    descriptionWired =
      source.includes("CardDescription") &&
      source.includes("ERROR_TEMPLATE_DESCRIPTION_CLASS");
    actionsWired =
      source.includes("ERROR_TEMPLATE_ACTIONS_CLASS") &&
      source.includes("ERROR_TEMPLATE_RETRY_BUTTON_CLASS") &&
      source.includes("ERROR_TEMPLATE_HOME_BUTTON_CLASS");
    darkModeWired =
      source.includes("ERROR_TEMPLATE_CARD_CLASS") &&
      source.includes("dark:text-destructive/90");
  }

  if (illustrationModulePresent) {
    const illustrationSource = readFileSync(illustrationPath, "utf8");
    illustrationWired =
      illustrationWired &&
      illustrationSource.includes("ERROR_TEMPLATE_ILLUSTRATION_CLASS");
    darkModeWired =
      darkModeWired && illustrationSource.includes("ERROR_TEMPLATE_ILLUSTRATION_CLASS");
  }

  const policyPath = join(root, POLICY_MODULE);
  if (existsSync(policyPath)) {
    const policySource = readFileSync(policyPath, "utf8");
    darkModeWired =
      darkModeWired &&
      ERROR_TEMPLATE_DARK_MODE_TOKENS.every((token) => policySource.includes(token));
  } else {
    darkModeWired = false;
  }

  if (boundaryModulePresent) {
    const boundarySource = readFileSync(boundaryPath, "utf8");
    boundaryUsesStateChain =
      boundarySource.includes("RouteError") &&
      boundarySource.includes("ErrorBoundaryTemplate");
  }

  const passed =
    boundaryModulePresent &&
    stateModulePresent &&
    illustrationModulePresent &&
    illustrationWired &&
    titleWired &&
    descriptionWired &&
    actionsWired &&
    darkModeWired &&
    boundaryUsesStateChain &&
    ERROR_TEMPLATE_REQUIRED_ELEMENTS.length === 5;

  return {
    policyId: ERROR_TEMPLATE_DESIGN_TOKENS_POLICY_ID,
    boundaryModulePresent,
    stateModulePresent,
    illustrationModulePresent,
    illustrationWired,
    titleWired,
    descriptionWired,
    actionsWired,
    darkModeWired,
    boundaryUsesStateChain,
    passed,
  };
}

export function formatErrorTemplateDesignTokensAuditLines(
  summary: ErrorTemplateDesignTokensAuditSummary,
): string[] {
  return [
    `Error template design tokens audit (${summary.policyId})`,
    `Boundary module: ${summary.boundaryModulePresent ? "present" : "missing"} (${ERROR_TEMPLATE_BOUNDARY_MODULE})`,
    `State module: ${summary.stateModulePresent ? "present" : "missing"} (${ERROR_TEMPLATE_STATE_MODULE})`,
    `Illustration module: ${summary.illustrationModulePresent ? "present" : "missing"} (${ERROR_TEMPLATE_ILLUSTRATION_MODULE})`,
    `Illustration wired: ${summary.illustrationWired ? "yes" : "no"}`,
    `Title wired: ${summary.titleWired ? "yes" : "no"}`,
    `Description wired: ${summary.descriptionWired ? "yes" : "no"}`,
    `Actions wired: ${summary.actionsWired ? "yes" : "no"}`,
    `Dark mode tokens: ${summary.darkModeWired ? "yes" : "no"}`,
    `Boundary → RouteError chain: ${summary.boundaryUsesStateChain ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
