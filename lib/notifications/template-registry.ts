import { MARKETING_CATEGORIES, type NotificationCategory } from "@/lib/notifications/notification-types";

export type TemplateVariable = {
  key: string;
  label: string;
  example: string;
  required: boolean;
};

export type SystemTemplate = {
  key: string;
  name: string;
  category: NotificationCategory;
  description: string;
  subject: string;
  preheader?: string;
  bodyText: string;
  bodyHtml: string;
  variables: TemplateVariable[];
  marketing: boolean;
};

const V = {
  customer_name: { key: "customer_name", label: "Customer name", example: "Alex", required: true },
  business_name: { key: "business_name", label: "Business name", example: "OS Kitchen", required: false },
  order_number: { key: "order_number", label: "Order number", example: "ORD-12345", required: true },
  pickup_date: { key: "pickup_date", label: "Pickup date", example: "Sat, May 17", required: false },
  pickup_window: { key: "pickup_window", label: "Pickup window", example: "10–12am", required: false },
  delivery_window: { key: "delivery_window", label: "Delivery window", example: "12–1pm", required: false },
  storefront_url: { key: "storefront_url", label: "Storefront URL", example: "https://example.com", required: false },
  support_email: { key: "support_email", label: "Support email", example: "help@example.com", required: false },
  menu_name: { key: "menu_name", label: "Menu name", example: "Week of May 19", required: false },
  deadline: { key: "deadline", label: "Cutoff deadline", example: "Thu 8pm", required: false },
  quote_number: { key: "quote_number", label: "Quote number", example: "Q-204", required: false },
  event_date: { key: "event_date", label: "Event date", example: "Sat, May 17", required: false },
  total: { key: "total", label: "Order total", example: "$54.20", required: false },
  reason: { key: "reason", label: "Reason / detail", example: "Provider returned 502", required: false },
  link: { key: "link", label: "Action link", example: "https://app.example.com/x", required: false },
} satisfies Record<string, TemplateVariable>;

const SHARED_GUEST = [V.customer_name, V.business_name, V.support_email];
const SHARED_INTERNAL = [V.reason, V.link];

function html(body: string): string {
  return body.trim();
}

