import { afterEach, describe, expect, it, vi } from "vitest";

const startSpan = vi.hoisted(() =>
  vi.fn((_opts: unknown, fn: (span: { setStatus: ReturnType<typeof vi.fn> }) => unknown) => {
    const span = { setStatus: vi.fn() };
    return fn(span);
  }),
);

vi.mock("@sentry/nextjs", () => ({ startSpan }));

vi.mock("@/lib/observability/observability-config", () => ({
  resolveObservabilityBackend: vi.fn(() => "NONE"),
}));

import { resolveObservabilityBackend } from "@/lib/observability/observability-config";
import { resolveTracesSampleRate, tracePerformance } from "@/lib/observability/apm";

describe("apm", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    startSpan.mockClear();
  });

  it("resolveTracesSampleRate defaults to 0.1 in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.SENTRY_TRACES_SAMPLE_RATE;
    expect(resolveTracesSampleRate()).toBe(0.1);
  });

  it("tracePerformance skips span when backend is NONE", async () => {
    vi.mocked(resolveObservabilityBackend).mockReturnValue("NONE");
    const result = await tracePerformance("test-op", async () => 42);
    expect(result).toBe(42);
    expect(startSpan).not.toHaveBeenCalled();
  });

  it("tracePerformance uses Sentry span when SENTRY backend", async () => {
    vi.mocked(resolveObservabilityBackend).mockReturnValue("SENTRY");
    const result = await tracePerformance("test-op", async () => "ok");
    expect(result).toBe("ok");
    expect(startSpan).toHaveBeenCalledTimes(1);
  });
});
