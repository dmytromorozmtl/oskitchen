/**
 * Launch Wizard commercial pilot setup — Evolution Era 19 Workstream C Cycle 16.
 */

import { INTEGRATION_HEALTH_RECOVERY_ANCHOR } from "@/lib/integrations/integration-health-recovery-era19-policy";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";

export const LAUNCH_WIZARD_COMMERCIAL_SETUP_ERA19_POLICY_ID =
  "era19-launch-wizard-commercial-setup-v1" as const;

export const LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR =
  "#launch-wizard-commercial-blockers" as const;

export const LAUNCH_WIZARD_COMMERCIAL_OPS_CHECKLIST_DOC =
  "docs/era18-p0-staging-proof-ops-checklist.md" as const;

export const LAUNCH_WIZARD_COMMERCIAL_RECOVERY_LINKS = [
  {
    id: "integration-recovery",
    label: "Integration recovery checklist",
    href: `/dashboard/integration-health${INTEGRATION_HEALTH_RECOVERY_ANCHOR}`,
    detail: "Prioritized steps for webhook backlog, mapping, and channel smoke.",
  },
  {
    id: "today-risk-radar",
    label: "Today risk radar",
    href: "/dashboard/today#owner-briefing-risk-radar",
    detail: "Owner command center — P0, GO/NO-GO, and operational risk signals.",
  },
  {
    id: "smoke-artifacts",
    label: "Engineering smoke artifacts",
    href: "/dashboard/integration-health#engineering-smoke-artifacts",
    detail: "PASS / FAILED / SKIPPED WITH REASON — never upgrade to LIVE.",
  },
  {
    id: "commercial-runbook",
    label: "Commercial pilot runbook",
    href: "/dashboard/launch-wizard",
    detail: "Finish setup steps then confirm evidence gates before cutover.",
  },
] as const;

export function launchWizardCommercialBlockerHref(blockerId: string): string {
  switch (blockerId) {
    case "p0-staging-blocked":
      return "/platform/commercial-pilot-ops#p0-staging-proof";
    case "channel-live-proof-blocked":
      return `/dashboard/integration-health${INTEGRATION_HEALTH_RECOVERY_ANCHOR}`;
    case "sso-proof-blocked":
      return "/dashboard/settings/security/sso";
    case "pilot-customer-missing":
    case "gono-go-no-go":
    case "gono-go-artifact-missing":
      return `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`;
    default:
      if (blockerId.startsWith("golive-")) {
        return LAUNCH_WIZARD_ROUTE;
      }
      return `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`;
  }
}
