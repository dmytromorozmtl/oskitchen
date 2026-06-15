import { describe, expect, it } from "vitest";

import { resolveSupportCommentPostPermission } from "@/lib/support/support-comment-guards";

describe("resolveSupportCommentPostPermission", () => {
  it("allows triage to post INTERNAL", () => {
    expect(
      resolveSupportCommentPostPermission({
        visibility: "INTERNAL",
        canTriage: true,
        canViewTicket: false,
      }),
    ).toEqual({ ok: true });
  });

  it("denies non-triage INTERNAL even if they can view the ticket", () => {
    expect(
      resolveSupportCommentPostPermission({
        visibility: "INTERNAL",
        canTriage: false,
        canViewTicket: true,
      }),
    ).toEqual({ ok: false, error: "INTERNAL_NOT_ALLOWED" });
  });

  it("allows workspace-visible user to post CUSTOMER reply", () => {
    expect(
      resolveSupportCommentPostPermission({
        visibility: "CUSTOMER",
        canTriage: false,
        canViewTicket: true,
      }),
    ).toEqual({ ok: true });
  });

  it("denies user with no triage and no ticket view", () => {
    expect(
      resolveSupportCommentPostPermission({
        visibility: "CUSTOMER",
        canTriage: false,
        canViewTicket: false,
      }),
    ).toEqual({ ok: false, error: "FORBIDDEN" });
  });

  it("allows PARTNER visibility when user can view ticket (same gate as legacy triage||canView)", () => {
    expect(
      resolveSupportCommentPostPermission({
        visibility: "PARTNER",
        canTriage: false,
        canViewTicket: true,
      }),
    ).toEqual({ ok: true });
  });
});
