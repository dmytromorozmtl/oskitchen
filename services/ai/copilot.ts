/**
 * Operations copilot — deterministic insights first; optional OpenAI narrative.
 * Never send secrets. Caller must avoid piping raw PII unless operator intends to.
 */

import type { ProductionForecastResult } from "@/services/forecasting/production-forecast";

export type CopilotInsight = {
  title: string;
  detail: string;
  severity: "info" | "warning" | "risk";
};

export function deterministicCopilotInsights(params: {
  openOrders: number;
  failedWebhooks: number;
  lowMarginProductTitles: string[];
  forecast?: ProductionForecastResult | null;
}): CopilotInsight[] {
  const items: CopilotInsight[] = [];

  items.push({
    title: "Today's throughput",
    detail: `${params.openOrders} orders still active (not completed/cancelled).`,
    severity: params.openOrders > 25 ? "warning" : "info",
  });

  if (params.failedWebhooks > 0) {
    items.push({
      title: "Webhook attention",
      detail: `${params.failedWebhooks} recent webhook rows still unprocessed — check Sales channels.`,
      severity: "risk",
    });
  }

  if (params.lowMarginProductTitles.length > 0) {
    items.push({
      title: "Margin pressure",
      detail: `Review pricing on: ${params.lowMarginProductTitles.slice(0, 5).join(", ")}${params.lowMarginProductTitles.length > 5 ? "…" : ""}.`,
      severity: "warning",
    });
  }

  if (params.forecast?.notes?.length) {
    items.push({
      title: "Forecast disclaimer",
      detail: params.forecast.notes[0] ?? "Forecast is indicative only.",
      severity: "info",
    });
  }

  return items;
}

export async function optionalAiNarrative(params: {
  apiKey: string | undefined;
  bulletSummary: string;
}): Promise<string | null> {
  if (!params.apiKey?.trim()) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a concise kitchen operations assistant. No medical or compliance claims. No secrets.",
          },
          {
            role: "user",
            content: `Summarize these ops bullets in 5 sentences max:\n${params.bulletSummary}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 350,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text ?? null;
  } catch {
    return null;
  }
}
