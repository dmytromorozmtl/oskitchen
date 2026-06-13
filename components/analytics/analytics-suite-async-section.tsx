import { AnalyticsSuitePanel } from "@/components/analytics/analytics-suite-panel";
import { loadAnalyticsSuiteSnapshot } from "@/services/analytics/analytics-suite-service";

export async function AnalyticsSuiteAsyncSection({ dataUserId }: { dataUserId: string }) {
  const snapshot = await loadAnalyticsSuiteSnapshot(dataUserId);
  return <AnalyticsSuitePanel snapshot={snapshot} />;
}
