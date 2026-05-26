import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@sentry/nextjs", () => ({
  getClient: vi.fn(() => null),
  withScope: (fn: (scope: { setTag: (k: string, v: string) => void }) => void) =>
    fn({ setTag: vi.fn() }),
  captureMessage: vi.fn(),
}));

vi.mock("@/services/observability/ops-signals", () => ({
  emitCronFailure: vi.fn(),
}));

const recordCronExecutionStarted = vi.hoisted(() => vi.fn());
const recordCronExecutionFinished = vi.hoisted(() => vi.fn());

vi.mock("@/services/cron/cron-execution-evidence", () => ({
  recordCronExecutionStarted,
  recordCronExecutionFinished,
}));

import { runCronRoute } from "@/lib/api/run-cron";

describe("runCronRoute production gate", () => {
  const prevEnv = process.env.NODE_ENV;
  const prevSecret = process.env.CRON_SECRET;
  const prevExperimental = process.env.ENABLE_EXPERIMENTAL_CRONS;

  beforeEach(() => {
    process.env.CRON_SECRET = "test-secret";
    delete process.env.ENABLE_EXPERIMENTAL_CRONS;
  });

  afterEach(() => {
    process.env.NODE_ENV = prevEnv;
    if (prevSecret) process.env.CRON_SECRET = prevSecret;
    else delete process.env.CRON_SECRET;
    if (prevExperimental) process.env.ENABLE_EXPERIMENTAL_CRONS = prevExperimental;
    else delete process.env.ENABLE_EXPERIMENTAL_CRONS;
    recordCronExecutionStarted.mockClear();
    recordCronExecutionFinished.mockClear();
  });

  it("returns 404 for experimental cron in production when flag is off", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const req = new Request("http://localhost/api/cron/multiverse-causality-lock-crdt-sync", {
      headers: { Authorization: "Bearer test-secret" },
    });
    const res = await runCronRoute(req, async () => new Response(JSON.stringify({ ok: true })));
    expect(res.status).toBe(404);
  });

  it("runs production cron with secret only", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const req = new Request("http://localhost/api/cron/webhook-jobs", {
      headers: { Authorization: "Bearer test-secret" },
    });
    const res = await runCronRoute(req, async () => Response.json({ ok: true }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(recordCronExecutionStarted).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "webhook-jobs", productionTier: true }),
    );
    expect(recordCronExecutionFinished).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "webhook-jobs", productionTier: true, statusCode: 200 }),
    );
  });

  it("records failed production cron execution evidence on handler error", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const req = new Request("http://localhost/api/cron/webhook-jobs", {
      headers: { Authorization: "Bearer test-secret" },
    });
    const res = await runCronRoute(req, async () => {
      throw new Error("boom");
    });
    expect(res.status).toBe(500);
    expect(recordCronExecutionFinished).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "webhook-jobs", productionTier: true, statusCode: 500 }),
    );
  });
});
