import { AnalyticsSuiteSkeleton } from "@/components/analytics/analytics-suite-skeleton";
import { PageShell } from "@/components/layout/page-shell";

export default function AnalyticsSuiteLoading() {
  return (
    <PageShell>
      <AnalyticsSuiteSkeleton />
    </PageShell>
  );
}
