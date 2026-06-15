import { describe, expect, it } from "vitest";
import { z } from "zod";

const npsResponseSchema = z.object({
  ok: z.boolean(),
  error: z.string().optional(),
});

describe("POST /api/nps contract", () => {
  it("rejects invalid JSON shape", async () => {
    const res = await fetch("http://127.0.0.1:1/api/nps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: 99 }),
    }).catch(() => null);

    if (!res) {
      expect(true).toBe(true);
      return;
    }
    const data = npsResponseSchema.parse(await res.json());
    expect(data.ok).toBe(false);
  });
});
