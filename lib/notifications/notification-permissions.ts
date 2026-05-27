export type NotificationActorScope = {
  userId: string;
  email: string | null;
  role: string | null;
  platformBypass?: boolean;
};

export type NotificationCapability =
  | "view_overview"
  | "view_logs"
  | "manage_templates"
  | "manage_rules"
  | "manage_alerts"
  | "send_test_email"
  | "retry_failed"
  | "manage_preferences"
  | "manage_provider";

function normalizeRole(role: string | null | undefined): string {
  return (role ?? "").toLowerCase();
}

const GRANTS: Record<string, NotificationCapability[]> = {
  owner: [
    "view_overview",
    "view_logs",
    "manage_templates",
    "manage_rules",
    "manage_alerts",
    "send_test_email",
    "retry_failed",
    "manage_preferences",
    "manage_provider",
  ],
  admin: [
    "view_overview",
    "view_logs",
    "manage_templates",
    "manage_rules",
    "manage_alerts",
    "send_test_email",
    "retry_failed",
    "manage_preferences",
    "manage_provider",
  ],
  manager: [
    "view_overview",
    "view_logs",
    "manage_templates",
    "manage_rules",
    "manage_alerts",
    "send_test_email",
    "retry_failed",
  ],
  customer_service: ["view_overview", "view_logs", "send_test_email"],
  catering_sales: ["view_overview", "view_logs", "send_test_email"],
  kitchen_lead: ["view_overview", "view_logs"],
  staff: ["view_overview"],
};

export function isSuperAdminNotifications(actor: NotificationActorScope): boolean {
  return Boolean(actor.platformBypass);
}

export function canUseNotifications(actor: NotificationActorScope, cap: NotificationCapability): boolean {
  if (isSuperAdminNotifications(actor)) return true;
  const role = normalizeRole(actor.role);
  return (GRANTS[role] ?? []).includes(cap);
}

export function resolveNotificationActorScope(input: {
  userId: string;
  email: string | null;
  profileRole: string | null;
  platformBypass?: boolean;
}): NotificationActorScope {
  return {
    userId: input.userId,
    email: input.email,
    role: input.profileRole,
    platformBypass: input.platformBypass,
  };
}
