import { describe, expect, it } from "vitest";

import { inviteAuditRowsToCsv, STOREFRONT_INVITE_AUDIT_RETENTION_DAYS } from "@/lib/storefront/invite-audit-export";

describe("invite audit export", () => {
  it("retention is 90 days", () => {
    expect(STOREFRONT_INVITE_AUDIT_RETENTION_DAYS).toBe(90);
  });

  it("serializes rows to CSV with header", () => {
    const csv = inviteAuditRowsToCsv([
      {
        id: "ev-1",
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
        eventType: "created",
        targetEmail: "a@example.com",
        inviteEmail: "a@example.com",
        inviteRole: "STAFF",
        actorEmail: "owner@example.com",
        actorName: "Owner",
        metadataJson: { source: "test" },
      },
    ]);
    expect(csv).toContain("id,created_at_utc,event_type");
    expect(csv).toContain("ev-1");
    expect(csv).toContain('"{""source"":""test""}"');
  });
});
