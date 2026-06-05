import { describe, expect, it } from "vitest";

describe("klaviyo segment export csv", () => {
  it("builds csv with header and escaped emails", async () => {
    const { exportKlaviyoSegmentProfiles } = await import(
      "@/services/integrations/klaviyo/segment-export.service"
    );

    const originalFetch = global.fetch;
    global.fetch = async (input) => {
      const url = String(input);
      if (url.includes("/accounts/")) {
        return new Response(JSON.stringify({ data: [] }), { status: 200 });
      }
      if (url.includes("/segments/seg-1/profiles/")) {
        return new Response(
          JSON.stringify({
            data: [
              { attributes: { email: "a@example.com" } },
              { attributes: { email: 'b,"special"@example.com' } },
            ],
            links: {},
          }),
          { status: 200 },
        );
      }
      return new Response("{}", { status: 404 });
    };

    process.env.KLAVIYO_API_KEY = "pk_test_key";

    try {
      const result = await exportKlaviyoSegmentProfiles("seg-1");
      expect(result.ok).toBe(true);
      expect(result.rowCount).toBe(2);
      expect(result.csv).toContain("email");
      expect(result.csv).toContain("a@example.com");
      expect(result.csv).toContain('"b,""special""@example.com"');
    } finally {
      global.fetch = originalFetch;
      delete process.env.KLAVIYO_API_KEY;
    }
  });
});
