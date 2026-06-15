/**
 * Platform workspace go-live focus — Evolution Era 18 Workstream O Cycle 55.
 *
 * Workspace detail launch projects for platform ops with support-session context.
 * Does not bypass tenant RBAC or claim launch certification PASS.
 */

import { PLATFORM_GO_LIVE_SUPPORT_DEEP_LINK_ERA18_POLICY_ID } from "@/lib/go-live/platform-go-live-support-deep-link-era18-policy";

export const PLATFORM_WORKSPACE_GO_LIVE_FOCUS_ERA18_POLICY_ID =
  "era18-platform-workspace-go-live-focus-v1" as const;

export const PLATFORM_WORKSPACE_GO_LIVE_FOCUS_ERA18_EXTENDS_POLICIES = [
  PLATFORM_GO_LIVE_SUPPORT_DEEP_LINK_ERA18_POLICY_ID,
] as const;

export const PLATFORM_WORKSPACE_GO_LIVE_FOCUS_ERA18_PROOF_STATUS =
  "platform_workspace_go_live_section_wired" as const;

export const PLATFORM_WORKSPACE_GO_LIVE_FOCUS_ERA18_BACKLOG_ID = "KOS-E18-055" as const;

export const PLATFORM_WORKSPACE_GO_LIVE_SECTION_ID = "platform-workspace-go-live" as const;

export function platformWorkspaceGoLiveProjectAnchor(projectId: string): string {
  return `#go-live-project-${projectId}`;
}
