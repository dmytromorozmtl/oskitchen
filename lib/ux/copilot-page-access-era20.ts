/**
 * Copilot page access helpers — guard-before-query for Era 20 Workstream H.
 */

import type { CopilotActorScope } from "@/lib/ai/copilot-types";
import { createCopilotActorScope } from "@/lib/ai/copilot-actor-scope";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import { loadWorkspacePermissionPageActor } from "@/lib/ux/permission-denied-page-access-era19";

export const COPILOT_PAGE_ACCESS_ERA20_POLICY_ID =
  "era20-copilot-page-access-v1" as const;

export function hasCopilotHubPageAccess(scope: CopilotActorScope): boolean {
  return canUseCopilot(scope, "copilot.view");
}

export function hasCopilotChatPageAccess(scope: CopilotActorScope): boolean {
  return canUseCopilot(scope, "copilot.chat");
}

export function hasCopilotAuditPageAccess(scope: CopilotActorScope): boolean {
  return canUseCopilot(scope, "copilot.read.audit");
}

export function hasCopilotSettingsPageAccess(scope: CopilotActorScope): boolean {
  return canUseCopilot(scope, "copilot.settings.manage");
}

export async function loadCopilotPageActor() {
  const actor = await loadWorkspacePermissionPageActor();
  const scope = createCopilotActorScope(actor);
  return { actor, scope };
}
