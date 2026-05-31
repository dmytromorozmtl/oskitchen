"use client";

import { useMemo, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";

import {
  approvePartnerAppReviewAction,
  rejectPartnerAppReviewAction,
  suspendPartnerAppReviewAction,
} from "@/actions/partner-app-review";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PartnerAppReviewChecklistItem } from "@/services/platform/partner-oauth-app-registry-service";
import type { PartnerOAuthAppRegistryView } from "@/services/platform/partner-oauth-app-registry-service";

type PartnerAppsReviewPanelProps = {
  queue: PartnerOAuthAppRegistryView[];
  checklist: PartnerAppReviewChecklistItem[];
  canReview: boolean;
};

function statusTone(status: string): string {
  switch (status) {
    case "IN_REVIEW":
      return "border-amber-500/40 bg-amber-500/10 text-amber-200";
    case "SANDBOX":
    case "PUBLISHED":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
    case "SUSPENDED":
      return "border-red-500/40 bg-red-500/10 text-red-200";
    default:
      return "border-zinc-700 bg-zinc-900/60 text-zinc-300";
  }
}

function ReviewCard({
  row,
  checklist,
  canReview,
}: {
  row: PartnerOAuthAppRegistryView;
  checklist: PartnerAppReviewChecklistItem[];
  canReview: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState(row.reviewNotes ?? "");
  const [localChecklist, setLocalChecklist] = useState<Record<string, boolean>>(() => {
    const base = Object.fromEntries(checklist.map((item) => [item.id, false]));
    return { ...base, ...row.checklist };
  });
  const [message, setMessage] = useState<string | null>(null);

  const requiredComplete = useMemo(
    () =>
      checklist
        .filter((item) => item.required)
        .every((item) => localChecklist[item.id]),
    [checklist, localChecklist],
  );

  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-medium text-white">{row.name}</h2>
            <Badge variant="outline" className={statusTone(row.status)}>
              {row.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-zinc-400">{row.publisher}</p>
          <p className="mt-1 font-mono text-xs text-zinc-500">{row.clientId}</p>
        </div>
        {row.submittedAt ? (
          <p className="text-xs text-zinc-500">
            Submitted {formatDistanceToNow(row.submittedAt, { addSuffix: true })}
          </p>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-zinc-300">{row.description}</p>

      <div className="mt-4 grid gap-3 text-xs text-zinc-400 md:grid-cols-2">
        <div>
          <p className="font-medium text-zinc-300">Redirect URIs</p>
          <ul className="mt-1 space-y-1 font-mono">
            {row.redirectUris.map((uri) => (
              <li key={uri}>{uri}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-zinc-300">Scopes</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {row.allowedScopes.map((scope) => (
              <Badge key={scope} variant="outline" className="font-mono text-[10px]">
                {scope}
              </Badge>
            ))}
          </div>
          {row.embedUrl ? (
            <p className="mt-2">
              Embed URL: <span className="font-mono text-zinc-300">{row.embedUrl}</span>
            </p>
          ) : null}
          {row.contactEmail ? (
            <p className="mt-1">
              Contact: <span className="text-zinc-300">{row.contactEmail}</span>
            </p>
          ) : null}
        </div>
      </div>

      {canReview && row.status === "IN_REVIEW" ? (
        <div className="mt-4 space-y-3 rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Review checklist</p>
          <div className="space-y-2">
            {checklist.map((item) => (
              <label key={item.id} className="flex items-start gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={Boolean(localChecklist[item.id])}
                  onChange={(event) =>
                    setLocalChecklist((prev) => ({ ...prev, [item.id]: event.target.checked }))
                  }
                />
                <span>
                  {item.label}
                  {item.required ? <span className="text-amber-300"> *</span> : null}
                </span>
              </label>
            ))}
          </div>
          <textarea
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            rows={3}
            placeholder="Review notes (required for rejection)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          {message ? <p className="text-xs text-zinc-400">{message}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={pending || !requiredComplete}
              onClick={() =>
                startTransition(async () => {
                  const result = await approvePartnerAppReviewAction({
                    registryId: row.id,
                    checklist: localChecklist,
                    reviewNotes: notes || undefined,
                    publishAsSandbox: true,
                  });
                  setMessage(result.ok ? "Approved as SANDBOX." : result.error);
                })
              }
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span className="ml-1">Approve (sandbox)</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending || !requiredComplete}
              onClick={() =>
                startTransition(async () => {
                  const result = await approvePartnerAppReviewAction({
                    registryId: row.id,
                    checklist: localChecklist,
                    reviewNotes: notes || undefined,
                    publishAsSandbox: false,
                  });
                  setMessage(result.ok ? "Approved as PUBLISHED." : result.error);
                })
              }
            >
              Publish
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending || notes.trim().length < 8}
              onClick={() =>
                startTransition(async () => {
                  const result = await rejectPartnerAppReviewAction({
                    registryId: row.id,
                    reviewNotes: notes,
                  });
                  setMessage(result.ok ? "Rejected — returned to DRAFT." : result.error);
                })
              }
            >
              <XCircle className="h-4 w-4" />
              <span className="ml-1">Reject</span>
            </Button>
          </div>
        </div>
      ) : null}

      {canReview && (row.status === "SANDBOX" || row.status === "PUBLISHED") ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pending || notes.trim().length < 8}
            onClick={() =>
              startTransition(async () => {
                const result = await suspendPartnerAppReviewAction({
                  registryId: row.id,
                  reason: notes,
                });
                setMessage(result.ok ? "App suspended." : result.error);
              })
            }
          >
            <ShieldAlert className="h-4 w-4" />
            <span className="ml-1">Suspend</span>
          </Button>
        </div>
      ) : null}

      {row.reviewNotes && row.status !== "IN_REVIEW" ? (
        <p className="mt-3 text-xs text-zinc-500">Notes: {row.reviewNotes}</p>
      ) : null}
    </article>
  );
}

export function PartnerAppsReviewPanel({ queue, checklist, canReview }: PartnerAppsReviewPanelProps) {
  const inReview = queue.filter((row) => row.status === "IN_REVIEW");
  const other = queue.filter((row) => row.status !== "IN_REVIEW");

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">In review</p>
          <p className="mt-1 text-2xl font-semibold text-white">{inReview.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Live / sandbox</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {queue.filter((r) => r.status === "SANDBOX" || r.status === "PUBLISHED").length}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Total registry</p>
          <p className="mt-1 text-2xl font-semibold text-white">{queue.length}</p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Review queue</h2>
        {inReview.length === 0 ? (
          <p className="text-sm text-zinc-500">No partner apps awaiting review.</p>
        ) : (
          inReview.map((row) => (
            <ReviewCard key={row.id} row={row} checklist={checklist} canReview={canReview} />
          ))
        )}
      </section>

      {other.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Registry history</h2>
          {other.map((row) => (
            <ReviewCard key={row.id} row={row} checklist={checklist} canReview={canReview} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
