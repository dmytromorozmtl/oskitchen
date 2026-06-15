import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeGrowth = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordLifecycleEventSafe = vi.hoisted(() => vi.fn());

vi.mock("@/lib/growth/require-growth-access", () => ({ authorizeGrowth }));
vi.mock("@/lib/scope/require-tenant-actor", () => ({ requireTenantActor }));
vi.mock("@/lib/lifecycle-events", () => ({ recordLifecycleEventSafe }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import {
  appendCustomerSuccessNoteForm,
  markCustomerContactedForm,
} from "@/actions/customer-success";

describe("customer success actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "actor-1", email: "gtm@example.com" },
      userId: "owner-1",
    });
    recordLifecycleEventSafe.mockResolvedValue(undefined);
  });

  it("denies append note without growth.manage", async () => {
    authorizeGrowth.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    const formData = new FormData();
    formData.set("targetUserId", "target-1");
    formData.set("note", "Follow up on onboarding");

    await appendCustomerSuccessNoteForm(formData);

    expect(authorizeGrowth).toHaveBeenCalledWith("growth.manage");
    expect(recordLifecycleEventSafe).not.toHaveBeenCalled();
  });

  it("denies mark contacted without growth.manage", async () => {
    authorizeGrowth.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    const formData = new FormData();
    formData.set("targetUserId", "target-1");

    await markCustomerContactedForm(formData);

    expect(authorizeGrowth).toHaveBeenCalledWith("growth.manage");
    expect(recordLifecycleEventSafe).not.toHaveBeenCalled();
  });

  it("allows append note when growth.manage is granted", async () => {
    authorizeGrowth.mockResolvedValue({ ok: true });

    const formData = new FormData();
    formData.set("targetUserId", "target-1");
    formData.set("note", "Follow up on onboarding");

    await appendCustomerSuccessNoteForm(formData);

    expect(recordLifecycleEventSafe).toHaveBeenCalledWith(
      "target-1",
      "cs_note",
      expect.objectContaining({
        text: "Follow up on onboarding",
        authorOwnerId: "actor-1",
      }),
    );
  });

  it("allows mark contacted when growth.manage is granted", async () => {
    authorizeGrowth.mockResolvedValue({ ok: true });

    const formData = new FormData();
    formData.set("targetUserId", "target-1");

    await markCustomerContactedForm(formData);

    expect(recordLifecycleEventSafe).toHaveBeenCalledWith(
      "target-1",
      "cs_contacted",
      expect.objectContaining({ authorOwnerId: "actor-1" }),
    );
  });
});
