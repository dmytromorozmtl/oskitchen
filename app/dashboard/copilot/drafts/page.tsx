import {
  approveActionDraftFormAction,
  createActionDraftAction,
  executeActionDraftFormAction,
  rejectActionDraftFormAction,
} from "@/actions/copilot";
import { CopilotFormErrorBanner } from "@/components/dashboard/copilot/form-error-banner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readCopilotFormError } from "@/lib/ai/copilot-form-mutation";
import { COPILOT_TOOLS, COPILOT_TOOL_KEYS } from "@/lib/ai/copilot-tools";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import { loadCopilotPageActor } from "@/lib/ux/copilot-page-access-era20";
import { listActionDrafts } from "@/services/ai/copilot-service";

const STATUS_COLOR: Record<string, string> = {
  NEEDS_APPROVAL: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  APPROVED: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100",
  EXECUTED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
  REJECTED: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100",
  CANCELLED: "bg-muted text-muted-foreground",
  DRAFT: "bg-muted text-muted-foreground",
};

export default async function CopilotDraftsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const formError = readCopilotFormError((await searchParams) ?? {});
  const { scope } = await loadCopilotPageActor();
  const canDraft = canUseCopilot(scope, "copilot.actions.draft");
  const canApprove = canUseCopilot(scope, "copilot.actions.approve");
  const drafts = await listActionDrafts(scope);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Action drafts</h1>
        <p className="text-sm text-muted-foreground">
          Copilot suggestions never run automatically. Approve to allow execution; reject to log a
          dismissal.
        </p>
      </header>

      <CopilotFormErrorBanner message={formError} />

      {canDraft && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">New action draft</CardTitle>
            <CardDescription>
              Drafts are recorded in the audit log immediately. They only modify operational data
              after a human approves and executes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createActionDraftAction} className="grid gap-3 text-sm">
              <label className="grid gap-1">
                <span className="text-xs font-medium">Action type</span>
                <select name="actionType" className="rounded-md border border-border bg-background px-2 py-1.5">
                  {COPILOT_TOOL_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {COPILOT_TOOLS[k].label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-medium">Title</span>
                <input
                  name="title"
                  required
                  className="rounded-md border border-border bg-background px-2 py-1.5"
                  placeholder="Short title"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-medium">Description</span>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="rounded-md border border-border bg-background px-2 py-1.5"
                  placeholder="What should happen and why?"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-medium">Payload JSON (optional)</span>
                <textarea
                  name="payloadJson"
                  rows={3}
                  className="rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs"
                  placeholder='{ "title": "...", "dueAt": "2026-05-12T18:00:00Z" }'
                />
              </label>
              <div className="flex justify-end">
                <button className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                  Create draft
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <section className="space-y-3">
        {drafts.length === 0 ? (
          <Card className="border-border/80 shadow-sm">
            <CardContent className="py-6 text-sm text-muted-foreground">
              No action drafts yet.
            </CardContent>
          </Card>
        ) : (
          drafts.map((d) => (
            <Card key={d.id} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{d.title}</CardTitle>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[d.status]}`}>
                    {d.status.replaceAll("_", " ")}
                  </span>
                </div>
                <CardDescription>
                  <span className="font-mono text-xs">{d.actionType}</span> · created {d.createdAt.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0 text-sm">
                <p className="text-muted-foreground">{d.description}</p>
                <pre className="overflow-x-auto rounded-md bg-muted/60 p-2 text-xs">
{JSON.stringify(d.payloadJson, null, 2)}
                </pre>
                {d.executedSummary && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Executed: {d.executedSummary}
                  </p>
                )}
                {d.rejectedReason && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    Rejected: {d.rejectedReason}
                  </p>
                )}
                {canApprove && d.status === "NEEDS_APPROVAL" && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <form action={approveActionDraftFormAction}>
                      <input type="hidden" name="id" value={d.id} />
                      <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                        Approve
                      </button>
                    </form>
                    <form action={rejectActionDraftFormAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={d.id} />
                      <input
                        name="reason"
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                        placeholder="Reject reason (optional)"
                      />
                      <button className="rounded-md border border-border px-3 py-1.5 text-xs">
                        Reject
                      </button>
                    </form>
                  </div>
                )}
                {canApprove && d.status === "APPROVED" && (
                  <form action={executeActionDraftFormAction} className="pt-2">
                    <input type="hidden" name="id" value={d.id} />
                    <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                      Execute now
                    </button>
                  </form>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
