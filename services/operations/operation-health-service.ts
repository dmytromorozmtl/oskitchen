import { operationalHealthFromSignals } from "@/lib/operations/operation-status";
import { loadTodayCommandCenter } from "@/services/today/today-command-center-service";

export async function loadOperationHealth(userId: string) {
  const today = await loadTodayCommandCenter(userId);
  /** Today triage uses ascending priority numbers (lower = more urgent). */
  const criticalBlockers = today.blockers.filter((b) => b.priority <= 9).length;
  const highBlockers = today.blockers.filter((b) => b.priority > 9 && b.priority <= 13).length;
  const rollup = operationalHealthFromSignals({
    criticalBlockers,
    highBlockers,
    failedWebhooks: today.kpis.failedWebhooks,
    integrationErrors: today.kpis.errorIntegrations,
    integrityIssues: today.kpis.integrityIssueCount,
  });
  return { rollup, today };
}
