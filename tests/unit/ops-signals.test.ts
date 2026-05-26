import { afterEach, describe, expect, it, vi } from "vitest";

const captureMessage = vi.hoisted(() => vi.fn());
const captureException = vi.hoisted(() => vi.fn());

vi.mock("@sentry/nextjs", () => ({
  getClient: vi.fn(() => ({ getDsn: () => ({}) })),
  withScope: (fn: (scope: { setTag: (k: string, v: string) => void; setLevel: (l: string) => void }) => void) =>
    fn({ setTag: vi.fn(), setLevel: vi.fn() }),
  captureMessage,
}));

vi.mock("@/services/observability/error-reporting-service", () => ({
  captureErrorSafe: captureException,
}));

vi.mock("@/lib/observability/observability-config", () => ({
  resolveObservabilityBackend: () => "SENTRY",
}));

import { emitOpsSignal, emitWebhookSignatureInvalid } from "@/services/observability/ops-signals";

describe("ops signals", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    captureMessage.mockClear();
    captureException.mockClear();
  });

  it("logs webhook invalid without Sentry when DSN missing", () => {
    emitWebhookSignatureInvalid({ provider: "shopify", connectionId: "c1", topic: "orders/create" });
    expect(captureMessage).not.toHaveBeenCalled();
  });

  it("captures Sentry message when DSN set", () => {
    vi.stubEnv("SENTRY_DSN", "https://public@o0.ingest.sentry.io/1");
    emitOpsSignal("cron_failure", { route: "/api/cron/webhook-jobs" });
    expect(captureMessage).toHaveBeenCalled();
  });
});
