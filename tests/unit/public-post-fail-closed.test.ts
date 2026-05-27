import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getSessionUser = vi.hoisted(() => vi.fn());
const consumeRateLimitToken = vi.hoisted(() => vi.fn());
const verifyTurnstileToken = vi.hoisted(() => vi.fn());
const isTurnstileConfigured = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ getSessionUser }));
vi.mock("@/services/security/rate-limit-service", () => ({ consumeRateLimitToken }));
vi.mock("@/lib/storefront/turnstile", () => ({
  isTurnstileConfigured,
  verifyTurnstileToken,
}));

import {
  enforcePublicMarketingPostGuard,
  requireIngestBearerSecret,
  requireSessionOrIngestBearer,
} from "@/lib/api/public-post-guard";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.clearAllMocks();
});

describe("public POST fail-closed guards", () => {
  describe("requireIngestBearerSecret", () => {
    it("returns 503 when ingest secret is missing", async () => {
      delete process.env.IOT_INGEST_SECRET;

      const response = requireIngestBearerSecret(new Request("https://example.com"), {
        secretEnv: process.env.IOT_INGEST_SECRET,
        missingMessage: "IoT ingest not configured",
      });

      expect(response?.status).toBe(503);
      await expect(response?.json()).resolves.toEqual({ error: "IoT ingest not configured" });
    });

    it("returns 401 when bearer secret is wrong", async () => {
      process.env.IOT_INGEST_SECRET = "device-secret";

      const response = requireIngestBearerSecret(
        new Request("https://example.com", {
          headers: { authorization: "Bearer wrong" },
        }),
        { secretEnv: process.env.IOT_INGEST_SECRET },
      );

      expect(response?.status).toBe(401);
    });

    it("allows request when bearer secret matches", () => {
      process.env.IOT_INGEST_SECRET = "device-secret";

      const response = requireIngestBearerSecret(
        new Request("https://example.com", {
          headers: { authorization: "Bearer device-secret" },
        }),
        { secretEnv: process.env.IOT_INGEST_SECRET },
      );

      expect(response).toBeNull();
    });
  });

  describe("enforcePublicMarketingPostGuard", () => {
    beforeEach(() => {
      consumeRateLimitToken.mockResolvedValue({ ok: true });
    });

    it("returns 429 when rate limited", async () => {
      consumeRateLimitToken.mockResolvedValue({ ok: false, retryAfterMs: 60_000 });

      const response = await enforcePublicMarketingPostGuard(
        new Request("https://example.com"),
        { policyKey: "roi_lead", bucketPrefix: "roi_lead" },
      );

      expect(response?.status).toBe(429);
    });

    it("returns 503 in production when turnstile is not configured", async () => {
      process.env.NODE_ENV = "production";
      isTurnstileConfigured.mockReturnValue(false);

      const response = await enforcePublicMarketingPostGuard(
        new Request("https://example.com"),
        { policyKey: "roi_lead", bucketPrefix: "roi_lead" },
      );

      expect(response?.status).toBe(503);
      await expect(response?.json()).resolves.toEqual({ ok: false, error: "Lead capture not configured" });
    });

    it("requires captcha when turnstile is configured", async () => {
      process.env.NODE_ENV = "development";
      isTurnstileConfigured.mockReturnValue(true);
      verifyTurnstileToken.mockResolvedValue({ ok: false, error: "Complete the security check before submitting." });

      const response = await enforcePublicMarketingPostGuard(
        new Request("https://example.com"),
        { policyKey: "roi_lead", bucketPrefix: "roi_lead" },
      );

      expect(response?.status).toBe(400);
      expect(verifyTurnstileToken).toHaveBeenCalled();
    });
  });

  describe("requireSessionOrIngestBearer", () => {
    it("returns 503 when neither session nor ingest secret is configured", async () => {
      delete process.env.NPS_INGEST_SECRET;
      getSessionUser.mockResolvedValue(null);

      const result = await requireSessionOrIngestBearer(new Request("https://example.com"), {
        secretEnv: process.env.NPS_INGEST_SECRET,
        missingMessage: "NPS feedback ingest not configured",
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.response.status).toBe(503);
        await expect(result.response.json()).resolves.toEqual({
          ok: false,
          error: "NPS feedback ingest not configured",
        });
      }
    });

    it("allows authenticated session users", async () => {
      delete process.env.NPS_INGEST_SECRET;
      getSessionUser.mockResolvedValue({ id: "user-1" });

      const result = await requireSessionOrIngestBearer(new Request("https://example.com"), {
        secretEnv: process.env.NPS_INGEST_SECRET,
      });

      expect(result).toEqual({ ok: true, userId: "user-1" });
    });

    it("allows bearer ingest when secret is configured", async () => {
      process.env.NPS_INGEST_SECRET = "nps-secret";

      const result = await requireSessionOrIngestBearer(
        new Request("https://example.com", {
          headers: { authorization: "Bearer nps-secret" },
        }),
        { secretEnv: process.env.NPS_INGEST_SECRET },
      );

      expect(result).toEqual({ ok: true, userId: "ingest" });
    });

    it("rejects wrong bearer when ingest secret is configured", async () => {
      process.env.NPS_INGEST_SECRET = "nps-secret";
      getSessionUser.mockResolvedValue(null);

      const result = await requireSessionOrIngestBearer(
        new Request("https://example.com", {
          headers: { authorization: "Bearer wrong" },
        }),
        { secretEnv: process.env.NPS_INGEST_SECRET },
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.response.status).toBe(401);
      }
    });
  });
});
