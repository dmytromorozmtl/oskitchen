/**
 * Platform go-live support deep link — Evolution Era 18 Workstream O Cycle 54.
 *
 * Audited impersonation + support session redirects into tenant go-live projects.
 * Does not bypass MFA, tenant RBAC, or launch certification claims.
 */

import { PLATFORM_GO_LIVE_FOCUS_ERA18_POLICY_ID } from "@/lib/go-live/platform-go-live-focus-era18-policy";

export const PLATFORM_GO_LIVE_SUPPORT_DEEP_LINK_ERA18_POLICY_ID =
  "era18-platform-go-live-support-deep-link-v1" as const;

export const PLATFORM_GO_LIVE_SUPPORT_DEEP_LINK_ERA18_EXTENDS_POLICIES = [
  PLATFORM_GO_LIVE_FOCUS_ERA18_POLICY_ID,
] as const;

export const PLATFORM_GO_LIVE_SUPPORT_DEEP_LINK_ERA18_PROOF_STATUS =
  "platform_go_live_tenant_deep_link_wired" as const;

export const PLATFORM_GO_LIVE_SUPPORT_DEEP_LINK_ERA18_BACKLOG_ID = "KOS-E18-054" as const;

export const PLATFORM_GO_LIVE_TENANT_PROJECT_ROUTE_PREFIX = "/dashboard/go-live/projects/" as const;

export function platformGoLiveTenantProjectHref(projectId: string): string {
  return `${PLATFORM_GO_LIVE_TENANT_PROJECT_ROUTE_PREFIX}${projectId}`;
}
