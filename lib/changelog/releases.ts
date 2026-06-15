export type StaticRelease = {
  version: string;
  date: string;
  title: string;
  summary: string;
  highlights: string[];
};

export const STATIC_RELEASES: StaticRelease[] = [
  {
    version: "2026.05.20-polish",
    date: "2026-05-20",
    title: "Final polish — 10 new systems",
    summary:
      "Loyalty history, gift card balance API, migration preview, bulk price undo, EDI confirm, accounting period filters, scheduling staff mapping.",
    highlights: [
      "Loading/error + toast on all 10 feature areas",
      "Public API v1 rate limits + Zod on all routes",
      "POS live loyalty & gift card balances",
    ],
  },
  {
    version: "2026.05.20",
    date: "2026-05-20",
    title: "Gap Analysis complete — 35/35",
    summary: "All competitive gap items shipped: inventory, labor, food safety, accounting, integrations.",
    highlights: [
      "Labor schedule + payroll export",
      "AP automation + bank reconciliation",
      "DoorDash & Grubhub integration scaffolds",
      "Menu engineering + AI forecast",
    ],
  },
  {
    version: "2026.05.19",
    date: "2026-05-19",
    title: "Tier 1 restaurant modules",
    summary: "Tables, tabs, handheld POS, pickup windows, multi-brand command center.",
    highlights: ["KDS v2", "Daily production queue", "QR menu generator"],
  },
  {
    version: "2026.05.17",
    date: "2026-05-17",
    title: "Security & audit hardening",
    summary: "CSP, tenancy, rate limits, 460+ error boundaries.",
    highlights: ["Open redirect fix", "Experimental cron inventory", "648 tests, 0 skipped"],
  },
];

export function latestStaticRelease(): StaticRelease | undefined {
  return STATIC_RELEASES[0];
}
