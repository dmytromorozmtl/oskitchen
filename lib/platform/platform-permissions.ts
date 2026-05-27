import type { PlatformRole } from "@prisma/client";

/** Fine-grained internal permissions (string keys for policy engine). */
export type PlatformPermission =
  | "platform:access"
  | "platform:users:read"
  | "platform:users:write"
  | "platform:workspaces:read"
  | "platform:workspaces:write"
  | "platform:organizations:read"
  | "platform:organizations:write"
  | "platform:support:read"
  | "platform:support:reply"
  | "platform:support:assign"
  | "platform:support:escalate"
  | "platform:billing:read"
  | "platform:billing:write"
  | "platform:entitlements:write"
  | "platform:integrations:read"
  | "platform:integrations:repair"
  | "platform:automations:read"
  | "platform:automations:repair"
  | "platform:audit:read"
  | "platform:tools:run"
  | "platform:impersonation:start"
  | "platform:impersonation:end"
  | "platform:support-session:start"
  | "platform:support-session:end"
  | "platform:dangerous-actions:run"
  | "platform:feature-flags:write";

const ALL: readonly PlatformPermission[] = [
  "platform:access",
  "platform:users:read",
  "platform:users:write",
  "platform:workspaces:read",
  "platform:workspaces:write",
  "platform:organizations:read",
  "platform:organizations:write",
  "platform:support:read",
  "platform:support:reply",
  "platform:support:assign",
  "platform:support:escalate",
  "platform:billing:read",
  "platform:billing:write",
  "platform:entitlements:write",
  "platform:integrations:read",
  "platform:integrations:repair",
  "platform:automations:read",
  "platform:automations:repair",
  "platform:audit:read",
  "platform:tools:run",
  "platform:impersonation:start",
  "platform:impersonation:end",
  "platform:support-session:start",
  "platform:support-session:end",
  "platform:dangerous-actions:run",
  "platform:feature-flags:write",
];

const READ_SET: readonly PlatformPermission[] = [
  "platform:access",
  "platform:users:read",
  "platform:workspaces:read",
  "platform:organizations:read",
  "platform:support:read",
  "platform:billing:read",
  "platform:integrations:read",
  "platform:automations:read",
  "platform:audit:read",
];

const SUPPORT_WRITE: readonly PlatformPermission[] = [
  ...READ_SET,
  "platform:support:reply",
  "platform:support:assign",
  "platform:support:escalate",
];

const OPS_ADMIN: readonly PlatformPermission[] = [
  ...SUPPORT_WRITE,
  "platform:users:write",
  "platform:workspaces:write",
  "platform:organizations:write",
  "platform:billing:write",
  "platform:entitlements:write",
  "platform:integrations:repair",
  "platform:automations:repair",
  "platform:tools:run",
  "platform:feature-flags:write",
];

function addAll(set: Set<PlatformPermission>, list: readonly PlatformPermission[]) {
  for (const p of list) set.add(p);
}

/** Union permissions for all assigned Prisma platform roles. */
export function resolvePlatformPermissions(
  _email: string | null | undefined,
  roles: readonly PlatformRole[],
): Set<PlatformPermission> {
  const set = new Set<PlatformPermission>();
  if (roles.includes("SUPER_ADMIN")) {
    addAll(set, ALL);
    return set;
  }
  if (roles.includes("PLATFORM_ADMIN")) {
    addAll(set, [
      ...OPS_ADMIN,
      "platform:impersonation:start",
      "platform:impersonation:end",
      "platform:support-session:start",
      "platform:support-session:end",
    ]);
  }
  if (roles.includes("SUPPORT_ADMIN")) {
    addAll(set, SUPPORT_WRITE);
    set.add("platform:impersonation:end");
    set.add("platform:support-session:start");
    set.add("platform:support-session:end");
  }
  if (roles.includes("IMPLEMENTATION_ADMIN")) {
    addAll(set, READ_SET);
    set.add("platform:workspaces:write");
    set.add("platform:tools:run");
  }
  if (roles.includes("GROWTH_ADMIN")) {
    addAll(set, READ_SET);
    set.add("platform:organizations:write");
  }
  if (roles.includes("PARTNER_ADMIN")) {
    addAll(set, READ_SET);
  }
  if (roles.includes("STANDARD_USER")) {
    addAll(set, READ_SET);
  }
  return set;
}

export function hasPlatformPermission(
  perms: Set<PlatformPermission>,
  required: PlatformPermission,
): boolean {
  return perms.has(required);
}
