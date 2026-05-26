export type LifecycleAutomationDefinition = {
  key: string;
  label: string;
  description: string;
  defaultHref: string;
  requiresMarketingConsent: boolean;
};

/** Catalog only — execution stays in notification / playbook engines with explicit consent gates. */
export const LIFECYCLE_AUTOMATION_DEFINITIONS: LifecycleAutomationDefinition[] = [
  {
    key: "preorder_reminder",
    label: "Preorder reminder",
    description: "Nudge customers with upcoming pickup windows.",
    defaultHref: "/dashboard/notifications/settings",
    requiresMarketingConsent: true,
  },
  {
    key: "quote_follow_up",
    label: "Catering quote follow-up",
    description: "Task-driven follow ups for open quotes.",
    defaultHref: "/dashboard/catering-quotes/follow-ups",
    requiresMarketingConsent: false,
  },
  {
    key: "subscription_nudge",
    label: "Subscription nudge",
    description: "Surface subscription candidates — never auto-enroll.",
    defaultHref: "/dashboard/meal-plans/active",
    requiresMarketingConsent: true,
  },
];
