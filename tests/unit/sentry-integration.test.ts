import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

const ROOT = join(process.cwd());
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

const getClient = vi.hoisted(() => vi.fn());
const captureException = vi.hoisted(() => vi.fn());
const setTag = vi.hoisted(() => vi.fn());

vi.mock("@sentry/nextjs", () => ({
  getClient,
  withScope: (fn: (scope: { setTag: typeof setTag }) => void) => fn({ setTag }),
  captureException,
  init: vi.fn(),
  startSpan: vi.fn((_opts: unknown, fn: (span: { setStatus: ReturnType<typeof vi.fn> }) => unknown) =>
    fn({ setStatus: vi.fn() }),
  ),
}));

describe("Sentry integration wiring", () => {
  it("documents setup and references instrumentation hook", () => {
    expect(existsSync(join(ROOT, "docs/sentry-setup.md"))).toBe(true);
    expect(existsSync(join(ROOT, "docs/monitoring.md"))).toBe(true);
    const doc = read("docs/sentry-setup.md");
    expect(doc).toContain("instrumentation.ts");
    expect(doc).toContain("SENTRY_DSN");
    expect(doc).toContain("captureErrorSafe");
  });

  it("wraps Next config with withSentryConfig for build-time SDK integration", () => {
    const nextConfig = read("next.config.ts");
    expect(nextConfig).toContain("withSentryConfig");
    expect(nextConfig).toContain("os-kitchen");
    expect(nextConfig).toContain('tunnelRoute: "/monitoring"');
    expect(nextConfig).toContain("automaticVercelMonitors");
    expect(nextConfig).toContain("SENTRY_AUTH_TOKEN");
  });

  it("loads server and edge SDKs from instrumentation register()", () => {
    const instrumentation = read("instrumentation.ts");
    expect(instrumentation).toContain('await import("./sentry.server.config")');
    expect(instrumentation).toContain('await import("./sentry.edge.config")');
    expect(instrumentation).toContain('process.env.NEXT_RUNTIME === "nodejs"');
    expect(instrumentation).toContain('process.env.NEXT_RUNTIME === "edge"');
    expect(instrumentation).toContain("onRequestError");
    expect(instrumentation).toContain("captureRequestError");
  });

  it("guards Sentry.init on DSN env vars in runtime configs", () => {
    for (const rel of ["sentry.server.config.ts", "sentry.edge.config.ts"]) {
      const src = read(rel);
      expect(src).toContain("resolveSentryServerDsn");
      expect(src).toContain("Sentry.init");
      expect(src).toContain("resolveTracesSampleRate");
    }

    const client = read("instrumentation-client.ts");
    expect(client).toContain("process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()");
    expect(client).toContain("Sentry.init");
    expect(client).toContain("replayIntegration");
    expect(client).toContain("feedbackIntegration");
    expect(client).toContain("onRouterTransitionStart");
  });

  it("does not double-init client SDK from root layout", () => {
    const layout = read("app/layout.tsx");
    expect(layout).not.toContain("sentry.client.config");
  });

  it("captures root layout errors in global-error boundary", () => {
    const globalError = read("app/global-error.tsx");
    expect(globalError).toContain("Sentry.captureException");
  });

  it("routes server errors through captureErrorSafe helper", () => {
    const svc = read("services/observability/error-reporting-service.ts");
    expect(svc).toContain("Sentry.captureException");
    expect(svc).toContain("redactObservabilityContext");
    expect(svc).toContain("resolveObservabilityBackend");
  });
});

describe("Sentry observability backend resolution", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers SENTRY when SENTRY_DSN is set", async () => {
    vi.stubEnv("SENTRY_DSN", "https://public@o0.ingest.sentry.io/1");
    vi.stubEnv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318");
    const { resolveObservabilityBackend } = await import("@/lib/observability/observability-config");
    expect(resolveObservabilityBackend()).toBe("SENTRY");
  });

  it("falls back to OTEL when only OTLP endpoint is set", async () => {
    vi.stubEnv("SENTRY_DSN", "");
    vi.stubEnv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318");
    const { resolveObservabilityBackend } = await import("@/lib/observability/observability-config");
    expect(resolveObservabilityBackend()).toBe("OTEL");
  });

  it("returns NONE when no observability env is configured", async () => {
    vi.stubEnv("SENTRY_DSN", "");
    vi.stubEnv("OTEL_EXPORTER_OTLP_ENDPOINT", "");
    const { resolveObservabilityBackend } = await import("@/lib/observability/observability-config");
    expect(resolveObservabilityBackend()).toBe("NONE");
  });
});

