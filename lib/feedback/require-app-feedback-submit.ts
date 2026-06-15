import { recordAuditLog } from "@/lib/audit-log";
import { requireSessionUser } from "@/lib/auth";

export async function requireAppFeedbackSubmit(): Promise<
  | { ok: true; userId: string; email: string | null }
  | { ok: false; error: string }
> {
  try {
    const session = await requireSessionUser();
    return {
      ok: true,
      userId: session.id,
      email: session.email ?? null,
    };
  } catch {
    await recordAuditLog({
      userId: null,
      workspaceId: null,
      action: "feedback.permission_denied",
      entityType: "AppFeedback",
      metadata: {
        operation: "feedback.submit",
        reason: "session_required",
      },
    });
    return { ok: false, error: "Sign in to submit in-app feedback." };
  }
}
