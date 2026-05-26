import { buildDeterministicSnapshot } from "@/services/ai/deterministic-insights-service";

/** Operational intelligence entrypoint — deterministic first; optional LLM layers stay behind approvals. */
export async function buildOperationalIntelligenceSnapshot(userId: string) {
  const deterministic = await buildDeterministicSnapshot(userId);
  return {
    openAiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    deterministic,
  };
}
