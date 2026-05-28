import { beforeEach, describe, expect, it, vi } from "vitest";

const redirect = vi.hoisted(() => vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
}));
const requireCopilotMutation = vi.hoisted(() => vi.fn());
const setActionDraftStatus = vi.hoisted(() => vi.fn());
const persistDeterministicInsights = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/ai/require-copilot-mutation", () => ({
  requireCopilotMutation,
}));

vi.mock("@/services/ai/copilot-service", () => ({
  createCopilotActionDraft: vi.fn(),
  executeApprovedAction: vi.fn(),
  persistDeterministicInsights,
  resolveInsight: vi.fn(),
  runChatTurn: vi.fn(),
  setActionDraftStatus,
  upsertCopilotSettings: vi.fn(),
}));

import {
  approveActionDraftFormAction,
  refreshDeterministicAction,
} from "@/actions/copilot";
import {
  COPILOT_FORM_DENY_POLICY_ID,
  COPILOT_FORM_ERROR_PARAM,
  copilotFormReturnUrl,
  readCopilotFormError,
} from "@/lib/ai/copilot-form-mutation";

describe("copilot form deny UX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistDeterministicInsights.mockResolvedValue(undefined);
    setActionDraftStatus.mockResolvedValue(undefined);
  });

  it("locks era5 copilot form deny policy", () => {
    expect(COPILOT_FORM_DENY_POLICY_ID).toBe("era5-copilot-form-deny-v1");
  });

  it("builds return URLs with bounded error param", () => {
    expect(copilotFormReturnUrl("/dashboard/copilot/drafts")).toBe("/dashboard/copilot/drafts");
    expect(copilotFormReturnUrl("/dashboard/copilot/drafts", "Denied")).toBe(
      `/dashboard/copilot/drafts?${COPILOT_FORM_ERROR_PARAM}=Denied`,
    );
  });

  it("reads copilot_error from search params", () => {
    expect(readCopilotFormError({ copilot_error: "No access" })).toBe("No access");
    expect(readCopilotFormError({})).toBeNull();
  });

  it("redirects void form actions on deny instead of silent return", async () => {
    requireCopilotMutation.mockResolvedValue({
      ok: false,
      error: "You do not have permission to use Copilot.",
    });

    const formData = new FormData();
    formData.set("id", "draft-1");

    await expect(approveActionDraftFormAction(formData)).rejects.toThrow(
      `REDIRECT:/dashboard/copilot/drafts?${COPILOT_FORM_ERROR_PARAM}=`,
    );
    expect(redirect).toHaveBeenCalled();
    expect(setActionDraftStatus).not.toHaveBeenCalled();
  });

  it("returns explicit error for refresh action invoked from client", async () => {
    requireCopilotMutation.mockResolvedValue({
      ok: false,
      error: "You do not have permission to use Copilot.",
    });

    const result = await refreshDeterministicAction();

    expect(result).toEqual({
      ok: false,
      error: "You do not have permission to use Copilot.",
    });
    expect(persistDeterministicInsights).not.toHaveBeenCalled();
  });
});
