import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAppFeedbackSubmit = vi.hoisted(() => vi.fn());
const prismaCreate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/feedback/require-app-feedback-submit", () => ({
  requireAppFeedbackSubmit,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appFeedback: { create: prismaCreate },
  },
}));

import { submitAppFeedback } from "@/actions/feedback";

describe("app feedback actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaCreate.mockResolvedValue({});
  });

  it("denies submit without authenticated session", async () => {
    requireAppFeedbackSubmit.mockResolvedValue({
      ok: false,
      error: "Sign in to submit in-app feedback.",
    });

    const formData = new FormData();
    formData.set("type", "GENERAL");
    formData.set("title", "Bug");
    formData.set("message", "Something broke");
    formData.set("route", "/dashboard");
    formData.set("featureArea", "");

    const result = await submitAppFeedback(formData);

    expect(result).toEqual({ error: "Sign in to submit in-app feedback." });
    expect(prismaCreate).not.toHaveBeenCalled();
  });

  it("allows submit for signed-in user", async () => {
    requireAppFeedbackSubmit.mockResolvedValue({
      ok: true,
      userId: "user-1",
      email: "ops@example.com",
    });

    const formData = new FormData();
    formData.set("type", "GENERAL");
    formData.set("title", "Bug");
    formData.set("message", "Something broke");
    formData.set("route", "/dashboard");
    formData.set("featureArea", "");

    const result = await submitAppFeedback(formData);

    expect(result).toEqual({ ok: true });
    expect(prismaCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1", email: "ops@example.com" }),
      }),
    );
  });
});
