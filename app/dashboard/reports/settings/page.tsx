import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { reportTerminologyForMode } from "@/lib/reports/report-terminology";

export default async function ReportsSettingsPage() {
  const { userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { kitchenSettings: { select: { businessType: true } } },
  });
  const terminology = reportTerminologyForMode(profile?.kitchenSettings?.businessType ?? null);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Report settings</h1>
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Business mode</CardTitle>
          <CardDescription>
            Detected: {profile?.kitchenSettings?.businessType ?? "Not set (defaults applied)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">{terminology.pageTitle}</strong> — {terminology.pageSubtitle}
          </p>
          <p>{terminology.weeklyFocus}</p>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Scheduled reports</CardTitle>
          <CardDescription>Coming soon</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Scheduled email digests are not yet implemented in this workspace. Until they ship, save your
          report views and bookmark{" "}
          <code className="rounded bg-muted px-1 py-0.5">/dashboard/reports/executive_weekly_summary</code>{" "}
          for a weekly run.
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">PDF export</CardTitle>
          <CardDescription>Browser print only</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Server-side PDF generation is intentionally not enabled — to keep the experience honest, use your
          browser&apos;s &quot;Save as PDF&quot; from the print dialog on any report page.
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Legacy exports preserved</CardTitle>
          <CardDescription>/api/export?type=… still works</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          All previous CSV preset links continue to operate unchanged. The new filtered endpoint lives at
          <code className="ml-1 rounded bg-muted px-1 py-0.5">/api/export/report?key=…</code>.
        </CardContent>
      </Card>
    </div>
  );
}
