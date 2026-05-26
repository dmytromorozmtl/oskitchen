import type { NotificationAudience, NotificationCategory, NotificationChannelKey } from "@/lib/notifications/notification-types";

export type ReminderTriggerKey =
  | "ORDER_CONFIRMED"
  | "ORDER_READY"
  | "PICKUP_REMINDER"
  | "DELIVERY_REMINDER"
  | "PREORDER_DEADLINE"
  | "WEEKLY_MENU_LIVE"
  | "CATERING_QUOTE_FOLLOWUP"
  | "MEAL_PLAN_CYCLE_REMINDER"
  | "ROUTE_DRIVER_REMINDER"
  | "PACKING_DEADLINE_REMINDER"
  | "PRODUCTION_DUE"
  | "LOW_STOCK"
  | "WEBHOOK_FAILED";

export type ReminderRuleDefault = {
  key: string;
  triggerType: ReminderTriggerKey;
  category: NotificationCategory;
  channel: NotificationChannelKey;
  templateKey: string;
  audience: NotificationAudience;
  /**
   * Offset relative to the trigger time:
   *   - positive = AFTER the trigger (e.g. 0m after ORDER_CONFIRMED for instant).
   *   - negative = BEFORE the trigger (e.g. -120m before pickup).
   */
  offsetMinutes: number;
  dedupeWindowMinutes: number;
  description: string;
};

export const REMINDER_RULE_DEFAULTS: ReminderRuleDefault[] = [
  {
    key: "order_confirmation_immediate",
    triggerType: "ORDER_CONFIRMED",
    category: "GUEST_TRANSACTIONAL",
    channel: "EMAIL",
    templateKey: "order_confirmation",
    audience: "CUSTOMER",
    offsetMinutes: 0,
    dedupeWindowMinutes: 24 * 60,
    description: "Sends an order confirmation immediately on confirmation.",
  },
  {
    key: "order_ready_immediate",
    triggerType: "ORDER_READY",
    category: "GUEST_TRANSACTIONAL",
    channel: "EMAIL",
    templateKey: "order_ready",
    audience: "CUSTOMER",
    offsetMinutes: 0,
    dedupeWindowMinutes: 6 * 60,
    description: "Sends the order-ready email when status flips to READY.",
  },
  {
    key: "pickup_reminder_120",
    triggerType: "PICKUP_REMINDER",
    category: "GUEST_TRANSACTIONAL",
    channel: "EMAIL",
    templateKey: "pickup_reminder",
    audience: "CUSTOMER",
    offsetMinutes: -120,
    dedupeWindowMinutes: 6 * 60,
    description: "Reminds guests 2 hours before their pickup window.",
  },
  {
    key: "delivery_reminder_45",
    triggerType: "DELIVERY_REMINDER",
    category: "GUEST_TRANSACTIONAL",
    channel: "EMAIL",
    templateKey: "delivery_reminder",
    audience: "CUSTOMER",
    offsetMinutes: -45,
    dedupeWindowMinutes: 6 * 60,
    description: "Reminds guests 45 minutes before their delivery window.",
  },
  {
    key: "preorder_deadline_120",
    triggerType: "PREORDER_DEADLINE",
    category: "GUEST_REMINDER",
    channel: "EMAIL",
    templateKey: "preorder_deadline_reminder",
    audience: "CUSTOMER",
    offsetMinutes: -120,
    dedupeWindowMinutes: 24 * 60,
    description: "Reminds consenting subscribers 2 hours before the preorder cutoff.",
  },
  {
    key: "weekly_menu_live",
    triggerType: "WEEKLY_MENU_LIVE",
    category: "GUEST_REMINDER",
    channel: "EMAIL",
    templateKey: "weekly_menu_reminder",
    audience: "CUSTOMER",
    offsetMinutes: 0,
    dedupeWindowMinutes: 24 * 60,
    description: "Announces a new weekly menu to consenting subscribers.",
  },
  {
    key: "catering_quote_followup_2d",
    triggerType: "CATERING_QUOTE_FOLLOWUP",
    category: "GUEST_REMINDER",
    channel: "EMAIL",
    templateKey: "catering_quote_followup",
    audience: "CUSTOMER",
    offsetMinutes: 2 * 24 * 60,
    dedupeWindowMinutes: 7 * 24 * 60,
    description: "Sends a quote follow-up 2 days after the quote was sent or viewed.",
  },
  {
    key: "meal_plan_cycle_3d",
    triggerType: "MEAL_PLAN_CYCLE_REMINDER",
    category: "GUEST_REMINDER",
    channel: "EMAIL",
    templateKey: "meal_plan_cycle_reminder",
    audience: "CUSTOMER",
    offsetMinutes: -3 * 24 * 60,
    dedupeWindowMinutes: 24 * 60,
    description: "Reminds plan customers 3 days before their next cycle begins.",
  },
  {
    key: "route_driver_30",
    triggerType: "ROUTE_DRIVER_REMINDER",
    category: "STAFF_TASK",
    channel: "IN_APP",
    templateKey: "internal_task_overdue",
    audience: "DRIVERS",
    offsetMinutes: -30,
    dedupeWindowMinutes: 60,
    description: "Reminds drivers 30 minutes before route start.",
  },
  {
    key: "packing_deadline_120",
    triggerType: "PACKING_DEADLINE_REMINDER",
    category: "STAFF_TASK",
    channel: "IN_APP",
    templateKey: "internal_task_overdue",
    audience: "KITCHEN_LEADS",
    offsetMinutes: -120,
    dedupeWindowMinutes: 60,
    description: "Warns kitchen leads 2 hours before the packing window closes.",
  },
];

export function reminderDefaultsByCategory(category: NotificationCategory): ReminderRuleDefault[] {
  return REMINDER_RULE_DEFAULTS.filter((r) => r.category === category);
}
