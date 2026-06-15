/**
 * Pure helpers for AI action drafts (Blueprint P2-106).
 */

export type AiActionDraftType =
  | "create_po"
  | "flag_low_margin"
  | "draft_schedule"
  | "daily_briefing"
  | "commission_spike";

export type AiActionDraftTemplate = {
  draftType: AiActionDraftType;
  label: string;
  description: string;
  category: "purchasing_schedule" | "margin_commission" | "daily_briefing";
  payloadShape: string;
  requiresApproval: boolean;
};

export type AiActionDraftRow = {
  id: string;
  draftType: AiActionDraftType;
  label: string;
  title: string;
  summary: string;
  status: string;
  sourceReference: string;
  createdAt: string;
};

export type AiActionDraftsReport = {
  draftTypeCount: number;
  purchasingScheduleCount: number;
  marginCommissionCount: number;
  dailyBriefingCount: number;
  pendingApprovalCount: number;
  templates: AiActionDraftTemplate[];
  purchasingScheduleDrafts: AiActionDraftRow[];
  marginCommissionDrafts: AiActionDraftRow[];
  dailyBriefingDrafts: AiActionDraftRow[];
};

export const AI_ACTION_DRAFT_TEMPLATES: AiActionDraftTemplate[] = [
  {
    draftType: "create_po",
    label: "Create PO",
    description: "Draft a purchase order for low-stock ingredients or vendor reorder.",
    category: "purchasing_schedule",
    payloadShape: "{ supplierId, lines: [{ ingredientId, quantity, unitPrice }] }",
    requiresApproval: true,
  },
  {
    draftType: "draft_schedule",
    label: "Draft schedule",
    description: "Draft a labor or prep schedule adjustment for the next service period.",
    category: "purchasing_schedule",
    payloadShape: "{ shiftDate, station, headcount, notes }",
    requiresApproval: true,
  },
  {
    draftType: "flag_low_margin",
    label: "Flag low margin",
    description: "Flag menu items where food cost exceeds target margin threshold.",
    category: "margin_commission",
    payloadShape: "{ productId, currentMarginPercent, targetMarginPercent, recommendation }",
    requiresApproval: true,
  },
  {
    draftType: "commission_spike",
    label: "Commission spike",
    description: "Alert when delivery channel commission exceeds typical weekly average.",
    category: "margin_commission",
    payloadShape: "{ channel, commissionPercent, avgCommissionPercent, orderCount }",
    requiresApproval: true,
  },
  {
    draftType: "daily_briefing",
    label: "Daily briefing",
    description: "Narrative draft: yesterday performance, channel mix, and suggested next actions.",
    category: "daily_briefing",
    payloadShape: "{ narrative, highlights: string[], nextSteps: string[] }",
    requiresApproval: false,
  },
];

export function buildAiActionDraftTemplates(): AiActionDraftTemplate[] {
  return [...AI_ACTION_DRAFT_TEMPLATES];
}

export function categorizeDraftRow(
  draftType: AiActionDraftType,
): AiActionDraftTemplate["category"] {
  const template = AI_ACTION_DRAFT_TEMPLATES.find((t) => t.draftType === draftType);
  return template?.category ?? "purchasing_schedule";
}

export function buildAiActionDraftRows(
  rows: Array<{
    id: string;
    draftType: AiActionDraftType;
    title: string;
    summary: string;
    status: string;
    sourceReference: string;
    createdAt: string;
  }>,
): AiActionDraftRow[] {
  return rows.map((row) => {
    const template = AI_ACTION_DRAFT_TEMPLATES.find((t) => t.draftType === row.draftType);
    return {
      ...row,
      label: template?.label ?? row.draftType,
    };
  });
}

export function splitDraftsByCategory(rows: AiActionDraftRow[]): {
  purchasingScheduleDrafts: AiActionDraftRow[];
  marginCommissionDrafts: AiActionDraftRow[];
  dailyBriefingDrafts: AiActionDraftRow[];
} {
  return {
    purchasingScheduleDrafts: rows.filter((r) => categorizeDraftRow(r.draftType) === "purchasing_schedule"),
    marginCommissionDrafts: rows.filter((r) => categorizeDraftRow(r.draftType) === "margin_commission"),
    dailyBriefingDrafts: rows.filter((r) => categorizeDraftRow(r.draftType) === "daily_briefing"),
  };
}

export function buildAiActionDraftsReport(input: {
  rows: AiActionDraftRow[];
}): AiActionDraftsReport {
  const templates = buildAiActionDraftTemplates();
  const { purchasingScheduleDrafts, marginCommissionDrafts, dailyBriefingDrafts } =
    splitDraftsByCategory(input.rows);
  const pendingApprovalCount = input.rows.filter(
    (r) => r.status === "NEEDS_APPROVAL" || r.status === "DRAFT",
  ).length;

  return {
    draftTypeCount: templates.length,
    purchasingScheduleCount: purchasingScheduleDrafts.length,
    marginCommissionCount: marginCommissionDrafts.length,
    dailyBriefingCount: dailyBriefingDrafts.length,
    pendingApprovalCount,
    templates,
    purchasingScheduleDrafts,
    marginCommissionDrafts,
    dailyBriefingDrafts,
  };
}

/** Demo fixture — deterministic AI action drafts without DB. */
export const AI_ACTION_DRAFTS_DEMO_ROWS = [
  {
    id: "draft-001",
    draftType: "create_po" as const,
    title: "Create PO — Sysco chicken restock",
    summary: "Chicken breast below par (12 lb on hand, 40 lb needed). Draft PO for 2 cases.",
    status: "NEEDS_APPROVAL",
    sourceReference: "inventory:ing-chicken",
    createdAt: "2026-03-10T08:00:00Z",
  },
  {
    id: "draft-002",
    draftType: "draft_schedule" as const,
    title: "Draft schedule — Saturday lunch prep",
    summary: "Add 1 prep cook 7–11 AM based on catering +48% forecast vs last Saturday.",
    status: "NEEDS_APPROVAL",
    sourceReference: "labor:forecast-sat",
    createdAt: "2026-03-10T07:30:00Z",
  },
  {
    id: "draft-003",
    draftType: "flag_low_margin" as const,
    title: "Flag low margin — House fries",
    summary: "Food cost 58% vs 35% target. 210 orders last 30 days — review portion or price.",
    status: "NEEDS_APPROVAL",
    sourceReference: "costing:prod-fries",
    createdAt: "2026-03-09T18:00:00Z",
  },
  {
    id: "draft-004",
    draftType: "commission_spike" as const,
    title: "Commission spike — DoorDash",
    summary: "DoorDash commission 32.1% this week vs 28.4% typical. 47 orders — review promo mix.",
    status: "NEEDS_APPROVAL",
    sourceReference: "channels:doordash",
    createdAt: "2026-03-09T17:00:00Z",
  },
  {
    id: "draft-005",
    draftType: "daily_briefing" as const,
    title: "Daily briefing — March 10",
    summary: "Yesterday +12%. DoorDash orders up 18%. Next: review menu mix — fries margin flagged.",
    status: "DRAFT",
    sourceReference: "briefing:daily",
    createdAt: "2026-03-10T06:00:00Z",
  },
] as const;

export function buildAiActionDraftsDemoReport(): AiActionDraftsReport {
  const rows = buildAiActionDraftRows([...AI_ACTION_DRAFTS_DEMO_ROWS]);
  return buildAiActionDraftsReport({ rows });
}
