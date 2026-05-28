import { updateCopilotSettingsFormAction } from "@/actions/copilot";
import { CopilotFormErrorBanner } from "@/components/dashboard/copilot/form-error-banner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readCopilotFormError } from "@/lib/ai/copilot-form-mutation";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import {
  hasCopilotSettingsPageAccess,
  loadCopilotPageActor,
} from "@/lib/ux/copilot-page-access-era20";
import { getCopilotSettings } from "@/services/ai/copilot-service";

export default async function CopilotSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const formError = readCopilotFormError((await searchParams) ?? {});
  const { scope } = await loadCopilotPageActor();
  if (!hasCopilotSettingsPageAccess(scope)) {
    return <PermissionDeniedSurfaceCard surfaceId="copilot_settings" />;
  }
  const s = await getCopilotSettings(scope);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Safety &amp; settings</h1>
        <p className="text-sm text-muted-foreground">
          Tune how the copilot behaves in your workspace. The API key itself is never shown here.
        </p>
      </header>

      <CopilotFormErrorBanner message={formError} />

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">AI provider status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="font-medium">OPENAI_API_KEY configured:</span>{" "}
            <span className={s.hasApiKey ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
              {s.hasApiKey ? "yes" : "no"}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            We never display the key value. Configure it server-side as an environment variable.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Behaviour</CardTitle>
          <CardDescription>Tighten or relax the copilot per workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateCopilotSettingsFormAction} className="grid gap-3 text-sm">
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="font-medium">Enable AI narrative</span>
                <p className="text-xs text-muted-foreground">
                  When off, the copilot only returns deterministic bullet summaries.
                </p>
              </span>
              <input
                type="checkbox"
                name="aiNarrativeEnabled"
                defaultChecked={s.aiNarrativeEnabled}
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="font-medium">Deterministic-only mode</span>
                <p className="text-xs text-muted-foreground">
                  Forces deterministic responses regardless of provider availability.
                </p>
              </span>
              <input
                type="checkbox"
                name="deterministicOnly"
                defaultChecked={s.deterministicOnly}
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="font-medium">Require human approval for all actions</span>
                <p className="text-xs text-muted-foreground">
                  Recommended. Action drafts are never auto-executed when this is on.
                </p>
              </span>
              <input
                type="checkbox"
                name="requireApprovalAll"
                defaultChecked={s.requireApprovalAll}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium">Redaction level</span>
              <select
                name="redactionLevel"
                defaultValue={s.redactionLevel}
                className="rounded-md border border-border bg-background px-2 py-1.5"
              >
                <option value="PII_REDACTED">PII redacted (recommended)</option>
                <option value="OPERATIONAL_SUMMARY">Operational summary</option>
                <option value="FULL_INTERNAL_ALLOWED">Full internal (for trusted admins only)</option>
                <option value="NONE">None — strip secrets only</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium">Max context rows per source</span>
              <input
                type="number"
                min={5}
                max={500}
                name="maxContextRows"
                defaultValue={s.maxContextRows}
                className="rounded-md border border-border bg-background px-2 py-1.5"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium">Summary retention (days)</span>
              <input
                type="number"
                min={1}
                max={365}
                name="summaryRetentionDays"
                defaultValue={s.summaryRetentionDays}
                className="rounded-md border border-border bg-background px-2 py-1.5"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium">Privacy disclaimer (optional)</span>
              <textarea
                name="privacyDisclaimer"
                defaultValue={s.privacyDisclaimer ?? ""}
                rows={3}
                className="rounded-md border border-border bg-background px-2 py-1.5"
                placeholder="Shown on the copilot today page."
              />
            </label>
            <div className="flex justify-end">
              <button className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                Save settings
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
