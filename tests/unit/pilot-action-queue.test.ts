import { describe, expect, it } from "vitest";

import { bestLiveStagingUrl } from "@/scripts/lib/pilot-action-queue";

describe("pilot-action-queue", () => {
  it("picks URL when /api/health returns 200", () => {
    const rows = [
      { url: "https://a.vercel.app", path: "/api/health", status: 200, ok: true },
      { url: "https://a.vercel.app", path: "/login", status: 404, ok: false },
      { url: "https://b.vercel.app", path: "/api/health", status: 404, ok: false },
    ];
    expect(bestLiveStagingUrl(rows)).toBe("https://a.vercel.app");
  });

  it("picks URL when /login returns 200", () => {
    const rows = [
      { url: "https://b.vercel.app", path: "/login", status: 200, ok: true },
    ];
    expect(bestLiveStagingUrl(rows)).toBe("https://b.vercel.app");
  });

  it("returns undefined when nothing live", () => {
    expect(
      bestLiveStagingUrl([
        { url: "https://x.vercel.app", path: "/login", status: 404, ok: false },
      ]),
    ).toBeUndefined();
  });
});
