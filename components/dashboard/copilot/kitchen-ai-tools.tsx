"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  runAIMenuSuggestionsAction,
  runAIOrderForecastAction,
  runAIWhatToOrderAction,
} from "@/actions/kitchen-ai";

export function KitchenAiTools() {
  const [pending, setPending] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  async function run(
    key: string,
    fn: () => Promise<{ ok: boolean; result?: unknown }>,
  ) {
    setPending(key);
    try {
      const res = await fn();
      if (res.ok) {
        setResult(res.result);
        toast.success("AI analysis complete");
      }
    } catch {
      toast.error("AI request failed");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <p className="text-sm font-medium">Kitchen AI tools</p>
      <p className="text-xs text-muted-foreground">
        Uses OpenAI when OPENAI_API_KEY is set; otherwise deterministic fallbacks.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!!pending}
          onClick={() => void run("order", () => runAIWhatToOrderAction())}
          className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {pending === "order" ? "Thinking…" : "What should I order?"}
        </button>
        <button
          type="button"
          disabled={!!pending}
          onClick={() => void run("menu", () => runAIMenuSuggestionsAction())}
          className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {pending === "menu" ? "Thinking…" : "Menu profitability"}
        </button>
        <button
          type="button"
          disabled={!!pending}
          onClick={() => void run("forecast", () => runAIOrderForecastAction(7))}
          className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {pending === "forecast" ? "Thinking…" : "Forecast next week"}
        </button>
      </div>
      {result ? (
        <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
