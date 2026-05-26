import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Contract: WebhookEvent must enforce idempotency at DB level (Stripe/Uber retries).
 */
describe("webhook idempotency schema", () => {
  it("declares unique constraint on connectionId + externalEventId", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");
    expect(schema).toMatch(/model WebhookEvent[\s\S]*?@@unique\(\[connectionId, externalEventId\]\)/);
  });

  it("migration exists for webhook dedup index", () => {
    const migration = readFileSync(
      join(process.cwd(), "prisma/migrations/20260521120000_p1_blockers_fix/migration.sql"),
      "utf8",
    );
    expect(migration).toContain("webhook_events_connection_id_external_event_id_key");
  });
});
