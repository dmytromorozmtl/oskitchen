/**
 * Quarterly access reviews — scaffolding only (no scheduler yet).
 */
export type AccessReviewItem = {
  subject: string;
  lastReviewedAt: string | null;
  risk: "low" | "medium" | "high";
  recommendation: string;
};

export function suggestedAccessReviewChecklist(): AccessReviewItem[] {
  return [
    {
      subject: "Platform super-admins",
      lastReviewedAt: null,
      risk: "high",
      recommendation: "Validate PLATFORM_* role assignments quarterly; remove dormant accounts.",
    },
    {
      subject: "Workspace owners vs day-to-day managers",
      lastReviewedAt: null,
      risk: "medium",
      recommendation: "Ensure least-privilege staff templates; rotate integration credentials after role changes.",
    },
    {
      subject: "Exports & audit downloads",
      lastReviewedAt: null,
      risk: "high",
      recommendation: "Confirm only ACCOUNTING/OWNER roles receive sensitive financial exports.",
    },
  ];
}
