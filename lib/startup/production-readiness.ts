import { webhookQueueProductionFailure } from "@/lib/webhooks/webhook-queue-mode";
import { rateLimitProductionFailure } from "@/services/security/rate-limit-adapter";

export type ProductionReadinessIssue = {
  id: "rate_limit" | "webhook_queue";
  message: string;
};

export function collectProductionReadinessIssues(): ProductionReadinessIssue[] {
  const issues: ProductionReadinessIssue[] = [];

  const rateLimitFailure = rateLimitProductionFailure();
  if (rateLimitFailure) {
    issues.push({ id: "rate_limit", message: rateLimitFailure });
  }

  const queueFailure = webhookQueueProductionFailure();
  if (queueFailure) {
    issues.push({ id: "webhook_queue", message: queueFailure });
  }

  return issues;
}

export function productionStartupReadinessFailure(): string | null {
  const issues = collectProductionReadinessIssues();
  if (issues.length === 0) return null;
  return issues.map((issue) => issue.message).join(" ");
}

/**
 * Fatal boot enforcement is intentionally scoped to real production-serving
 * contexts. CI and preview builds should still surface degraded readiness via
 * checks/scripts without crashing `next start`.
 */
export function shouldFatalOnNodeStartup(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (process.env.CI === "1") return false;
  if (process.env.STARTUP_READINESS_FATAL === "1") return true;
  return process.env.VERCEL_ENV === "production";
}

export function assertNodeStartupReadiness(): void {
  const failure = productionStartupReadinessFailure();
  if (!failure || !shouldFatalOnNodeStartup()) return;
  throw new Error(`Production startup readiness failed: ${failure}`);
}
