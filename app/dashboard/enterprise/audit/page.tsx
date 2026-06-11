import type { Metadata } from "next";

import { AuditCompliancePanel } from "@/components/enterprise/audit-compliance-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadEnterpriseAuditComplianceDashboard } from "@/services/enterprise/audit-service";

export const metadata: Metadata = {
  title: "Audit & Compliance — Enterprise",
  description:
    "SOC2-ready audit trail with retention, redaction, export, and control readiness scorecard.",
};

export const dynamic = "force-dynamic";

export default async function EnterpriseAuditCompliancePage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Audit &amp; compliance requires a workspace</CardTitle>
          <CardDescription>
            Configure your workspace to view SOC2-ready audit trail evidence and control readiness.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dashboard = await loadEnterpriseAuditComplianceDashboard(workspaceId);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 pb-10">
      <AuditCompliancePanel dashboard={dashboard} />
    </div>
  );
}
