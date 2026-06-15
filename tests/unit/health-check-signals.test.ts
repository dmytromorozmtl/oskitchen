import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

function setCoreEnv() {
  process.env.NODE_ENV = "test";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  process.env.NEXT_PUBLIC_APP_ENV = "development";
  process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/kitchenos";
  process.env.DIRECT_URL = "postgresql://postgres:postgres@127.0.0.1:5432/kitchenos";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
  vi.clearAllMocks();
});

describe("server health signals", () => {
  it("does not mark Uber Direct live-ready from credentials alone", async () => {
    setCoreEnv();
    process.env.UBER_DIRECT_CLIENT_ID = "client-id";
    process.env.UBER_DIRECT_CLIENT_SECRET = "client-secret";
    process.env.UBER_DIRECT_WEBHOOK_SECRET = "webhook-secret";

    vi.doMock("@/lib/db/health", () => ({
      checkDatabaseHealth: vi.fn(async () => ({ ok: true })),
    }));

    const { getServerHealthSignals } = await import("@/services/observability/health-check-service");
    const signals = await getServerHealthSignals();

    expect(signals.uberDirectCredentialsPresent).toBe(true);
    expect(signals.uberDirectLiveReady).toBe(false);
  });
});
