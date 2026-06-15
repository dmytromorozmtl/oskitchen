import type { StaffRoleType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { createCopilotActorScope } from "@/lib/ai/copilot-actor-scope";
import {
  hasCopilotAuditPageAccess,
  hasCopilotChatPageAccess,
  hasCopilotHubPageAccess,
  hasCopilotSettingsPageAccess,
} from "@/lib/ux/copilot-page-access-era20";
import { resolvePermissionDeniedSurface } from "@/lib/ux/permission-denied-copy";
import { PERMISSION_DENIED_UX_ERA20_CYCLE17_POLICY_ID } from "@/lib/ux/permission-denied-ux-era20-cycle17-policy";

function copilotScope(staffRoleType: StaffRoleType | null, isOwner = false) {
  return createCopilotActorScope({
    sessionUserId: "sess-1",
    userId: "owner-1",
    workspaceRole: isOwner ? "OWNER" : "STAFF",
    staffRoleType,
    platformBypass: false,
  });
}

describe("permission-denied-page-access-era20-cycle17", () => {
  it("locks era20 cycle17 policy id", () => {
    expect(PERMISSION_DENIED_UX_ERA20_CYCLE17_POLICY_ID).toBe(
      "era20-permission-denied-copilot-cycle17-v1",
    );
  });

  it("allows copilot.view for kitchen role grants", () => {
    expect(hasCopilotHubPageAccess(copilotScope("PREP_COOK"))).toBe(true);
    expect(hasCopilotHubPageAccess(copilotScope("VIEWER"))).toBe(true);
  });

  it("denies copilot.view when staff role unmapped", () => {
    expect(hasCopilotHubPageAccess(copilotScope(null))).toBe(false);
  });

  it("restricts chat to manager-tier roles", () => {
    expect(hasCopilotChatPageAccess(copilotScope("MANAGER"))).toBe(true);
    expect(hasCopilotChatPageAccess(copilotScope("PREP_COOK"))).toBe(false);
  });

  it("restricts audit to manager and admin", () => {
    expect(hasCopilotAuditPageAccess(copilotScope("MANAGER"))).toBe(true);
    expect(hasCopilotAuditPageAccess(copilotScope("CUSTOMER_SERVICE"))).toBe(false);
  });

  it("restricts settings to manager and admin", () => {
    expect(hasCopilotSettingsPageAccess(copilotScope("MANAGER"))).toBe(true);
    expect(hasCopilotSettingsPageAccess(copilotScope("ACCOUNTING"))).toBe(false);
  });

  it("routes denied copilot chat users back to copilot hub not external URL", () => {
    const surface = resolvePermissionDeniedSurface("copilot_chat");
    expect(surface.primaryHref).toBe("/dashboard/copilot");
    expect(surface.primaryHref).not.toContain("http");
  });
});
