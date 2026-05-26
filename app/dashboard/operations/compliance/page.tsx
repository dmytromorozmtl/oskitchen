import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getOperationsCompliance } from "@/services/operations/operations-service";

export default async function OperationsCompliancePage() {
  const { dataUserId } = await getTenantActor();
  const stats = await getOperationsCompliance(dataUserId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Operations compliance</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-bold">{stats.compliancePct}%</CardTitle>
          <p className="text-sm text-muted-foreground">Last 30 days · all locations</p>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{stats.audits} audits completed</p>
          <p>{stats.passed} / {stats.totalResponses} checklist items passed</p>
          <Link href="/dashboard/operations/audits" className="mt-4 inline-block text-primary hover:underline">
            View audits →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
