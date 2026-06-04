/**
 * Copilot LLM routing — task-aware provider + model selection.
 *
 * Env:
 * - COPILOT_LLM_PROVIDER=auto|openai|anthropic (default auto)
 * - OPENAI_COPILOT_MODEL, OPENAI_COPILOT_NARRATIVE_MODEL, OPENAI_COPILOT_CHAT_MODEL
 * - ANTHROPIC_API_KEY, ANTHROPIC_COPILOT_MODEL
 */

import { COPILOT_MAX_OUTPUT_TOKENS } from "@/lib/ai/copilot-guardrails";

export const COPILOT_LLM_ROUTING_POLICY_ID = "copilot-llm-routing-v1" as const;

export type CopilotLlmTask = "narrative" | "chat";

export type CopilotLlmProvider = "openai" | "anthropic";

export type CopilotLlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type CopilotLlmRoute = {
  provider: CopilotLlmProvider;
  model: string;
  task: CopilotLlmTask;
};

export type CopilotLlmInvokeResult = {
  ok: boolean;
  text: string | null;
  provider: CopilotLlmProvider;
  model: string;
  statusCode?: number;
  error?: string;
};

type CopilotLlmEnv = {
  COPILOT_LLM_PROVIDER?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  OPENAI_COPILOT_MODEL?: string;
  OPENAI_COPILOT_NARRATIVE_MODEL?: string;
  OPENAI_COPILOT_CHAT_MODEL?: string;
  ANTHROPIC_COPILOT_MODEL?: string;
};

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_ANTHROPIC_MODEL = "claude-3-5-haiku-latest";

function readCopilotLlmEnv(env: NodeJS.ProcessEnv = process.env): CopilotLlmEnv {
  return {
    COPILOT_LLM_PROVIDER: env.COPILOT_LLM_PROVIDER,
    OPENAI_API_KEY: env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
    OPENAI_COPILOT_MODEL: env.OPENAI_COPILOT_MODEL,
    OPENAI_COPILOT_NARRATIVE_MODEL: env.OPENAI_COPILOT_NARRATIVE_MODEL,
    OPENAI_COPILOT_CHAT_MODEL: env.OPENAI_COPILOT_CHAT_MODEL,
    ANTHROPIC_COPILOT_MODEL: env.ANTHROPIC_COPILOT_MODEL,
  };
}

export function isCopilotLlmConfigured(env: CopilotLlmEnv = readCopilotLlmEnv()): boolean {
  return Boolean(env.OPENAI_API_KEY?.trim() || env.ANTHROPIC_API_KEY?.trim());
}

function resolveProviderPreference(env: CopilotLlmEnv): CopilotLlmProvider | null {
  const pref = env.COPILOT_LLM_PROVIDER?.trim().toLowerCase() ?? "auto";
  const hasOpenAi = Boolean(env.OPENAI_API_KEY?.trim());
  const hasAnthropic = Boolean(env.ANTHROPIC_API_KEY?.trim());

  if (pref === "openai") return hasOpenAi ? "openai" : null;
  if (pref === "anthropic") return hasAnthropic ? "anthropic" : null;
  if (hasOpenAi) return "openai";
  if (hasAnthropic) return "anthropic";
  return null;
}

function resolveOpenAiModel(task: CopilotLlmTask, env: CopilotLlmEnv): string {
  const fallback = env.OPENAI_COPILOT_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
  if (task === "narrative") {
    return env.OPENAI_COPILOT_NARRATIVE_MODEL?.trim() || fallback;
  }
  return env.OPENAI_COPILOT_CHAT_MODEL?.trim() || fallback;
}

/** Resolve provider + model for a copilot task. Returns null when no credentials are configured. */
export function resolveCopilotLlmRoute(
  task: CopilotLlmTask,
  env: CopilotLlmEnv = readCopilotLlmEnv(),
): CopilotLlmRoute | null {
  const provider = resolveProviderPreference(env);
  if (!provider) return null;

  const model =
    provider === "anthropic"
      ? env.ANTHROPIC_COPILOT_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL
      : resolveOpenAiModel(task, env);

  return { provider, model, task };
}

export function describeCopilotLlmRoute(
  task: CopilotLlmTask,
  env: CopilotLlmEnv = readCopilotLlmEnv(),
): string | null {
  const route = resolveCopilotLlmRoute(task, env);
  if (!route) return null;
  return `${route.provider} · ${route.model}`;
}

async function invokeOpenAi(
  route: CopilotLlmRoute,
  messages: CopilotLlmMessage[],
  options: { temperature: number; maxTokens: number },
  apiKey: string,
): Promise<CopilotLlmInvokeResult> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: route.model,
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
      }),
    });
    if (!res.ok) {
      return {
        ok: false,
        text: null,
        provider: route.provider,
        model: route.model,
        statusCode: res.status,
        error: `openai_http_${res.status}`,
      };
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return {
      ok: true,
      text: data.choices?.[0]?.message?.content?.trim() ?? null,
      provider: route.provider,
      model: route.model,
    };
  } catch (e) {
    return {
      ok: false,
      text: null,
      provider: route.provider,
      model: route.model,
      error: e instanceof Error ? e.message : "openai_unknown",
    };
  }
}

async function invokeAnthropic(
  route: CopilotLlmRoute,
  messages: CopilotLlmMessage[],
  options: { temperature: number; maxTokens: number },
  apiKey: string,
): Promise<CopilotLlmInvokeResult> {
  const system = messages.find((m) => m.role === "system")?.content;
  const conversation = messages.filter((m) => m.role !== "system");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: route.model,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        system: system ?? undefined,
        messages: conversation.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      }),
    });
    if (!res.ok) {
      return {
        ok: false,
        text: null,
        provider: route.provider,
        model: route.model,
        statusCode: res.status,
        error: `anthropic_http_${res.status}`,
      };
    }
    const data = (await res.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const text =
      data.content
        ?.filter((block) => block.type === "text")
        .map((block) => block.text ?? "")
        .join("\n")
        .trim() ?? null;
    return {
      ok: true,
      text: text || null,
      provider: route.provider,
      model: route.model,
    };
  } catch (e) {
    return {
      ok: false,
      text: null,
      provider: route.provider,
      model: route.model,
      error: e instanceof Error ? e.message : "anthropic_unknown",
    };
  }
}

/** Invoke the configured LLM for a copilot task. */
export async function invokeCopilotLlm(
  route: CopilotLlmRoute,
  messages: CopilotLlmMessage[],
  options: { temperature?: number; maxTokens?: number } = {},
  env: CopilotLlmEnv = readCopilotLlmEnv(),
): Promise<CopilotLlmInvokeResult> {
  const temperature = options.temperature ?? 0.2;
  const maxTokens = options.maxTokens ?? COPILOT_MAX_OUTPUT_TOKENS;

  if (route.provider === "anthropic") {
    const apiKey = env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      return {
        ok: false,
        text: null,
        provider: route.provider,
        model: route.model,
        error: "missing_anthropic_api_key",
      };
    }
    return invokeAnthropic(route, messages, { temperature, maxTokens }, apiKey);
  }

  const apiKey = env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      text: null,
      provider: route.provider,
      model: route.model,
      error: "missing_openai_api_key",
    };
  }
  return invokeOpenAi(route, messages, { temperature, maxTokens }, apiKey);
}
