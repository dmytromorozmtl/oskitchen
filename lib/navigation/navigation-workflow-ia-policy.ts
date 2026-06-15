import type { NavGroupDef } from "@/lib/navigation/nav-types";
import type { NavPersona } from "@/lib/navigation/nav-personas";

/**
 * DES-36 — workflow IA: FOH / BOH / Finance / Settings super-sections in the nav drawer.
 *
 * @see components/dashboard/dashboard-nav.tsx
 * @see lib/navigation/final-navigation-groups.ts
 */

export const NAV_WORKFLOW_IA_POLICY_ID = "navigation-workflow-ia-des36-v1" as const;

export type NavWorkflowSectionId = "foh" | "boh" | "finance" | "settings";

export type NavWorkflowSectionDef = {
  id: NavWorkflowSectionId;
  title: string;
  shortTitle: string;
  description: string;
  groupIds: readonly string[];
};

export const NAV_WORKFLOW_SECTIONS: readonly NavWorkflowSectionDef[] = [
  {
    id: "foh",
    title: "Front of house",
    shortTitle: "FOH",
    description: "Register, orders, guests, and sales channels",
    groupIds: ["core", "commerce", "customers", "marketing"],
  },
  {
    id: "boh",
    title: "Back of house",
    shortTitle: "BOH",
    description: "Kitchen, menus, production, and food safety",
    groupIds: ["operations", "menus", "foodSafety"],
  },
  {
    id: "finance",
    title: "Finance",
    shortTitle: "Finance",
    description: "Inventory, costing, billing, and insights",
    groupIds: ["inventoryFinance", "insights"],
  },
  {
    id: "settings",
    title: "Settings",
    shortTitle: "Settings",
    description: "Setup, admin, staff, and platform tools",
    groupIds: ["setup", "admin", "internal"],
  },
] as const;

export const NAV_WORKFLOW_SECTION_IDS = NAV_WORKFLOW_SECTIONS.map((s) => s.id);

/** Every sidebar group id must map to exactly one workflow section. */
export const NAV_WORKFLOW_GROUP_ASSIGNMENTS: Record<string, NavWorkflowSectionId> =
  Object.fromEntries(
    NAV_WORKFLOW_SECTIONS.flatMap((section) =>
      section.groupIds.map((groupId) => [groupId, section.id]),
    ),
  );

export type NavWorkflowPartition = {
  section: NavWorkflowSectionDef;
  groups: NavGroupDef[];
};

export function partitionNavGroupsByWorkflow(groups: NavGroupDef[]): NavWorkflowPartition[] {
  const byId = new Map(groups.map((g) => [g.id, g]));

  return NAV_WORKFLOW_SECTIONS.map((section) => ({
    section,
    groups: section.groupIds
      .map((id) => byId.get(id))
      .filter((g): g is NavGroupDef => Boolean(g)),
  })).filter((partition) => partition.groups.length > 0);
}

export function workflowSectionHasActivePath(
  partition: NavWorkflowPartition,
  pathname: string,
): boolean {
  return partition.groups.some((group) =>
    group.links.some(
      (link) =>
        pathname === link.href ||
        (link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`)),
    ),
  );
}

const DEFAULT_OPEN_BY_PERSONA: Record<NavPersona, readonly NavWorkflowSectionId[]> = {
  owner: ["foh", "boh"],
  manager: ["foh", "boh"],
  kitchen: ["boh"],
  cashier: ["foh"],
  packer: ["boh"],
  support_admin: ["settings"],
};

export function defaultWorkflowSectionOpen(
  sectionId: NavWorkflowSectionId,
  persona: NavPersona,
  hasActivePath: boolean,
): boolean {
  if (hasActivePath) return true;
  return DEFAULT_OPEN_BY_PERSONA[persona].includes(sectionId);
}

export type NavWorkflowIaAudit = {
  policyId: typeof NAV_WORKFLOW_IA_POLICY_ID;
  sectionCount: number;
  assignedGroupCount: number;
  passed: boolean;
  unassignedGroupIds: string[];
};

export function auditNavigationWorkflowIa(
  groups: readonly NavGroupDef[],
): NavWorkflowIaAudit {
  const groupIds = groups.map((g) => g.id);
  const unassignedGroupIds = groupIds.filter((id) => !NAV_WORKFLOW_GROUP_ASSIGNMENTS[id]);
  return {
    policyId: NAV_WORKFLOW_IA_POLICY_ID,
    sectionCount: NAV_WORKFLOW_SECTIONS.length,
    assignedGroupCount: Object.keys(NAV_WORKFLOW_GROUP_ASSIGNMENTS).length,
    unassignedGroupIds,
    passed: unassignedGroupIds.length === 0 && NAV_WORKFLOW_SECTIONS.length === 4,
  };
}
