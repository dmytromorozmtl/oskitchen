import { describe, expect, it } from "vitest";
import { z } from "zod";

const subscribeBodySchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

describe("POST /api/notifications/push/subscribe contract", () => {
  it("accepts web push subscription payload", () => {
    expect(
      subscribeBodySchema.safeParse({
        endpoint: "https://fcm.googleapis.com/fcm/send/abc",
        keys: { p256dh: "key", auth: "secret" },
      }).success,
    ).toBe(true);
  });
});
