import type { PlatformPermission } from "./platform-permissions";

export type PlatformNavItem = {
  href: string;
  label: string;
  permission?: PlatformPermission;
  /** Hidden unless platform founder / super-admin email. */
  founderOnly?: boolean;
};

export type PlatformNavGroup = {
  id: string;
  label: string;
  items: PlatformNavItem[];
};

/** Enterprise-style IA — pages may start as stubs; permissions gate visibility. */
export const PLATFORM_NAV_GROUPS: PlatformNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { href: "/platform/dashboard", label: "Dashboard", permission: "platform:access" },
      { href: "/platform/search", label: "Search", permission: "platform:access" },
      { href: "/platform/health", label: "Health", permission: "platform:access" },
      { href: "/platform/system-health", label: "System health (ops)", permission: "platform:access" },
      { href: "/platform/error-recovery", label: "Error recovery", permission: "platform:access" },
      { href: "/platform/errors", label: "Error signals", permission: "platform:access" },
      { href: "/platform/incidents", label: "Incidents", permission: "platform:access" },
      { href: "/platform/runbooks", label: "Runbooks", permission: "platform:access" },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    items: [
      { href: "/platform/workspaces", label: "Workspaces", permission: "platform:workspaces:read" },
      { href: "/platform/organizations", label: "Organizations", permission: "platform:organizations:read" },
      { href: "/platform/users", label: "Users", permission: "platform:users:read" },
      { href: "/platform/accounts", label: "Accounts", permission: "platform:workspaces:read" },
      { href: "/platform/customer-success", label: "Customer success", permission: "platform:workspaces:read" },
    ],
  },
  {
    id: "support",
    label: "Support",
    items: [
      { href: "/platform/support", label: "Support inbox", permission: "platform:support:read" },
      { href: "/platform/support/queue", label: "Ticket queue", permission: "platform:support:read" },
      { href: "/platform/support/escalations", label: "Escalations", permission: "platform:support:read" },
      { href: "/platform/support/knowledge-base", label: "Knowledge base", permission: "platform:support:read" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { href: "/platform/implementations", label: "Implementations", permission: "platform:workspaces:read" },
      { href: "/platform/pos", label: "POS operations", permission: "platform:workspaces:read" },
      { href: "/platform/go-live", label: "Go-live", permission: "platform:workspaces:read" },
      { href: "/platform/training", label: "Training", permission: "platform:workspaces:read" },
      { href: "/platform/partner", label: "Partner", permission: "platform:organizations:read" },
      { href: "/platform/beta-applications", label: "Beta applications", permission: "platform:organizations:read" },
      { href: "/platform/growth-crm", label: "Growth CRM", permission: "platform:organizations:read" },
      { href: "/platform/demo", label: "Demo scenarios", permission: "platform:workspaces:read" },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    items: [
      { href: "/platform/integrations", label: "Integrations", permission: "platform:integrations:read" },
      { href: "/platform/partner-apps", label: "Partner apps", permission: "platform:integrations:read" },
      { href: "/platform/webhooks", label: "Webhooks", permission: "platform:integrations:read" },
      { href: "/platform/automations", label: "Automations", permission: "platform:automations:read" },
      { href: "/platform/notifications", label: "Notifications", permission: "platform:automations:read" },
      { href: "/platform/jobs", label: "Jobs / queues", permission: "platform:automations:read" },
      { href: "/platform/audit", label: "Audit", permission: "platform:audit:read" },
      {
        href: "/platform/tools",
        label: "Developer tools",
        permission: "platform:tools:run",
        founderOnly: true,
      },
      { href: "/platform/feature-flags", label: "Feature flags", permission: "platform:access" },
    ],
  },
  {
    id: "business",
    label: "Business",
    items: [
      { href: "/platform/billing", label: "Billing", permission: "platform:billing:read" },
      { href: "/platform/partner-billing", label: "Partner billing", permission: "platform:billing:read" },
      { href: "/platform/plans", label: "Plans", permission: "platform:billing:read" },
      { href: "/platform/entitlements", label: "Entitlements", permission: "platform:billing:read" },
      { href: "/platform/trials", label: "Trials", permission: "platform:billing:read" },
      { href: "/platform/revenue", label: "Revenue", permission: "platform:billing:read" },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    items: [
      { href: "/platform/platform-users", label: "Platform users", permission: "platform:users:write" },
      { href: "/platform/roles", label: "Roles & permissions", permission: "platform:users:write" },
      { href: "/platform/settings", label: "Settings", permission: "platform:users:write" },
    ],
  },
];

export function filterNavForPermissions(
  groups: PlatformNavGroup[],
  perms: Set<PlatformPermission>,
  options?: { isFounder?: boolean },
): PlatformNavGroup[] {
  const isFounder = options?.isFounder === true;
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => {
        if (i.founderOnly && !isFounder) return false;
        return !i.permission || perms.has(i.permission);
      }),
    }))
    .filter((g) => g.items.length > 0);
}
