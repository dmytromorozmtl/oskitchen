/**
 * Integration health → recovery playbook E2E policy (QA-21).
 *
 * @see e2e/integration-health-recovery-playbook.spec.ts
 * @see app/dashboard/integration-health/page.tsx
 * @see lib/integration-health/recovery-playbook-policy.ts
 */

import { INTEGRATION_RECOVERY_PLAYBOOK_POLICY_ID } from "@/lib/integration-health/recovery-playbook-policy";
import {
  INTEGRATION_HEALTH_RECOVERY_ANCHOR,
  INTEGRATION_HEALTH_RECOVERY_ERA19_POLICY_ID,
  INTEGRATION_HEALTH_RECOVERY_QUICK_LINKS,
} from "@/lib/integrations/integration-health-recovery-era19-policy";

export const INTEGRATION_HEALTH_RECOVERY_PLAYBOOK_E2E_POLICY_ID =
  "integration-health-recovery-playbook-e2e-v1" as const;

export const INTEGRATION_HEALTH_PATH = "/dashboard/integration-health" as const;
export const INTEGRATION_HEALTH_RECOVERY_URL =
  `${INTEGRATION_HEALTH_PATH}${INTEGRATION_HEALTH_RECOVERY_ANCHOR}` as const;

export const INTEGRATION_HEALTH_HEADING_PATTERN = /^Integration health$/i;

export const RECOVERY_PANEL_TESTID = "integration-health-recovery-panel" as const;
export const RECOVERY_STEP_TESTID_PREFIX = "integration-health-recovery-step-" as const;
export const RECOVERY_QUICK_LINK_TESTID_PREFIX = "integration-health-recovery-quick-" as const;
export const RECOVERY_FLOW_PROOF_TESTID = "integration-health-recovery-flow-proof" as const;

export const RECOVERY_PLAYBOOK_POLICY_ID = INTEGRATION_RECOVERY_PLAYBOOK_POLICY_ID;
export const RECOVERY_UI_POLICY_ID = INTEGRATION_HEALTH_RECOVERY_ERA19_POLICY_ID;

export const RECOVERY_QUICK_LINK_HREFS = INTEGRATION_HEALTH_RECOVERY_QUICK_LINKS.map(
  (link) => link.href,
) as readonly string[];

export const INTEGRATION_HEALTH_RECOVERY_VISIBLE_MS = 30_000 as const;

export type IntegrationHealthRecoveryClickSurface =
  | "recovery_step"
  | "recovery_quick_link";

export function integrationHealthRecoveryStepTestId(stepId: string): string {
  return `${RECOVERY_STEP_TESTID_PREFIX}${stepId}`;
}

export function integrationHealthRecoveryQuickLinkTestId(linkId: string): string {
  return `${RECOVERY_QUICK_LINK_TESTID_PREFIX}${linkId}`;
}

export function isAllowedRecoveryDestinationHref(href: string): boolean {
  const trimmed = href.trim();
  return trimmed.startsWith("/dashboard") || trimmed.startsWith("/help");
}
