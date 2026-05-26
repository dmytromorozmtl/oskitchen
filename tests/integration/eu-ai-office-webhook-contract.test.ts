import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("EU AI Office conformity webhook contract", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.EU_AI_OFFICE_CONFORMITY_WEBHOOK_SECRET = "test-secret";
    process.env.THEME_EXPERIMENT_EU_AI_OFFICE_CONTINUOUS_CONFORMITY = "1";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("rejects missing authorization", async () => {
    const { POST } = await import("@/app/api/webhooks/eu-ai-office-conformity-sync/route");
    const req = new Request("http://localhost/api/webhooks/eu-ai-office-conformity-sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("rejects invalid JSON body", async () => {
    const { POST } = await import("@/app/api/webhooks/eu-ai-office-conformity-sync/route");
    const req = new Request("http://localhost/api/webhooks/eu-ai-office-conformity-sync", {
      method: "POST",
      headers: {
        authorization: "Bearer test-secret",
        "content-type": "application/json",
      },
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects invalid payload schema", async () => {
    const { POST } = await import("@/app/api/webhooks/eu-ai-office-conformity-sync/route");
    const req = new Request("http://localhost/api/webhooks/eu-ai-office-conformity-sync", {
      method: "POST",
      headers: {
        authorization: "Bearer test-secret",
        "content-type": "application/json",
      },
      body: JSON.stringify({ storeSlug: "x" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
