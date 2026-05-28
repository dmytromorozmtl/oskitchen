import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_ADDITIONAL_DENY_SCENARIOS,
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_REQUIRED_SCENARIOS,
} from "@/lib/enterprise/enterprise-sso-tenant-mapping-era17-policy";
import {
  evaluateWorkspaceSsoRuntimeGate,
  type WorkspaceSsoSettingsSnapshot,
} from "@/lib/enterprise/workspace-sso-foundation";
import {
  validateSsoCallbackSession,
  type SsoCallbackDenyReason,
} from "@/lib/enterprise/workspace-sso-runtime-adapter";

const activeSettings: WorkspaceSsoSettingsSnapshot = {
  enabled: true,
  idpVendor: "OKTA",
  allowedEmailDomains: ["acme.com"],
  pilotPhase: "PILOT_ACTIVE",
  breakGlassOwnerEnabled: true,
  supabaseSsoProviderRef: "okta-pilot",
  loginHintDomain: "acme.com",
};

function baseInput(
  overrides: Partial<Parameters<typeof validateSsoCallbackSession>[0]> = {},
) {
  return {
    workspaceId: "ws-pilot-1",
    userId: "user-1",
    email: "staff@acme.com",
    idpSubject: "sub-1",
    inferredIdpVendor: "OKTA" as const,
    settings: activeSettings,
    userHasWorkspaceAccess: true,
    ssoEntitlementEnabled: true,
    ...overrides,
  };
}

type ScenarioCase = {
  id: (typeof ENTERPRISE_SSO_TENANT_MAPPING_ERA17_REQUIRED_SCENARIOS)[number];
  run: () => void;
};

describe("enterprise SSO tenant mapping era17 matrix", () => {
  const requiredCases: ScenarioCase[] = [
    {
      id: "wrong_email_domain_denied",
      run: () => {
        expect(
          validateSsoCallbackSession(
            baseInput({ email: "intruder@other.com" }),
          ),
        ).toEqual({ ok: false, reason: "domain_not_allowed" });
      },
    },
    {
      id: "wrong_workspace_uuid_denied",
      run: () => {
        expect(
          validateSsoCallbackSession(
            baseInput({
              workspaceId: "ws-wrong-uuid",
              userHasWorkspaceAccess: false,
            }),
          ),
        ).toEqual({ ok: false, reason: "workspace_access_denied" });
      },
    },
    {
      id: "disabled_sso_pilot_denied",
      run: () => {
        expect(
          validateSsoCallbackSession(
            baseInput({
              settings: { ...activeSettings, enabled: false, pilotPhase: "DISABLED" },
            }),
          ),
        ).toEqual({ ok: false, reason: "runtime_gate_denied" });
      },
    },
    {
      id: "missing_provider_ref_denied",
      run: () => {
        const settings = { ...activeSettings, supabaseSsoProviderRef: "  " };
        expect(evaluateWorkspaceSsoRuntimeGate(settings)).toEqual({
          allowed: false,
          reason: "missing_provider_ref",
        });
        expect(
          validateSsoCallbackSession(baseInput({ settings })),
        ).toEqual({ ok: false, reason: "runtime_gate_denied" });
      },
    },
    {
      id: "no_entitlement_denied",
      run: () => {
        expect(
          validateSsoCallbackSession(baseInput({ ssoEntitlementEnabled: false })),
        ).toEqual({ ok: false, reason: "entitlement_denied" });
      },
    },
    {
      id: "valid_pilot_workspace_allowed",
      run: () => {
        expect(validateSsoCallbackSession(baseInput())).toEqual({
          ok: true,
          idpVendor: "OKTA",
          idpSubject: "sub-1",
        });
      },
    },
  ];

  for (const scenario of requiredCases) {
    it(`covers required scenario: ${scenario.id}`, () => {
      scenario.run();
    });
  }

  it("covers every required scenario id from policy", () => {
    expect(requiredCases.map((c) => c.id)).toEqual([
      ...ENTERPRISE_SSO_TENANT_MAPPING_ERA17_REQUIRED_SCENARIOS,
    ]);
  });

  const additionalCases: Array<{
    id: (typeof ENTERPRISE_SSO_TENANT_MAPPING_ERA17_ADDITIONAL_DENY_SCENARIOS)[number];
    reason: SsoCallbackDenyReason;
    input: Parameters<typeof validateSsoCallbackSession>[0];
  }> = [
    {
      id: "missing_workspace_context_denied",
      reason: "missing_context",
      input: baseInput({ workspaceId: "   " }),
    },
    {
      id: "sso_not_configured_denied",
      reason: "not_configured",
      input: baseInput({ settings: null }),
    },
    {
      id: "missing_email_denied",
      reason: "missing_email",
      input: baseInput({ email: null }),
    },
    {
      id: "missing_idp_subject_denied",
      reason: "missing_idp_subject",
      input: baseInput({ idpSubject: null }),
    },
    {
      id: "idp_vendor_mismatch_denied",
      reason: "idp_vendor_mismatch",
      input: baseInput({ inferredIdpVendor: "ENTRA_ID" }),
    },
    {
      id: "pilot_configured_not_active_denied",
      reason: "runtime_gate_denied",
      input: baseInput({
        settings: { ...activeSettings, enabled: false, pilotPhase: "PILOT_CONFIGURED" },
      }),
    },
  ];

  for (const scenario of additionalCases) {
    it(`covers additional deny scenario: ${scenario.id}`, () => {
      expect(validateSsoCallbackSession(scenario.input)).toEqual({
        ok: false,
        reason: scenario.reason,
      });
    });
  }

  it("covers every additional deny scenario id from policy", () => {
    expect(additionalCases.map((c) => c.id)).toEqual([
      ...ENTERPRISE_SSO_TENANT_MAPPING_ERA17_ADDITIONAL_DENY_SCENARIOS,
    ]);
  });
});
