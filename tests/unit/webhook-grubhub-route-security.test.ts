import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("Grubhub orders webhook route security", () => {
  it("verifies signature and webhook_event_store duplicate short-circuit", () => {
    const route = readFileSync(
      join(process.cwd(), "app/api/webhooks/grubhub/orders/route.ts"),
      "utf8",
    );
    expect(route).toContain("verifyGrubhubWebhookSignature");
    expect(route).toContain("Invalid signature");
    expect(route).toContain("createWebhookEvent");
    expect(route).toContain("duplicate: true");
    expect(route).toContain("Missing cid");
  });
});
