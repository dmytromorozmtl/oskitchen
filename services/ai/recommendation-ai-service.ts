import { buildDeterministicSnapshot } from "@/services/ai/deterministic-insights-service";

export type OperationalRecommendation = {
  title: string;
  summary: string;
  href: string;
  requiresApproval: true;
};

export async function loadOperationalRecommendations(userId: string): Promise<OperationalRecommendation[]> {
  const snap = await buildDeterministicSnapshot(userId);
  return snap.insights.slice(0, 8).map((i) => ({
    title: i.title,
    summary: i.summary,
    href: i.actionRoute ?? "/dashboard/today",
    requiresApproval: true as const,
  }));
}
