import { isSuperAdminEmail } from "@/lib/platform-owner";

import type { CopilotActorScope, CopilotCapability } from "@/lib/ai/copilot-types";

const ROLE_GRANTS: Record<CopilotCapability, string[]> = {
  "copilot.view": [
    "manager",
    "admin",
    "accountant",
    "kitchen_lead",
    "kitchen",
    "packer",
    "packing",
    "driver",
    "dispatcher",
    "sales",
    "viewer",
  ],
  "copilot.chat": ["manager", "admin", "accountant", "sales", "kitchen_lead"],
  "copilot.read.operations": [
    "manager",
    "admin",
    "kitchen_lead",
    "kitchen",
    "packer",
    "packing",
    "driver",
    "dispatcher",
    "sales",
  ],
  "copilot.read.financial": ["manager", "admin", "accountant"],
  "copilot.read.customer_pii": ["manager", "admin", "sales"],
  "copilot.read.audit": ["manager", "admin"],
  "copilot.actions.draft": ["manager", "admin", "kitchen_lead", "sales"],
  "copilot.actions.approve": ["manager", "admin"],
  "copilot.settings.manage": ["manager", "admin"],
  "copilot.narrative.toggle": ["manager", "admin"],
};

export function isSuperAdminCopilot(scope: CopilotActorScope): boolean {
  return isSuperAdminEmail(scope.email);
}

export function canUseCopilot(
  scope: CopilotActorScope,
  capability: CopilotCapability,
): boolean {
  if (isSuperAdminCopilot(scope)) return true;
  if (scope.isOwner) return true;
  const role = (scope.role ?? "").toLowerCase();
  return ROLE_GRANTS[capability]?.includes(role) ?? false;
}
