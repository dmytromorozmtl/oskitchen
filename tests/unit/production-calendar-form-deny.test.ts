import { beforeEach, describe, expect, it, vi } from "vitest";

const redirect = vi.hoisted(() => vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
}));
const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const createProductionPlanTask = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/services/production/production-calendar-service", () => ({
  createProductionPlanTask,
  updateProductionPlanTaskDate: vi.fn(),
}));

import { createPlanTaskAction } from "@/actions/production-calendar";
import {
  PRODUCTION_CALENDAR_FORM_DENY_POLICY_ID,
  PRODUCTION_CALENDAR_FORM_ERROR_PARAM,
  PRODUCTION_CALENDAR_PAGE_PATH,
  productionCalendarFormReturnUrl,
  readProductionCalendarFormError,
} from "@/lib/production/production-calendar-form-mutation";

describe("production calendar form deny UX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({ dataUserId: "owner-1" });
    createProductionPlanTask.mockResolvedValue(undefined);
  });

  it("locks era6 production calendar form deny policy", () => {
    expect(PRODUCTION_CALENDAR_FORM_DENY_POLICY_ID).toBe(
      "era6-production-calendar-form-deny-v1",
    );
    expect(PRODUCTION_CALENDAR_PAGE_PATH).toBe("/dashboard/production/calendar");
  });

  it("builds return URLs with bounded error param", () => {
    expect(productionCalendarFormReturnUrl(PRODUCTION_CALENDAR_PAGE_PATH)).toBe(
      PRODUCTION_CALENDAR_PAGE_PATH,
    );
    expect(
      productionCalendarFormReturnUrl(PRODUCTION_CALENDAR_PAGE_PATH, "Denied"),
    ).toBe(
      `${PRODUCTION_CALENDAR_PAGE_PATH}?${PRODUCTION_CALENDAR_FORM_ERROR_PARAM}=Denied`,
    );
  });

  it("reads production_calendar_error from search params", () => {
    expect(readProductionCalendarFormError({ production_calendar_error: "No access" })).toBe(
      "No access",
    );
    expect(readProductionCalendarFormError({})).toBeNull();
  });

  it("redirects void form actions on deny instead of silent return", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: { sessionUserId: "staff-1", workspaceId: "ws-1" },
    });

    const formData = new FormData();
    formData.set("title", "Prep batch");
    formData.set("planDate", "2026-06-01");

    await expect(createPlanTaskAction(formData)).rejects.toThrow(
      `REDIRECT:${PRODUCTION_CALENDAR_PAGE_PATH}?${PRODUCTION_CALENDAR_FORM_ERROR_PARAM}=`,
    );
    expect(redirect).toHaveBeenCalled();
    expect(createProductionPlanTask).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "production_calendar.permission_denied" }),
    );
  });
});
