import { describe, expect, it } from "vitest";

import { getFilteredNavGroups } from "@/lib/business-modes";
import { FINAL_NAVIGATION_GROUPS } from "@/lib/navigation/final-navigation-groups";
import {
  auditNavigationWorkflowIa,
  defaultWorkflowSectionOpen,
  NAV_WORKFLOW_IA_POLICY_ID,
  NAV_WORKFLOW_SECTIONS,
  partitionNavGroupsByWorkflow,
  workflowSectionHasActivePath,
} from "@/lib/navigation/navigation-workflow-ia-policy";

describe("navigation workflow IA (Task 24)", () => {
  it("locks DES-36 policy with four workflow sections", () => {
    expect(NAV_WORKFLOW_IA_POLICY_ID).toBe("navigation-workflow-ia-des36-v1");
    expect(NAV_WORKFLOW_SECTIONS.map((s) => s.id)).toEqual(["foh", "boh", "finance", "settings"]);
  });

  it("assigns every final navigation group to a workflow section", () => {
    const audit = auditNavigationWorkflowIa(FINAL_NAVIGATION_GROUPS);
    expect(audit.passed, audit.unassignedGroupIds.join(", ")).toBe(true);
    expect(audit.unassignedGroupIds).toEqual([]);
  });

  it("partitions filtered nav groups without dropping sidebar modules", () => {
    const groups = getFilteredNavGroups({
      fullNavAccess: true,
      isOwner: true,
      navScopeAll: true,
      navPersona: "auto",
      businessType: "RESTAURANT",
    });
    const partitions = partitionNavGroupsByWorkflow(groups);
    const partitionedLinks = partitions.flatMap((p) => p.groups.flatMap((g) => g.links.length));
    const sourceLinks = groups.flatMap((g) => g.links.length);
    expect(partitionedLinks.reduce((a, b) => a + b, 0)).toBe(sourceLinks.reduce((a, b) => a + b, 0));
    expect(partitions).toHaveLength(4);
  });

  it("opens BOH for kitchen persona and FOH for cashier by default", () => {
    expect(defaultWorkflowSectionOpen("boh", "kitchen", false)).toBe(true);
    expect(defaultWorkflowSectionOpen("foh", "kitchen", false)).toBe(false);
    expect(defaultWorkflowSectionOpen("foh", "cashier", false)).toBe(true);
    expect(defaultWorkflowSectionOpen("settings", "support_admin", false)).toBe(true);
  });

  it("expands workflow section when pathname is inside it", () => {
    const groups = getFilteredNavGroups({
      fullNavAccess: true,
      isOwner: true,
      navScopeAll: true,
      navPersona: "auto",
      businessType: "RESTAURANT",
    });
    const partitions = partitionNavGroupsByWorkflow(groups);
    const foh = partitions.find((p) => p.section.id === "foh");
    expect(foh).toBeDefined();
    expect(workflowSectionHasActivePath(foh!, "/dashboard/pos/terminal")).toBe(true);
    expect(defaultWorkflowSectionOpen("foh", "cashier", true)).toBe(true);
  });

  it("dashboard nav renders workflow section test ids", () => {
    const source = require("node:fs").readFileSync(
      require("node:path").join(process.cwd(), "components/dashboard/dashboard-nav.tsx"),
      "utf8",
    );
    expect(source).toContain("NavWorkflowSection");
    expect(source).toContain('data-testid={`nav-workflow-${partition.section.id}`}');
    expect(source).toContain("partitionNavGroupsByWorkflow");
  });
});
