/** Static accountant portal onboarding copy — external bookkeeper handoff. */
export const ACCOUNTANT_PORTAL_ONBOARDING = {
  title: "Accountant & bookkeeper portal",
  subtitle:
    "Read-only export hub for external finance partners — not a multi-tenant CPA login or certified GL.",
  checklist: [
    "Confirm COA mapping coverage is 100% before period close.",
    "Download journal CSV/JSON and reconciliation export for the target period.",
    "Review material variances in P&L reconciliation — investigate ≥5% lines.",
    "Post to QuickBooks only after accountant review — OS Kitchen does not auto-post on your behalf.",
    "Bank reconciliation remains operator-owned — portal links are read-only navigation.",
  ],
} as const;
