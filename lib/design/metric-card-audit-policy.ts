import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  METRIC_CARD_CRITICAL_MODULES,
  METRIC_CARD_EXCEPTION_MARKER,
  METRIC_CARD_EXCEPTION_MODULES,
  METRIC_CARD_IMPORT,
  METRIC_CARD_PATTERNS_POLICY_ID,
  METRIC_CARD_PRIMITIVE_PATTERN,
} from "@/lib/design/metric-card-patterns";

/**
 * DES-35 — MetricCard consistency audit policy.
 */

export const METRIC_CARD_AUDIT_POLICY_ID = METRIC_CARD_PATTERNS_POLICY_ID;

export type MetricCardModuleAudit = {
  module: string;
  usesMetricCardPrimitive: boolean;
  isException: boolean;
  passed: boolean;
};

export type MetricCardAuditReport = {
  policyId: typeof METRIC_CARD_AUDIT_POLICY_ID;
  modules: MetricCardModuleAudit[];
  passed: boolean;
};

export function auditMetricCardModule(
  modulePath: string,
  root = process.cwd(),
): MetricCardModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const isException =
    (METRIC_CARD_EXCEPTION_MODULES as readonly string[]).includes(modulePath) ||
    source.includes(METRIC_CARD_EXCEPTION_MARKER);
  const usesMetricCardPrimitive =
    modulePath === "components/data-display/metric-card.tsx" ||
    (METRIC_CARD_PRIMITIVE_PATTERN.test(source) && source.includes(METRIC_CARD_IMPORT));
  const passed = isException || usesMetricCardPrimitive;

  return {
    module: modulePath,
    usesMetricCardPrimitive,
    isException,
    passed,
  };
}

export function auditMetricCard(root = process.cwd()): MetricCardAuditReport {
  const modules = METRIC_CARD_CRITICAL_MODULES.map((modulePath) =>
    auditMetricCardModule(modulePath, root),
  );
  return {
    policyId: METRIC_CARD_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
