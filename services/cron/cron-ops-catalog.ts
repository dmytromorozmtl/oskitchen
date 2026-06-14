import type { PlatformRole } from "@prisma/client";

import type { ProductionCronSlug } from "@/services/cron/production-manifest";

export type CronEscalationOwnerTeam =
  | "channels"
  | "storefront"
  | "notifications"
  | "system_health"
  | "meal_plans"
  | "menus"
  | "orders";

export type ProductionCronOpsMetadata = {
  label: string;
  summary: string;
  ownerHref: string;
  ownerLabel: string;
  responseHint: string;
  ownerTeam: CronEscalationOwnerTeam;
  ownerRolePriority: PlatformRole[];
};

export const PRODUCTION_CRON_OPS_CATALOG: Record<ProductionCronSlug, ProductionCronOpsMetadata> = {
  "webhook-jobs": {
    label: "Webhook job drain",
    summary: "Processes queued webhook jobs and keeps async ingestion moving.",
    ownerHref: "/dashboard/sales-channels/webhooks",
    ownerLabel: "Open webhooks",
    responseHint: "Check webhook backlog, cron auth, and downstream provider retries.",
    ownerTeam: "channels",
    ownerRolePriority: ["PLATFORM_ADMIN", "SUPPORT_ADMIN", "IMPLEMENTATION_ADMIN", "SUPER_ADMIN"],
  },
  reminders: {
    label: "Reminder dispatch",
    summary: "Sends scheduled reminder notifications and follow-up nudges.",
    ownerHref: "/dashboard/notifications",
    ownerLabel: "Open notifications",
    responseHint: "Inspect notification templates, delivery provider state, and queue backlog.",
    ownerTeam: "notifications",
    ownerRolePriority: ["SUPPORT_ADMIN", "PLATFORM_ADMIN", "IMPLEMENTATION_ADMIN", "SUPER_ADMIN"],
  },
  "storefront-domain-recheck": {
    label: "Storefront domain recheck",
    summary: "Revalidates storefront custom-domain and DNS state.",
    ownerHref: "/dashboard/storefront/launch",
    ownerLabel: "Open storefront launch",
    responseHint: "Review DNS verification and storefront domain configuration drift.",
    ownerTeam: "storefront",
    ownerRolePriority: ["IMPLEMENTATION_ADMIN", "PLATFORM_ADMIN", "SUPPORT_ADMIN", "SUPER_ADMIN"],
  },
  "storefront-cart-recovery": {
    label: "Storefront cart recovery",
    summary: "Runs abandoned-cart recovery and unsubscribe-safe follow-ups.",
    ownerHref: "/dashboard/storefront/cart-recovery",
    ownerLabel: "Open cart recovery",
    responseHint: "Verify recovery automation settings, email provider health, and suppression rules.",
    ownerTeam: "storefront",
    ownerRolePriority: ["IMPLEMENTATION_ADMIN", "PLATFORM_ADMIN", "SUPPORT_ADMIN", "SUPER_ADMIN"],
  },
  "storefront-theme-publish": {
    label: "Storefront theme publish",
    summary: "Promotes scheduled storefront theme changes and publish jobs.",
    ownerHref: "/dashboard/storefront/advanced",
    ownerLabel: "Open storefront advanced",
    responseHint: "Check scheduled publish timestamps and theme draft/publish configuration.",
    ownerTeam: "storefront",
    ownerRolePriority: ["IMPLEMENTATION_ADMIN", "PLATFORM_ADMIN", "SUPPORT_ADMIN", "SUPER_ADMIN"],
  },
  "storefront-team-invite-reminders": {
    label: "Storefront team invite reminders",
    summary: "Reminds invited storefront collaborators before invite expiry.",
    ownerHref: "/dashboard/storefront/settings",
    ownerLabel: "Open storefront settings",
    responseHint: "Inspect pending invite state and outbound email delivery health.",
    ownerTeam: "storefront",
    ownerRolePriority: ["IMPLEMENTATION_ADMIN", "PLATFORM_ADMIN", "SUPPORT_ADMIN", "SUPER_ADMIN"],
  },
  "storefront-webhook-retention": {
    label: "Storefront webhook retention",
    summary: "Prunes storefront webhook audit rows and retention-managed evidence.",
    ownerHref: "/dashboard/sales-channels/webhooks",
    ownerLabel: "Open webhooks",
    responseHint: "Review webhook retention backlog and database cleanup cadence.",
    ownerTeam: "storefront",
    ownerRolePriority: ["IMPLEMENTATION_ADMIN", "PLATFORM_ADMIN", "SUPPORT_ADMIN", "SUPER_ADMIN"],
  },
  "storefront-invite-audit-retention": {
    label: "Invite audit retention",
    summary: "Applies retention to storefront invite audit evidence.",
    ownerHref: "/dashboard/storefront/settings",
    ownerLabel: "Open storefront settings",
    responseHint: "Confirm invite audit retention windows and cleanup execution.",
    ownerTeam: "storefront",
    ownerRolePriority: ["IMPLEMENTATION_ADMIN", "PLATFORM_ADMIN", "SUPPORT_ADMIN", "SUPER_ADMIN"],
  },
  "storefront-ga4-parity": {
    label: "Storefront GA4 parity",
    summary: "Validates storefront analytics parity and event completeness.",
    ownerHref: "/dashboard/storefront/settings",
    ownerLabel: "Open storefront settings",
    responseHint: "Inspect analytics setup, parity lag, and event delivery gaps.",
    ownerTeam: "storefront",
    ownerRolePriority: ["IMPLEMENTATION_ADMIN", "PLATFORM_ADMIN", "SUPPORT_ADMIN", "SUPER_ADMIN"],
  },
  "storefront-edge-sync": {
    label: "Storefront edge sync",
    summary: "Flushes storefront experiment and edge-config synchronization jobs.",
    ownerHref: "/dashboard/storefront/settings/experiments",
    ownerLabel: "Open experiments",
    responseHint: "Review edge sync backlog, Edge Config connectivity, and experiment publish state.",
    ownerTeam: "storefront",
    ownerRolePriority: ["IMPLEMENTATION_ADMIN", "PLATFORM_ADMIN", "SUPPORT_ADMIN", "SUPER_ADMIN"],
  },
  "pilot-daily-health": {
    label: "Pilot daily health",
    summary: "Produces daily pilot health evidence and readiness snapshots.",
    ownerHref: "/dashboard/system-health",
    ownerLabel: "Open system health",
    responseHint: "Inspect pilot health generation inputs and daily reporting pipeline.",
    ownerTeam: "system_health",
    ownerRolePriority: ["PLATFORM_ADMIN", "SUPER_ADMIN", "SUPPORT_ADMIN", "IMPLEMENTATION_ADMIN"],
  },
  "meal-plan-auto-renew": {
    label: "Meal plan auto-renew",
    summary: "Generates recurring meal-plan cycles and renewal follow-up.",
    ownerHref: "/dashboard/meal-plans/cycles",
    ownerLabel: "Open meal plan cycles",
    responseHint: "Check renewal schedules, customer eligibility, and generated cycle backlog.",
    ownerTeam: "meal_plans",
    ownerRolePriority: ["IMPLEMENTATION_ADMIN", "PLATFORM_ADMIN", "SUPPORT_ADMIN", "SUPER_ADMIN"],
  },
  "menu-rotation": {
    label: "Menu rotation",
    summary: "Applies scheduled menu rotations and availability transitions.",
    ownerHref: "/dashboard/menus",
    ownerLabel: "Open menus",
    responseHint: "Verify scheduled menu rotation windows and product availability rules.",
    ownerTeam: "menus",
    ownerRolePriority: ["IMPLEMENTATION_ADMIN", "PLATFORM_ADMIN", "SUPPORT_ADMIN", "SUPER_ADMIN"],
  },
  "doordash-sync": {
    label: "DoorDash sync",
    summary: "Imports DoorDash orders and keeps channel state aligned.",
    ownerHref: "/dashboard/sales-channels/health",
    ownerLabel: "Open channel health",
    responseHint: "Review DoorDash credentials, sync lag, and channel import errors.",
    ownerTeam: "channels",
    ownerRolePriority: ["PLATFORM_ADMIN", "SUPPORT_ADMIN", "IMPLEMENTATION_ADMIN", "SUPER_ADMIN"],
  },
  "grubhub-sync": {
    label: "Grubhub sync",
    summary: "Imports Grubhub orders and keeps channel state aligned.",
    ownerHref: "/dashboard/sales-channels/health",
    ownerLabel: "Open channel health",
    responseHint: "Review Grubhub credentials, sync lag, and channel import errors.",
    ownerTeam: "channels",
    ownerRolePriority: ["PLATFORM_ADMIN", "SUPPORT_ADMIN", "IMPLEMENTATION_ADMIN", "SUPER_ADMIN"],
  },
  "kds-overdue-alerts": {
    label: "KDS overdue alerts",
    summary: "Flags kitchen tickets and orders that are running overdue.",
    ownerHref: "/dashboard/orders",
    ownerLabel: "Open orders",
    responseHint: "Inspect kitchen routing, overdue thresholds, and current order backlog.",
    ownerTeam: "orders",
    ownerRolePriority: ["IMPLEMENTATION_ADMIN", "PLATFORM_ADMIN", "SUPPORT_ADMIN", "SUPER_ADMIN"],
  },
  "incident-remediation-reminders": {
    label: "Incident remediation reminders",
    summary: "Reminds remediation owners and escalates overdue production incident follow-up.",
    ownerHref: "/platform/incidents",
    ownerLabel: "Open incidents",
    responseHint: "Inspect remediation due dates, overdue follow-up, and owner assignments.",
    ownerTeam: "system_health",
    ownerRolePriority: ["PLATFORM_ADMIN", "SUPER_ADMIN", "SUPPORT_ADMIN", "IMPLEMENTATION_ADMIN"],
  },
  "shopify-b2b-dunning": {
    label: "Shopify B2B dunning",
    summary: "Runs B2B AR operator digest and auto-reminder cadence for overdue invoices.",
    ownerHref: "/dashboard/receivables",
    ownerLabel: "Open receivables",
    responseHint: "Review B2B dunning settings, reminder templates, and Shopify mirror state.",
    ownerTeam: "channels",
    ownerRolePriority: ["PLATFORM_ADMIN", "SUPPORT_ADMIN", "IMPLEMENTATION_ADMIN", "SUPER_ADMIN"],
  },
  "shopify-b2b-collector-digest": {
    label: "Shopify B2B collector digest",
    summary: "Delivers collector queue digest for assigned B2B AR follow-up.",
    ownerHref: "/dashboard/receivables",
    ownerLabel: "Open receivables",
    responseHint: "Inspect collector assignments, SLA breaches, and digest delivery health.",
    ownerTeam: "channels",
    ownerRolePriority: ["PLATFORM_ADMIN", "SUPPORT_ADMIN", "IMPLEMENTATION_ADMIN", "SUPER_ADMIN"],
  },
  "outbound-webhook-deliveries": {
    label: "Outbound webhook deliveries",
    summary: "Drains the outbound webhook delivery queue and retries failed fan-out.",
    ownerHref: "/dashboard/sales-channels/webhooks",
    ownerLabel: "Open webhooks",
    responseHint: "Check outbound webhook backlog, signing secrets, and partner endpoint health.",
    ownerTeam: "channels",
    ownerRolePriority: ["PLATFORM_ADMIN", "SUPPORT_ADMIN", "IMPLEMENTATION_ADMIN", "SUPER_ADMIN"],
  },
  "cross-channel-inventory-reconciliation": {
    label: "Cross-channel inventory reconciliation",
    summary: "Reconciles inventory counts across POS, storefront, and marketplace channels.",
    ownerHref: "/dashboard/inventory/cross-channel",
    ownerLabel: "Open inventory",
    responseHint: "Review channel sync lag, stock discrepancies, and reconciliation job errors.",
    ownerTeam: "channels",
    ownerRolePriority: ["PLATFORM_ADMIN", "SUPPORT_ADMIN", "IMPLEMENTATION_ADMIN", "SUPER_ADMIN"],
  },
  "multi-location-weekly-report": {
    label: "Multi-location weekly report",
    summary: "Generates and emails consolidated weekly performance reports across locations.",
    ownerHref: "/dashboard/reports",
    ownerLabel: "Open reports",
    responseHint: "Inspect report generation inputs, email delivery, and location data completeness.",
    ownerTeam: "system_health",
    ownerRolePriority: ["PLATFORM_ADMIN", "SUPER_ADMIN", "SUPPORT_ADMIN", "IMPLEMENTATION_ADMIN"],
  },
};

export function getProductionCronOpsMetadata(slug: ProductionCronSlug): ProductionCronOpsMetadata {
  return PRODUCTION_CRON_OPS_CATALOG[slug];
}
