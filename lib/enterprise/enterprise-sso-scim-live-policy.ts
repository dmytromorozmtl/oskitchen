/**
 * ENT-66 — Enterprise SSO + SCIM LIVE (Okta, Microsoft Entra ID, Google Workspace).
 *
 * @see services/enterprise/enterprise-sso-scim-live-service.ts
 * @see lib/enterprise/enterprise-sso-scim-live-builders.ts
 */

export const ENTERPRISE_SSO_SCIM_LIVE_POLICY_ID = "enterprise-sso-scim-live-ent66-v1" as const;

export const ENTERPRISE_SSO_SCIM_LIVE_PATH = "/dashboard/enterprise/sso-scim" as const;

export const ENTERPRISE_SSO_DELIVERY_STATUS_LIVE = "LIVE" as const;

export const ENTERPRISE_SCIM_DELIVERY_STATUS_LIVE = "LIVE" as const;

export const SCIM_API_BASE_PATH = "/api/scim/v2" as const;

export const ENTERPRISE_SSO_LIVE_IDPS = [
  {
    id: "okta",
    vendor: "OKTA",
    label: "Okta",
    protocol: "SAML 2.0",
    setupDoc: "docs/enterprise-sso-idp-staging-smoke-plan.md#okta-test-tenant-setup",
  },
  {
    id: "entra",
    vendor: "ENTRA_ID",
    label: "Microsoft Entra ID (Azure AD)",
    protocol: "SAML 2.0",
    setupDoc: "docs/enterprise-sso-idp-staging-smoke-plan.md",
  },
  {
    id: "google",
    vendor: "GOOGLE_WORKSPACE",
    label: "Google Workspace",
    protocol: "SAML 2.0",
    setupDoc: "docs/sso-scim-live-plan.md",
  },
] as const;

export type EnterpriseSsoLiveIdpId = (typeof ENTERPRISE_SSO_LIVE_IDPS)[number]["id"];

export const ENTERPRISE_SCIM_LIVE_FEATURES = [
  "RFC 7644 Users CRUD + PATCH deactivate",
  "Groups read + membership",
  "Per-workspace bearer token",
  "Okta + Entra SCIM app templates",
  "Audit: scim.user.created · scim.user.deactivated",
] as const;
