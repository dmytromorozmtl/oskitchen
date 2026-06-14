import { buildDeterministicSnapshot } from "@/services/ai/deterministic-insights-service";
import { generateDailyBriefingForUser } from "@/services/ai/ai-restaurant-brain";

/** Operational intelligence entrypoint — deterministic first; optional LLM layers stay behind approvals. */
export async function buildOperationalIntelligenceSnapshot(userId: string) {
  const [deterministic, dailyBriefing] = await Promise.all([
    buildDeterministicSnapshot(userId),
    generateDailyBriefingForUser(userId).catch(() => null),
  ]);
  return {
    openAiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    deterministic,
    dailyBriefing,
  };
}