describe("Sentry capture pipeline", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    getClient.mockReset();
    captureException.mockClear();
    setTag.mockClear();
  });

  it("no-ops without SENTRY_DSN even when client exists", async () => {
    getClient.mockReturnValue({ getDsn: () => ({}) });
    const { captureErrorSafe } = await import("@/services/observability/error-reporting-service");
    captureErrorSafe(new Error("ignored"), { module: "integration" });
    expect(captureException).not.toHaveBeenCalled();
  });

  it("captures exceptions with redacted sensitive tags when configured", async () => {
    vi.stubEnv("SENTRY_DSN", "https://public@o0.ingest.sentry.io/1");
    getClient.mockReturnValue({ getDsn: () => ({}) });

    const { captureErrorSafe } = await import("@/services/observability/error-reporting-service");
    captureErrorSafe(new Error("checkout failed"), {
      module: "marketplace",
      stripeSecretKey: "sk_live_should_not_leak",
    });

    expect(captureException).toHaveBeenCalledTimes(1);
    expect(setTag).toHaveBeenCalledWith("module", "marketplace");
    expect(setTag).toHaveBeenCalledWith("stripeSecretKey", "[REDACTED]");
  });
});

describe("Sentry health snapshot integration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    getClient.mockReset();
    vi.resetModules();
  });

  it("reports not_configured when SENTRY_DSN is unset", async () => {
    vi.stubEnv("SENTRY_DSN", "");
    getClient.mockReturnValue(undefined);

    vi.doMock("@/lib/db/health", () => ({
      checkDatabaseHealth: vi.fn(async () => ({
        ok: true,
        latencyMs: 1,
        poolerConfigured: true,
      })),
    }));
    vi.doMock("@/services/cron/cron-execution-evidence", () => ({
      loadCriticalCronExecutionHealth: vi.fn(async () => ({
        ok: true,
        productionFailure: null,
        tracked: [],
      })),
    }));

    const { loadExtendedHealthSnapshot } = await import(
      "@/services/observability/health-check-service"
    );
    const snapshot = await loadExtendedHealthSnapshot();
    expect(snapshot.sentryServer).toBe("not_configured");
    expect(snapshot.observability).not.toBe("SENTRY");
  });

  it("reports live when DSN is set and Sentry client initialized", async () => {
    vi.stubEnv("SENTRY_DSN", "https://public@o0.ingest.sentry.io/1");
    getClient.mockReturnValue({ getDsn: () => ({}) });

    vi.doMock("@/lib/db/health", () => ({
      checkDatabaseHealth: vi.fn(async () => ({
        ok: true,
        latencyMs: 1,
        poolerConfigured: true,
      })),
    }));
    vi.doMock("@/services/cron/cron-execution-evidence", () => ({
      loadCriticalCronExecutionHealth: vi.fn(async () => ({
        ok: true,
        productionFailure: null,
        tracked: [],
      })),
    }));

    const { loadExtendedHealthSnapshot } = await import(
      "@/services/observability/health-check-service"
    );
    const snapshot = await loadExtendedHealthSnapshot();
    expect(snapshot.sentryServer).toBe("live");
    expect(snapshot.observability).toBe("SENTRY");
  });

  it("reports dsn_uninitialized when DSN is set but client missing", async () => {
    vi.stubEnv("SENTRY_DSN", "https://public@o0.ingest.sentry.io/1");
    getClient.mockReturnValue(undefined);

    vi.doMock("@/lib/db/health", () => ({
      checkDatabaseHealth: vi.fn(async () => ({
        ok: true,
        latencyMs: 1,
        poolerConfigured: true,
      })),
    }));
    vi.doMock("@/services/cron/cron-execution-evidence", () => ({
      loadCriticalCronExecutionHealth: vi.fn(async () => ({
        ok: true,
        productionFailure: null,
        tracked: [],
      })),
    }));

    const { loadExtendedHealthSnapshot } = await import(
      "@/services/observability/health-check-service"
    );
    const snapshot = await loadExtendedHealthSnapshot();
    expect(snapshot.sentryServer).toBe("dsn_uninitialized");
    expect(snapshot.observability).toBe("SENTRY");
  });
});
