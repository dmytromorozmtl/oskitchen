import { afterEach, describe, expect, it, vi } from "vitest";

const captureException = vi.hoisted(() => vi.fn());

vi.mock("@sentry/nextjs", () => ({
  getClient: vi.fn(() => ({ getDsn: () => ({}) })),
  withScope: (fn: (scope: { setTag: (k: string, v: string) => void }) => void) =>
    fn({ setTag: vi.fn() }),
  captureException,
}));

import { captureErrorSafe } from "@/services/observability/error-reporting-service";

describe("captureErrorSafe", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    captureException.mockClear();
  });

  it("does not capture without SENTRY_DSN", () => {
    captureErrorSafe(new Error("x"), { module: "unit" });
    expect(captureException).not.toHaveBeenCalled();
  });

  it("captures when SENTRY_DSN is set and client exists", () => {
    vi.stubEnv("SENTRY_DSN", "https://public@o0.ingest.sentry.io/1");
    captureErrorSafe(new Error("boom"), { module: "unit" });
    expect(captureException).toHaveBeenCalledTimes(1);
  });
});
