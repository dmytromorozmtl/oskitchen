import { expect, test } from "@playwright/test";

import { getRecoveryPlaybookForAlert } from "@/lib/integration-health/recovery-playbook-policy";
import {
  INTEGRATION_HEALTH_PATH,
  INTEGRATION_HEALTH_RECOVERY_PLAYBOOK_E2E_POLICY_ID,
  INTEGRATION_HEALTH_RECOVERY_URL,
  RECOVERY_PLAYBOOK_POLICY_ID,
  RECOVERY_QUICK_LINK_HREFS,
  RECOVERY_UI_POLICY_ID,
  integrationHealthRecoveryQuickLinkTestId,
  integrationHealthRecoveryStepTestId,
  isAllowedRecoveryDestinationHref,
} from "@/lib/integration-health/integration-health-recovery-playbook-e2e-policy";
import { INTEGRATION_HEALTH_RECOVERY_QUICK_LINKS } from "@/lib/integrations/integration-health-recovery-era19-policy";

import { runIntegrationHealthRecoveryPlaybookFlow } from "./helpers/integration-health-recovery-flow";
import { skipIntegrationHealthRecoveryIfNotAuthed } from "./helpers/integration-health-recovery-ready";

/**
 * Integration health → recovery playbook E2E.
 *
 * Recovery checklist panel → step or quick link → operator workflow surface.
 *
 * @see app/dashboard/integration-health/page.tsx
 * @see components/dashboard/integration-health-recovery-panel.tsx
 * @see services/integration-health/recovery-playbook-service.ts
 */

test.describe("integration health recovery playbook policy", () => {
  test("exports health center and recovery playbook contract", () => {
    expect(INTEGRATION_HEALTH_RECOVERY_PLAYBOOK_E2E_POLICY_ID).toBe(
      "integration-health-recovery-playbook-e2e-v1",
    );
    expect(INTEGRATION_HEALTH_PATH).toBe("/dashboard/integration-health");
    expect(INTEGRATION_HEALTH_RECOVERY_URL).toBe(
      "/dashboard/integration-health#integration-recovery-checklist",
    );
    expect(RECOVERY_PLAYBOOK_POLICY_ID).toBe("critical-integration-recovery-playbook-v1");
    expect(RECOVERY_UI_POLICY_ID).toBe("era19-integration-health-recovery-v1");
    expect(integrationHealthRecoveryStepTestId("webhook-queue")).toBe(
      "integration-health-recovery-step-webhook-queue",
    );
    expect(integrationHealthRecoveryQuickLinkTestId("error-recovery")).toBe(
      "integration-health-recovery-quick-error-recovery",
    );
    expect(RECOVERY_QUICK_LINK_HREFS).toContain("/dashboard/error-recovery");
    expect(isAllowedRecoveryDestinationHref("/dashboard/sales-channels/webhooks")).toBe(true);
    expect(isAllowedRecoveryDestinationHref("https://evil.example")).toBe(false);
  });

  test("maps webhook failure alerts to manual recovery playbook steps", () => {
    const playbook = getRecoveryPlaybookForAlert("webhook_failures");
    expect(playbook?.steps.length).toBeGreaterThan(0);
    expect(playbook?.steps.every((step) => step.kind === "manual")).toBe(true);
    expect(
      playbook?.steps.some((step) =>
        isAllowedRecoveryDestinationHref(step.href ?? ""),
      ),
    ).toBe(true);
  });

  test("quick recovery links align with era19 operator runbook", () => {
    expect(INTEGRATION_HEALTH_RECOVERY_QUICK_LINKS.length).toBeGreaterThanOrEqual(6);
    for (const link of INTEGRATION_HEALTH_RECOVERY_QUICK_LINKS) {
      expect(isAllowedRecoveryDestinationHref(link.href)).toBe(true);
    }
  });
});

test.describe("integration health recovery playbook (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Integration health recovery runs in chromium-authed project only",
    );
    skipIntegrationHealthRecoveryIfNotAuthed();
  });

  test("recovery panel step or quick link opens operator workflow without RSC failure", async ({
    page,
  }) => {
    const result = await runIntegrationHealthRecoveryPlaybookFlow(page);
    if (!result) {
      test.skip(
        true,
        "Integration health recovery unavailable — missing permissions or no recovery links.",
      );
    }

    expect(isAllowedRecoveryDestinationHref(result.destinationPath)).toBe(true);
    expect(["recovery_step", "recovery_quick_link"]).toContain(result.clickedSurface);
    expect(result.quickLinkCount).toBeGreaterThan(0);
  });
});
