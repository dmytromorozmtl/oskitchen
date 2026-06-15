/**
 * Platform support session banner go-live focus — Evolution Era 18 Workstream O Cycle 56.
 *
 * Quick links from active support session banner into workspace go-live context.
 * Does not bypass tenant RBAC or claim launch certification PASS.
 */

import { PLATFORM_WORKSPACE_GO_LIVE_FOCUS_ERA18_POLICY_ID } from "@/lib/go-live/platform-workspace-go-live-focus-era18-policy";

export const PLATFORM_SUPPORT_SESSION_BANNER_GO_LIVE_ERA18_POLICY_ID =
  "era18-platform-support-session-banner-go-live-v1" as const;

export const PLATFORM_SUPPORT_SESSION_BANNER_GO_LIVE_ERA18_EXTENDS_POLICIES = [
  PLATFORM_WORKSPACE_GO_LIVE_FOCUS_ERA18_POLICY_ID,
] as const;

export const PLATFORM_SUPPORT_SESSION_BANNER_GO_LIVE_ERA18_PROOF_STATUS =
  "platform_support_session_banner_go_live_wired" as const;

export const PLATFORM_SUPPORT_SESSION_BANNER_GO_LIVE_ERA18_BACKLOG_ID = "KOS-E18-056" as const;

export function platformWorkspaceGoLiveSectionHref(workspaceId: string): string {
  return `/platform/workspaces/${workspaceId}#platform-workspace-go-live`;
}

export function platformWorkspaceGoLiveProjectHref(workspaceId: string, projectId: string): string {
  return `/platform/workspaces/${workspaceId}#go-live-project-${projectId}`;
}
