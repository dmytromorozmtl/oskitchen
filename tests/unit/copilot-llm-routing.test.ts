import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COPILOT_LLM_ROUTING_POLICY_ID,
  describeCopilotLlmRoute,
  isCopilotLlmConfigured,
  resolveCopilotLlmRoute,
} from "@/lib/ai/copilot-llm-routing";

const ROOT = process.cwd();

describe("copilot LLM routing", () => {
  it("detects configured providers", () => {
    expect(isCopilotLlmConfigured({ OPENAI_API_KEY: "sk-test" })).toBe(true);
    expect(isCopilotLlmConfigured({ ANTHROPIC_API_KEY: "sk-ant-test" })).toBe(true);
    expect(isCopilotLlmConfigured({})).toBe(false);
  });

  it("auto-prefers OpenAI when both keys exist", () => {
    const route = resolveCopilotLlmRoute("chat", {
      OPENAI_API_KEY: "sk-test",
      ANTHROPIC_API_KEY: "sk-ant-test",
      COPILOT_LLM_PROVIDER: "auto",
    });
    expect(route?.provider).toBe("openai");
    expect(route?.model).toBe("gpt-4o-mini");
  });

  it("routes narrative and chat to distinct OpenAI models when configured", () => {
    const env = {
      OPENAI_API_KEY: "sk-test",
      OPENAI_COPILOT_NARRATIVE_MODEL: "gpt-4o-mini",
      OPENAI_COPILOT_CHAT_MODEL: "gpt-4o",
    };
    expect(resolveCopilotLlmRoute("narrative", env)?.model).toBe("gpt-4o-mini");
    expect(resolveCopilotLlmRoute("chat", env)?.model).toBe("gpt-4o");
  });

  it("honours anthropic provider preference", () => {
    const route = resolveCopilotLlmRoute("narrative", {
      ANTHROPIC_API_KEY: "sk-ant-test",
      COPILOT_LLM_PROVIDER: "anthropic",
      ANTHROPIC_COPILOT_MODEL: "claude-3-5-haiku-latest",
    });
    expect(route?.provider).toBe("anthropic");
    expect(route?.model).toBe("claude-3-5-haiku-latest");
    expect(describeCopilotLlmRoute("narrative", {
      ANTHROPIC_API_KEY: "sk-ant-test",
      COPILOT_LLM_PROVIDER: "anthropic",
    })).toBe("anthropic · claude-3-5-haiku-latest");
  });

  it("wires routing into copilot service", () => {
    const service = readFileSync(join(ROOT, "services/ai/copilot-service.ts"), "utf8");
    expect(service).toContain("invokeCopilotLlm");
    expect(service).toContain("resolveCopilotLlmRoute");
    expect(service).not.toContain('model: DEFAULT_MODEL');
    expect(COPILOT_LLM_ROUTING_POLICY_ID).toBe("copilot-llm-routing-v1");
  });
});
