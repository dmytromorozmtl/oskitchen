import type { ENTERPRISE_SSO_SCIM_LIVE_POLICY_ID } from "@/lib/enterprise/enterprise-sso-scim-live-policy";

export type EnterpriseIdpLiveStatus = "active" | "configured" | "available";

export type EnterpriseIdpLiveCard = {
  id: string;
  vendor: string;
  label: string;
  protocol: string;
  status: EnterpriseIdpLiveStatus;
  statusLabel: string;
  setupHref: string;
};

export type EnterpriseScimLiveStatus = {
  deliveryStatus: "LIVE";
  apiBasePath: string;
  usersEndpoint: string;
  groupsEndpoint: string;
  serviceProviderConfigEndpoint: string;
  workspaceEnabled: boolean;
  workspacePhase: string | null;
  provisionedUserCount: number;
  tokenConfigured: boolean;
  features: string[];
};

export type EnterpriseSsoScimLiveDashboard = {
  policyId: typeof ENTERPRISE_SSO_SCIM_LIVE_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  ssoDeliveryStatus: "LIVE";
  scimDeliveryStatus: "LIVE";
  ssoEntitlementEnabled: boolean;
  ssoActive: boolean;
  ssoConfigured: boolean;
  idpCards: EnterpriseIdpLiveCard[];
  scim: EnterpriseScimLiveStatus;
  wiringCertPassed: boolean;
  scimApiRoutesLive: boolean;
  summary: {
    liveIdpCount: number;
    activeIdpVendor: string | null;
    provisionedUsers: number;
    scimEnabled: boolean;
  };
  warnings: string[];
  basePath: string;
};
