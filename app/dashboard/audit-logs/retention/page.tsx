import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuditRetentionForOwnerAction, upsertAuditRetentionAction } from "@/actions/audit-center";
import { DEFAULT_AUDIT_RETENTION_DAYS } from "@/lib/audit/audit-retention";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AuditRetentionPage() {
  const policy = await getAuditRetentionForOwnerAction();
  if (!policy.ok) {
    if (policy.error === "forbidden") redirect("/dashboard");
    redirect("/dashboard/audit-logs");
  }

  const p = policy.policy ?? {
    retentionDays: DEFAULT_AUDIT_RETENTION_DAYS,
    exportBeforeDelete: true,
    archiveBeforeDelete: false,
    legalHoldNote: null as string | null,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <Button variant="ghost" asChild className="mb-2 px-0">
          <Link href="/dashboard/audit-logs">← Back to Audit Logs</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Retention policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Normal users cannot delete audit rows manually. Retention rules govern automated lifecycle (enforcement job
          to be wired separately). Legal hold is recorded as a note for enterprise workflows.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace policy</CardTitle>
          <CardDescription>Applies to your primary workspace. Values are clamped between 30 and 3,650 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={upsertAuditRetentionAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="retentionDays">Retention days</Label>
              <Input id="retentionDays" name="retentionDays" type="number" min={30} max={3650} defaultValue={p.retentionDays} required />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="exportBeforeDelete" defaultChecked={p.exportBeforeDelete} value="on" />
              Require export snapshot before automated deletion
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="archiveBeforeDelete" defaultChecked={p.archiveBeforeDelete} value="on" />
              Archive before deletion (placeholder — archive store not yet configured)
            </label>
            <div className="space-y-2">
              <Label htmlFor="legalHoldNote">Legal hold / enterprise note (optional)</Label>
              <Input
                id="legalHoldNote"
                name="legalHoldNote"
                maxLength={500}
                defaultValue={p.legalHoldNote ?? ""}
                placeholder="Reference ticket or counsel hold"
              />
            </div>
            <Button type="submit">Save policy</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
