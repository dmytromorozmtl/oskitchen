export type RetentionPlaybookItem = {
  title: string;
  href: string;
  /** When true, automation must check `marketingConsent` before any campaign send. */
  requiresMarketingConsent: boolean;
};

export function suggestRetentionPlaybooks(atRiskScore: number | null | undefined): RetentionPlaybookItem[] {
  const score = atRiskScore ?? 0;
  if (score < 35) {
    return [
      {
        title: "Log a proactive check-in task",
        href: "/dashboard/tasks/kanban",
        requiresMarketingConsent: false,
      },
    ];
  }
  return [
    {
      title: "Review open follow-ups",
      href: "/dashboard/customers/follow-ups",
      requiresMarketingConsent: false,
    },
    {
      title: "Draft win-back outreach (requires consent)",
      href: "/dashboard/settings/crm",
      requiresMarketingConsent: true,
    },
  ];
}
