import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_PILOT_SETUP_FOCUS_ERA18_POLICY_ID,
  ENTERPRISE_SSO_PILOT_SETUP_FOCUS_ERA18_PROOF_STATUS,
  ENTERPRISE_SSO_PILOT_SETUP_FOCUS_ERA18_SSO_DELIVERY_PROOF_STATUS,
  SSO_PILOT_ACTIVATION_ANCHOR,
  SSO_PILOT_BILLING_PLANS_ROUTE,
  SSO_PILOT_CONFIGURATION_ANCHOR,
  SSO_PILOT_LOGIN_ENTRY_ANCHOR,
  SSO_PILOT_LOGIN_ROUTE,
} from "@/lib/enterprise/enterprise-sso-pilot-setup-focus-era18-policy";
import {
  buildSsoPilotSetupFocusSnapshot,
  pickSsoPilotSetupAttentionItems,
  resolveSsoPilotSetupStepRowNextAction,
  shouldShowSsoPilotSetupAttentionStrip,
  summarizeSsoPilotSetupFocus,
} from "@/lib/enterprise/enterprise-sso-pilot-setup-focus-era18";
import type { WorkspaceSsoAdminView } from "@/lib/enterprise/workspace-sso-admin-service";
import {
  evaluateSsoPilotSetupProgress,
  SSO_PILOT_SETUP_STEPS,
} from "@/lib/enterprise/enterprise-sso-pilot-setup-wizard-steps";

function baseView(overrides: Partial<WorkspaceSsoAdminView> = {}): WorkspaceSsoAdminView {
  return {
    workspaceId: "ws-pilot-1",
    settings: null,
    ssoEntitlementEnabled: false,
    runtimeGateAllowed: false,
    configured: false,
    active: false,
    ...overrides,
  };
}

describe("enterprise SSO pilot setup focus era18", () => {
  it("locks era18 SSO pilot setup focus policy id", () => {
    expect(ENTERPRISE_SSO_PILOT_SETUP_FOCUS_ERA18_POLICY_ID).toBe(
      "era18-enterprise-sso-pilot-setup-focus-v1",
    );
    expect(ENTERPRISE_SSO_PILOT_SETUP_FOCUS_ERA18_PROOF_STATUS).toBe(
      "enterprise_sso_pilot_setup_focus_attention_wired",
    );
    expect(ENTERPRISE_SSO_PILOT_SETUP_FOCUS_ERA18_SSO_DELIVERY_PROOF_STATUS).toBe(
      "awaiting_idp_login_proof",
    );
  });

  it("builds focus snapshot from wizard progress", () => {
    const progress = evaluateSsoPilotSetupProgress(baseView());

    expect(buildSsoPilotSetupFocusSnapshot(progress)).toEqual({
      completedCount: 0,
      totalCount: 4,
      incompleteCount: 4,
      currentStepId: "sso_entitlement",
      adminSetupComplete: false,
      idpLoginProofPending: false,
    });
  });

  it("never auto-completes idp login proof step", () => {
    const progress = evaluateSsoPilotSetupProgress(
      baseView({
        ssoEntitlementEnabled: true,
        configured: true,
        active: true,
        runtimeGateAllowed: true,
      }),
    );

    expect(progress.adminSetupComplete).toBe(true);
    expect(progress.currentStepId).toBe("idp_login_proof");
    expect(progress.steps.find((step) => step.id === "idp_login_proof")?.complete).toBe(false);
  });

  it("prioritizes current setup step in attention items", () => {
    const progress = evaluateSsoPilotSetupProgress(
      baseView({ ssoEntitlementEnabled: true, configured: false }),
    );
    const items = pickSsoPilotSetupAttentionItems(progress, SSO_PILOT_SETUP_STEPS);

    expect(items[0]?.id).toBe("current-step");
    expect(items[0]?.href).toBe(SSO_PILOT_CONFIGURATION_ANCHOR);
  });

  it("shows attention strip when setup is incomplete", () => {
    const progress = evaluateSsoPilotSetupProgress(baseView());
    const focus = buildSsoPilotSetupFocusSnapshot(progress);

    expect(shouldShowSsoPilotSetupAttentionStrip(focus)).toBe(true);
    expect(summarizeSsoPilotSetupFocus(focus).hasUrgent).toBe(true);
  });

  it("shows idp proof messaging when admin setup is complete", () => {
    const progress = evaluateSsoPilotSetupProgress(
      baseView({
        ssoEntitlementEnabled: true,
        configured: true,
        active: true,
        runtimeGateAllowed: true,
      }),
    );
    const items = pickSsoPilotSetupAttentionItems(progress, SSO_PILOT_SETUP_STEPS);

    expect(items[0]?.title).toContain("IdP login proof");
    expect(items[0]?.href).toBe(SSO_PILOT_LOGIN_ENTRY_ANCHOR);
  });

  it("resolves row next actions for incomplete steps", () => {
    const entitlementStep = SSO_PILOT_SETUP_STEPS[0]!;

    expect(resolveSsoPilotSetupStepRowNextAction(entitlementStep, false, true)).toEqual({
      label: "Review billing plans",
      href: SSO_PILOT_BILLING_PLANS_ROUTE,
      tone: "urgent",
    });

    const configureStep = SSO_PILOT_SETUP_STEPS[1]!;
    expect(resolveSsoPilotSetupStepRowNextAction(configureStep, false, true)).toEqual({
      label: "Configure IdP now",
      href: SSO_PILOT_CONFIGURATION_ANCHOR,
      tone: "urgent",
    });

    const activateStep = SSO_PILOT_SETUP_STEPS[2]!;
    expect(resolveSsoPilotSetupStepRowNextAction(activateStep, false, false)).toEqual({
      label: "Open activation controls",
      href: SSO_PILOT_ACTIVATION_ANCHOR,
      tone: "normal",
    });

    const proofStep = SSO_PILOT_SETUP_STEPS[3]!;
    expect(resolveSsoPilotSetupStepRowNextAction(proofStep, false, true)).toEqual({
      label: "Test SSO login entry",
      href: SSO_PILOT_LOGIN_ROUTE,
      tone: "urgent",
    });
  });
});
