import Link from "next/link";

import { updateStorefrontExperimentOpsSettingsFormAction } from "@/actions/storefront-experiment-settings";
import { ThemeExperimentAuditStreamTable } from "@/components/dashboard/storefront/theme-experiment-audit-stream-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { prisma } from "@/lib/prisma";
import { isAutoConcludeGloballyEnabled } from "@/lib/storefront/theme-experiment-auto-conclude";
import {
  isExperimentPipelineEnabledInJson,
  isThemeExperimentPipelineEnabledForWorkspace,
  STOREFRONT_THEME_EXPERIMENT_FEATURE_KEY,
} from "@/lib/storefront/theme-experiment-pipeline";
import { readPostWinnerHoldoutPercent } from "@/lib/storefront/theme-experiment-holdout";
import { parseThemeExperimentStored } from "@/lib/storefront/theme-experiment-version";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readWorkspaceExperimentPolicy } from "@/lib/storefront/theme-experiment-workspace-policy";
import { listStorefrontExperimentAuditStream } from "@/services/storefront/storefront-experiment-audit-stream-list";

export default async function StorefrontExperimentsSettingsPage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.settings");
  if (!pageAccess.ok) return pageAccess.deny;

  const { sessionUser: user } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  const isOwner = profile?.role === "OWNER";

  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: pageAccess.access.storefront.id },
    select: {
      id: true,
      storeSlug: true,
      workspaceId: true,
      themeExperimentJson: true,
      experimentLegalHoldAt: true,
    },
  });

  const stored = sf ? parseThemeExperimentStored(sf.themeExperimentJson) : null;
  const holdoutPercent = sf ? readPostWinnerHoldoutPercent(sf.themeExperimentJson) : 0;
  const pipelineOn = sf ? isExperimentPipelineEnabledInJson(sf.themeExperimentJson) : true;
  const workspacePipelineOn = sf?.workspaceId
    ? await isThemeExperimentPipelineEnabledForWorkspace(sf.workspaceId)
    : true;

  const workspacePolicy = sf?.workspaceId
    ? await readWorkspaceExperimentPolicy(sf.workspaceId)
    : null;

  const auditStream = sf
    ? await listStorefrontExperimentAuditStream({ storefrontId: sf.id, limit: 40 })
    : [];

  const autoConcludeGlobal = isAutoConcludeGloballyEnabled();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Experiments</h1>
        <p className="mt-2 text-muted-foreground">
          Pipeline controls and compliance without opening{" "}
          <Link href="/dashboard/storefront/advanced" className="text-primary underline-offset-4 hover:underline">
            Advanced
          </Link>
          . Traffic % and enable/disable remain on Advanced.
        </p>
      </div>

      {!sf ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Storefront required</CardTitle>
            <CardDescription>Save Overview first, then return here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/storefront">Open overview</Link>
            </Button>
          </CardContent>
        </Card>
      ) : !isOwner ? (
        <Card className="border-border/80 shadow-sm">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Only the workspace owner can change experiment ops settings.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Ops toggles</CardTitle>
              <CardDescription>Kill switches and automation — no redeploy required.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateStorefrontExperimentOpsSettingsFormAction} className="space-y-4">
                <input type="hidden" name="pipelineEnabled" value="off" />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="pipelineEnabled" value="on" defaultChecked={pipelineOn} />
                  Experiment pipeline (edge assignment + alerts)
                </label>
                <input type="hidden" name="autoConcludeEnabled" value="off" />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="autoConcludeEnabled"
                    value="on"
                    defaultChecked={stored?.autoConcludeEnabled === true}
                    disabled={!autoConcludeGlobal}
                  />
                  Auto-conclude when publish_draft + parity + SRM + edge OK
                </label>
                {!autoConcludeGlobal ? (
                  <p className="text-xs text-muted-foreground">
                    Server flag <code className="rounded bg-muted px-1">THEME_EXPERIMENT_AUTO_CONCLUDE=1</code>{" "}
                    required in production.
                  </p>
                ) : stored?.autoConcludeScheduledAt ? (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Scheduled: {new Date(stored.autoConcludeScheduledAt).toLocaleString()}
                  </p>
                ) : null}

                <div className="space-y-2 border-t border-border/80 pt-4">
                  <Label htmlFor="postWinnerHoldoutPercent">Post-winner holdout %</Label>
                  <Input
                    id="postWinnerHoldoutPercent"
                    name="postWinnerHoldoutPercent"
                    type="number"
                    min={0}
                    max={20}
                    defaultValue={holdoutPercent}
                    className="w-32 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    After conclude: keep 0–20% on published control arm (edge + analytics). Syncs on save.
                  </p>
                </div>

                <input type="hidden" name="experimentLegalHold" value="off" />
                <label className="flex items-center gap-2 text-sm border-t border-border/80 pt-4">
                  <input
                    type="checkbox"
                    name="experimentLegalHold"
                    value="on"
                    defaultChecked={Boolean(sf.experimentLegalHoldAt)}
                  />
                  Legal hold — block audit archive deletes (SOC2)
                </label>

                {sf.workspaceId ? (
                  <div className="space-y-3 border-t border-border/80 pt-4">
                    <p className="text-sm font-medium">Workspace override</p>
                    <p className="text-xs text-muted-foreground">
                      Feature key <code className="rounded bg-muted px-1">{STOREFRONT_THEME_EXPERIMENT_FEATURE_KEY}</code>
                      {" · "}
                      <Link href="/dashboard/workspace/experiments" className="text-primary underline-offset-4 hover:underline">
                        Agency rollup
                      </Link>
                    </p>
                    <select
                      name="workspacePipelineEnabled"
                      defaultValue={workspacePipelineOn ? "on" : "off"}
                      className="rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="on">Pipeline enabled (workspace)</option>
                      <option value="off">Pipeline disabled (workspace)</option>
                    </select>
                    <input type="hidden" name="workspaceAutoConcludeDefault" value="off" />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="workspaceAutoConcludeDefault"
                        value="on"
                        defaultChecked={workspacePolicy?.autoConcludeDefault === true}
                      />
                      Workspace default: auto-conclude enabled for new stores
                    </label>
                    <select
                      name="workspaceRequireApproval"
                      defaultValue={workspacePolicy?.requireApproval === false ? "off" : "on"}
                      className="rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="on">Require owner approval before apply</option>
                      <option value="off">Skip approval (dangerous)</option>
                    </select>
                    <div className="space-y-1">
                      <Label htmlFor="workspaceMinLiftPp">Workspace min lift (pp)</Label>
                      <Input
                        id="workspaceMinLiftPp"
                        name="workspaceMinLiftPp"
                        type="number"
                        min={0}
                        max={20}
                        defaultValue={workspacePolicy?.minLiftPp ?? 2}
                        className="w-32 rounded-xl"
                      />
                    </div>
                  </div>
                ) : null}

                <Button type="submit" className="rounded-full">
                  Save experiment settings
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Immutable audit stream</CardTitle>
              <CardDescription>
                Append-only <code className="rounded bg-muted px-1 text-xs">storefront.experiment.*</code> events
                (compliance).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ThemeExperimentAuditStreamTable rows={auditStream} />
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <a href="/api/dashboard/storefront/experiment-audit-export?days=90">Export CSV (90d)</a>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <a href="/api/dashboard/storefront/experiment-audit-export?days=90&signed=1">
                    Signed export
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
