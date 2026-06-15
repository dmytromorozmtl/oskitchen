import type { CopilotActionType } from "@/lib/ai/copilot-types";

export type CoPilotCategory = "procurement" | "scheduling" | "pricing";

export type CoPilotRecommendation = {
  id: string;
  category: CoPilotCategory;
  severity: "info" | "warning" | "critical";
  title: string;
  summary: string;
  impactLabel: string;
  suggestedAction: string;
  actionType: CopilotActionType;
  payload: Record<string, unknown>;
  actionRoute: string;
};

export type CoPilotDraftView = {
  id: string;
  title: string;
  description: string;
  status: string;
  actionType: string;
  category: CoPilotCategory | null;
  createdAt: string;
};

export type CoPilotDashboard = {
  recommendations: CoPilotRecommendation[];
  pendingDrafts: CoPilotDraftView[];
  approvedDrafts: CoPilotDraftView[];
  counts: {
    procurement: number;
    scheduling: number;
    pricing: number;
    needsApproval: number;
  };
  scannedAt: string;
};
