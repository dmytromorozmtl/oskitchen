import { describe, expect, it, vi } from "vitest";

import { parallelRead } from "@/lib/db/query-optimizer";

describe("parallelRead", () => {
  it("resolves all queries", async () => {
    const result = await parallelRead([Promise.resolve(1), Promise.resolve("b")]);
    expect(result).toEqual([1, "b"]);
  });

  it("rejects on timeout", async () => {
    vi.useFakeTimers();
    const slow = new Promise<number>((resolve) => {
      setTimeout(() => resolve(1), 10_000);
    });
    const promise = parallelRead([slow], 100);
    vi.advanceTimersByTime(150);
    await expect(promise).rejects.toThrow(/timeout/i);
    vi.useRealTimers();
  });
});