export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  // ---------- Guest transactional ----------
  {
    key: "order_confirmation",
    name: "Order confirmation",
    category: "GUEST_TRANSACTIONAL",
    description: "Sent immediately after a confirmed order is created.",
    subject: "Your order is confirmed — {{business_name}}",
    bodyText: "Hi {{customer_name}}, we received your order {{order_number}}. Total {{total}}.",
    bodyHtml: html(`<p>Hi {{customer_name}},</p><p>We received your order <strong>{{order_number}}</strong>. Total {{total}}.</p>`),
    variables: [...SHARED_GUEST, V.order_number, V.total, V.pickup_date, V.pickup_window],
    marketing: false,
  },
  {
    key: "order_updated",
    name: "Order updated",
    category: "GUEST_TRANSACTIONAL",
    description: "Sent when an order is updated (re-priced, items changed).",
    subject: "Your order {{order_number}} was updated",
    bodyText: "Hi {{customer_name}}, your order {{order_number}} was updated.",
    bodyHtml: html(`<p>Hi {{customer_name}},</p><p>Your order <strong>{{order_number}}</strong> was updated.</p>`),
    variables: [...SHARED_GUEST, V.order_number],
    marketing: false,
  },
  {
    key: "order_cancelled",
    name: "Order cancelled",
    category: "GUEST_TRANSACTIONAL",
    description: "Sent when an order is cancelled by the operator.",
    subject: "Your order {{order_number}} was cancelled",
    bodyText: "Hi {{customer_name}}, your order {{order_number}} was cancelled. Reason: {{reason}}.",
    bodyHtml: html(`<p>Hi {{customer_name}},</p><p>Your order <strong>{{order_number}}</strong> was cancelled.</p><p>Reason: {{reason}}.</p>`),
    variables: [...SHARED_GUEST, V.order_number, V.reason],
    marketing: false,
  },
  {
    key: "order_ready",
    name: "Order ready",
    category: "GUEST_TRANSACTIONAL",
    description: "Sent when an order is marked ready for pickup or out for delivery.",
    subject: "Your order is ready — {{business_name}}",
    bodyText: "Hi {{customer_name}}, your order {{order_number}} is ready.",
    bodyHtml: html(`<p>Hi {{customer_name}},</p><p>Your order is ready.</p>`),
    variables: [...SHARED_GUEST, V.order_number],
    marketing: false,
  },
  {
    key: "pickup_reminder",
    name: "Pickup reminder",
    category: "GUEST_TRANSACTIONAL",
    description: "Reminder sent X hours before the scheduled pickup window.",
    subject: "Pickup reminder — {{business_name}}",
    bodyText: "Hi {{customer_name}}, your pickup is {{pickup_date}} ({{pickup_window}}).",
    bodyHtml: html(`<p>Hi {{customer_name}},</p><p>Your pickup is <strong>{{pickup_date}}</strong> ({{pickup_window}}).</p>`),
    variables: [...SHARED_GUEST, V.pickup_date, V.pickup_window],
    marketing: false,
  },
  {
    key: "delivery_reminder",
    name: "Delivery reminder",
    category: "GUEST_TRANSACTIONAL",
    description: "Reminder sent X hours before the scheduled delivery window.",
    subject: "Delivery reminder — {{business_name}}",
    bodyText: "Hi {{customer_name}}, your delivery window is {{delivery_window}}.",
    bodyHtml: html(`<p>Hi {{customer_name}},</p><p>Your delivery window is <strong>{{delivery_window}}</strong>.</p>`),
    variables: [...SHARED_GUEST, V.delivery_window],
    marketing: false,
  },
  {
    key: "preorder_deadline_reminder",
    name: "Preorder deadline reminder",
    category: "GUEST_REMINDER",
    description: "Reminder sent before the weekly preorder cutoff.",
    subject: "Preorder closes soon — {{business_name}}",
    bodyText: "Hi {{customer_name}}, the preorder for {{menu_name}} closes {{deadline}}.",
    bodyHtml: html(`<p>Hi {{customer_name}},</p><p>The preorder for <strong>{{menu_name}}</strong> closes <strong>{{deadline}}</strong>.</p>`),
    variables: [...SHARED_GUEST, V.menu_name, V.deadline, V.storefront_url],
    marketing: true,
  },
  {
    key: "weekly_menu_reminder",
    name: "Weekly menu reminder",
    category: "GUEST_REMINDER",
    description: "Marketing-flavored reminder to browse the new weekly menu.",
    subject: "New menu live — {{business_name}}",
    bodyText: "Hi {{customer_name}}, this week's menu is live: {{menu_name}}.",
    bodyHtml: html(`<p>Hi {{customer_name}},</p><p>This week's menu is live: <strong>{{menu_name}}</strong>.</p>`),
    variables: [...SHARED_GUEST, V.menu_name, V.storefront_url],
    marketing: true,
  },
  {
    key: "payment_request",
    name: "Payment / request confirmation",
    category: "GUEST_TRANSACTIONAL",
    description: "Confirms a request-style order without immediate payment.",
    subject: "We received your request — {{business_name}}",
    bodyText: "Hi {{customer_name}}, we received your request {{order_number}}.",
    bodyHtml: html(`<p>Hi {{customer_name}},</p><p>We received your request <strong>{{order_number}}</strong>.</p>`),
    variables: [...SHARED_GUEST, V.order_number],
    marketing: false,
  },
  {
    key: "catering_quote_sent",
    name: "Catering quote sent",
    category: "GUEST_TRANSACTIONAL",
    description: "Sent when a catering quote is shared with the prospect.",
    subject: "Catering quote {{quote_number}} — {{business_name}}",
    bodyText: "Hi {{customer_name}}, your quote {{quote_number}} for {{event_date}} is attached.",
    bodyHtml: html(`<p>Hi {{customer_name}},</p><p>Your quote <strong>{{quote_number}}</strong> for <strong>{{event_date}}</strong> is attached.</p>`),
    variables: [...SHARED_GUEST, V.quote_number, V.event_date],
    marketing: false,
  },
  {
    key: "catering_quote_followup",
    name: "Catering quote follow-up",
    category: "GUEST_REMINDER",
    description: "Follow-up nudge for an outstanding catering quote.",
    subject: "Following up on quote {{quote_number}}",
    bodyText: "Hi {{customer_name}}, just following up on quote {{quote_number}}.",
    bodyHtml: html(`<p>Hi {{customer_name}},</p><p>Just following up on quote <strong>{{quote_number}}</strong>.</p>`),
    variables: [...SHARED_GUEST, V.quote_number],
    marketing: true,
  },
  {
    key: "meal_plan_cycle_reminder",
    name: "Meal plan cycle reminder",
    category: "GUEST_REMINDER",
    description: "Reminder before the next meal plan cycle begins.",
    subject: "Your next meal plan cycle starts soon",
    bodyText: "Hi {{customer_name}}, your next cycle starts {{deadline}}.",
    bodyHtml: html(`<p>Hi {{customer_name}},</p><p>Your next cycle starts <strong>{{deadline}}</strong>.</p>`),
    variables: [...SHARED_GUEST, V.deadline],
    marketing: true,
  },

  // ---------- Internal alerts ----------
  {
    key: "internal_new_order",
    name: "New order alert",
    category: "INTERNAL_ALERT",
    description: "Internal alert when a new high-value or first-time order arrives.",
    subject: "New order {{order_number}}",
    bodyText: "New order {{order_number}} for {{customer_name}}.",
    bodyHtml: html(`<p>New order <strong>{{order_number}}</strong> for {{customer_name}}.</p>`),
    variables: [V.order_number, V.customer_name, V.link],
    marketing: false,
  },
  {
    key: "internal_failed_webhook",
    name: "Failed webhook",
    category: "INTERNAL_ALERT",
    description: "Channel webhook returned a non-2xx status.",
    subject: "Webhook failure",
    bodyText: "A webhook delivery failed. Reason: {{reason}}.",
    bodyHtml: html(`<p>A webhook delivery failed. Reason: <strong>{{reason}}</strong>.</p>`),
    variables: [...SHARED_INTERNAL],
    marketing: false,
  },
  {
    key: "internal_unmapped_product",
    name: "Unmapped product",
    category: "INTERNAL_ALERT",
    description: "A sales-channel order references a product without a mapping.",
    subject: "Unmapped product detected",
    bodyText: "Unmapped product in latest channel import. Reason: {{reason}}.",
    bodyHtml: html(`<p>Unmapped product detected.</p><p>{{reason}}</p>`),
    variables: [...SHARED_INTERNAL],
    marketing: false,
  },
  {
    key: "internal_production_blocker",
    name: "Production blocker",
    category: "INTERNAL_ALERT",
    description: "Production cannot proceed (missing recipe, ingredient).",
    subject: "Production blocker",
    bodyText: "Production blocker: {{reason}}",
    bodyHtml: html(`<p>Production blocker: {{reason}}</p>`),
    variables: [...SHARED_INTERNAL],
    marketing: false,
  },
  {
    key: "internal_cron_escalation",
    name: "Cron escalation",
    category: "INTERNAL_ALERT",
    description: "Critical cron incident requires human follow-up or was rerouted.",
    subject: "Critical cron escalation",
    bodyText: "Critical cron escalation: {{reason}}. {{link}}",
    bodyHtml: html(`<p>Critical cron escalation: <strong>{{reason}}</strong>.</p><p><a href="{{link}}">Open incident</a></p>`),
    variables: [...SHARED_INTERNAL],
    marketing: false,
  },
  {
    key: "internal_incident_remediation",
    name: "Incident remediation follow-up",
    category: "INTERNAL_ALERT",
    description: "Production incident remediation is due soon, overdue, or escalated.",
    subject: "Incident remediation follow-up",
    bodyText: "Production incident remediation follow-up: {{reason}}. {{link}}",
    bodyHtml: html(
      `<p>Production incident remediation follow-up: <strong>{{reason}}</strong>.</p><p><a href="{{link}}">Open incident hub</a></p>`,
    ),
    variables: [...SHARED_INTERNAL],
    marketing: false,
  },
  {
    key: "internal_packing_issue",
    name: "Packing issue",
    category: "INTERNAL_ALERT",
    description: "Packing verification flagged an issue.",
    subject: "Packing issue",
    bodyText: "Packing issue: {{reason}}",
    bodyHtml: html(`<p>Packing issue: {{reason}}</p>`),
    variables: [...SHARED_INTERNAL],
    marketing: false,
  },
  {
    key: "internal_failed_delivery",
    name: "Failed delivery",
    category: "INTERNAL_ALERT",
    description: "Delivery driver returned a failure.",
    subject: "Failed delivery",
    bodyText: "Failed delivery: {{reason}}",
    bodyHtml: html(`<p>Failed delivery: {{reason}}</p>`),
    variables: [...SHARED_INTERNAL],
    marketing: false,
  },
  {
    key: "internal_ingredient_shortage",
    name: "Ingredient shortage",
    category: "INTERNAL_ALERT",
    description: "Stock level dropped below threshold.",
    subject: "Ingredient shortage",
    bodyText: "Ingredient shortage: {{reason}}",
    bodyHtml: html(`<p>Ingredient shortage: {{reason}}</p>`),
    variables: [...SHARED_INTERNAL],
    marketing: false,
  },
  {
    key: "internal_purchase_order_overdue",
    name: "Purchase order overdue",
    category: "INTERNAL_ALERT",
    description: "Outstanding PO past the expected delivery date.",
    subject: "Purchase order overdue",
    bodyText: "PO overdue: {{reason}}",
    bodyHtml: html(`<p>PO overdue: {{reason}}</p>`),
    variables: [...SHARED_INTERNAL],
    marketing: false,
  },
  {
    key: "internal_go_live_blocker",
    name: "Go-live blocker",
    category: "GO_LIVE",
    description: "Go-live readiness signal flipped to required-but-missing.",
    subject: "Go-live blocker",
    bodyText: "Go-live blocker: {{reason}}",
    bodyHtml: html(`<p>Go-live blocker: {{reason}}</p>`),
    variables: [...SHARED_INTERNAL],
    marketing: false,
  },
  {
    key: "internal_task_overdue",
    name: "Task overdue",
    category: "STAFF_TASK",
    description: "A staff task passed its due time.",
    subject: "Task overdue",
    bodyText: "Task overdue: {{reason}}",
    bodyHtml: html(`<p>Task overdue: {{reason}}</p>`),
    variables: [...SHARED_INTERNAL],
    marketing: false,
  },
  {
    key: "internal_billing_issue",
    name: "Billing issue",
    category: "BILLING",
    description: "Billing event surfaced an issue (past_due, action_required).",
    subject: "Billing issue",
    bodyText: "Billing issue: {{reason}}",
    bodyHtml: html(`<p>Billing issue: {{reason}}</p>`),
    variables: [...SHARED_INTERNAL],
    marketing: false,
  },
];

const BY_KEY = new Map(SYSTEM_TEMPLATES.map((t) => [t.key, t]));

export function getSystemTemplate(key: string): SystemTemplate | null {
  return BY_KEY.get(key) ?? null;
}

export function listSystemTemplates(): SystemTemplate[] {
  return [...SYSTEM_TEMPLATES];
}

export function isMarketingTemplate(key: string): boolean {
  const t = BY_KEY.get(key);
  if (!t) return false;
  if (t.marketing) return true;
  return MARKETING_CATEGORIES.includes(t.category);
}
