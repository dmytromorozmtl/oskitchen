import {
  ENTERPRISE_SCIM_DELIVERY_STATUS_LIVE,
  ENTERPRISE_SCIM_LIVE_FEATURES,
  ENTERPRISE_SSO_DELIVERY_STATUS_LIVE,
  ENTERPRISE_SSO_LIVE_IDPS,
  ENTERPRISE_SSO_SCIM_LIVE_PATH,
  ENTERPRISE_SSO_SCIM_LIVE_POLICY_ID,
  SCIM_API_BASE_PATH,
} from "@/lib/enterprise/enterprise-sso-scim-live-policy";
import type {
  EnterpriseIdpLiveCard,
  EnterpriseIdpLiveStatus,
  EnterpriseScimLiveStatus,
  EnterpriseSsoScimLiveDashboard,
} from "@/lib/enterprise/enterprise-sso-scim-live-types";

export type EnterpriseSsoScimLiveBuildInput = {
  workspaceId: string;
  ssoEntitlementEnabled: boolean;
  ssoActive: boolean;
  ssoConfigured: boolean;
  activeIdpVendor: string | null;
  scimEnabled: boolean;
  scimPhase: string | null;
  scimTokenConfigured: boolean;
  provisionedUserCount: number;
  wiringCertPassed: boolean;
  scimApiRoutesLive: boolean;
  analyzedAt?: Date;
};

function resolveIdpStatus(input: {
  vendor: string;
  activeIdpVendor: string | null;
  ssoConfigured: boolean;
  ssoActive: boolean;
}): { status: EnterpriseIdpLiveStatus; statusLabel: string } {
  if (input.ssoActive && input.activeIdpVendor === input.vendor) {
    return { status: "active", statusLabel: "Active for workspace" };
  }
  if (input.ssoConfigured && input.activeIdpVendor === input.vendor) {
    return { status: "configured", statusLabel: "Configured — activate SSO" };
  }
  return { status: "available", statusLabel: "LIVE — ready to configure" };
}

export function buildEnterpriseIdpLiveCards(
  input: Pick<
    EnterpriseSsoScimLiveBuildInput,
    "activeIdpVendor" | "ssoConfigured" | "ssoActive"
  >,
): EnterpriseIdpLiveCard[] {
  return ENTERPRISE_SSO_LIVE_IDPS.map((idp) => {
    const { status, statusLabel } = resolveIdpStatus({
      vendor: idp.vendor,
      activeIdpVendor: input.activeIdpVendor,
      ssoConfigured: input.ssoConfigured,
      ssoActive: input.ssoActive,
    });
    return {
      id: idp.id,
      vendor: idp.vendor,
      label: idp.label,
      protocol: idp.protocol,
      status,
      statusLabel,
      setupHref: "/dashboard/settings/security/sso",
    };
  });
}

export function buildEnterpriseScimLiveStatus(input: {
  scimEnabled: boolean;
  scimPhase: string | null;
  scimTokenConfigured: boolean;
  provisionedUserCount: number;
}): EnterpriseScimLiveStatus {
  return {
    deliveryStatus: ENTERPRISE_SCIM_DELIVERY_STATUS_LIVE,
    apiBasePath: SCIM_API_BASE_PATH,
    usersEndpoint: `${SCIM_API_BASE_PATH}/Users`,
    groupsEndpoint: `${SCIM_API_BASE_PATH}/Groups`,
    serviceProviderConfigEndpoint: `${SCIM_API_BASE_PATH}/ServiceProviderConfig`,
    workspaceEnabled: input.scimEnabled,
    workspacePhase: input.scimPhase,
    provisionedUserCount: input.provisionedUserCount,
    tokenConfigured: input.scimTokenConfigured,
    features: [...ENTERPRISE_SCIM_LIVE_FEATURES],
  };
}

export function buildEnterpriseSsoScimLiveDashboard(
  input: EnterpriseSsoScimLiveBuildInput,
): EnterpriseSsoScimLiveDashboard {
  const idpCards = buildEnterpriseIdpLiveCards(input);
  const scim = buildEnterpriseScimLiveStatus(input);
  const warnings: string[] = [];

  if (!input.ssoEntitlementEnabled) {
    warnings.push("Enterprise SSO entitlement (ssoOidc) required before activating IdP login.");
  }
  if (!input.wiringCertPassed) {
    warnings.push("SSO R2 wiring cert not passed — run smoke:enterprise-sso-r2-pilot.");
  }
  if (input.scimApiRoutesLive && !input.scimTokenConfigured) {
    warnings.push("SCIM API is LIVE — generate a workspace bearer token to connect Okta or Entra provisioning.");
  }

  const liveIdpCount = ENTERPRISE_SSO_LIVE_IDPS.length;

  return {
    policyId: ENTERPRISE_SSO_SCIM_LIVE_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    ssoDeliveryStatus: ENTERPRISE_SSO_DELIVERY_STATUS_LIVE,
    scimDeliveryStatus: ENTERPRISE_SCIM_DELIVERY_STATUS_LIVE,
    ssoEntitlementEnabled: input.ssoEntitlementEnabled,
    ssoActive: input.ssoActive,
    ssoConfigured: input.ssoConfigured,
    idpCards,
    scim,
    wiringCertPassed: input.wiringCertPassed,
    scimApiRoutesLive: input.scimApiRoutesLive,
    summary: {
      liveIdpCount,
      activeIdpVendor: input.activeIdpVendor,
      provisionedUsers: input.provisionedUserCount,
      scimEnabled: input.scimEnabled,
    },
    warnings,
    basePath: ENTERPRISE_SSO_SCIM_LIVE_PATH,
  };
}
