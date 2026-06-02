"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  approveCoPilotDraftAction,
  executeCoPilotDraftAction,
  promoteCoPilotRecommendationAction,
  rejectCoPilotDraftAction,
} from "@/actions/co-pilot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CoPilotDashboard, CoPilotRecommendation } from "@/lib/ai/co-pilot-types";

const CATEGORY_LABEL: Record<string, string> = {
  procurement: "Procurement",
  scheduling: "Scheduling",
  pricing: "Pricing",
};

const SEVERITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  critical: "destructive",
  warning: "default",
  info: "secondary",
};

export function CoPilotPanel({
  dashboard,
  canDraft,
  canApprove,
}: {
  dashboard: CoPilotDashboard;
  canDraft: boolean;
  canApprove: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function runAction(
    action: () => Promise<{ ok: boolean; error?: string; data?: { message?: string } }>,
  ) {
    startTransition(async () => {
      const res = await action();
      setMessage(res.ok ? res.data?.message ?? "Done." : res.error ?? "Action failed.");
    });
  }

  return (
    <div className="space-y-6" data-testid="restaurant-co-pilot-panel">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Procurement {dashboard.counts.procurement}</Badge>
        <Badge variant="outline">Scheduling {dashboard.counts.scheduling}</Badge>
        <Badge variant="outline">Pricing {dashboard.counts.pricing}</Badge>
        <Badge variant={dashboard.counts.needsApproval > 0 ? "default" : "secondary"}>
          {dashboard.counts.needsApproval} awaiting approval
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        Scanned {new Date(dashboard.scannedAt).toLocaleString()} — suggestions never run automatically.
      </p>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">AI recommendations</h2>
        {dashboard.recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recommendations right now — check back after service.</p>
        ) : (
          dashboard.recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              canDraft={canDraft}
              pending={pending}
              onPromote={() =>
                runAction(async () => {
                  const fd = new FormData();
                  fd.set("recommendationId", rec.id);
                  fd.set("category", rec.category);
                  return promoteCoPilotRecommendationAction(fd);
                })
              }
            />
          ))
        )}
      </section>

      {dashboard.pendingDrafts.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Awaiting your approval</h2>
          {dashboard.pendingDrafts.map((draft) => (
            <Card key={draft.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{draft.title}</CardTitle>
                  {draft.category ? (
                    <Badge variant="outline">{CATEGORY_LABEL[draft.category]}</Badge>
                  ) : null}
                </div>
                <CardDescription>{draft.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {canApprove ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      disabled={pending}
                      data-testid="co-pilot-approve-draft"
                      onClick={() => {
                        const fd = new FormData();
                        fd.set("draftId", draft.id);
                        runAction(() => approveCoPilotDraftAction(fd));
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => {
                        const fd = new FormData();
                        fd.set("draftId", draft.id);
                        runAction(() => rejectCoPilotDraftAction(fd));
                      }}
                    >
                      Reject
                    </Button>
                  </>
                ) : null}
                <Button asChild size="sm" variant="ghost">
                  <Link href="/dashboard/copilot/drafts">Open in Copilot drafts</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      {dashboard.approvedDrafts.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Approved — ready to execute</h2>
          {dashboard.approvedDrafts.map((draft) => (
            <Card key={draft.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{draft.title}</CardTitle>
                <CardDescription>{draft.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {canApprove ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={pending}
                    data-testid="co-pilot-execute-draft"
                    onClick={() => {
                      const fd = new FormData();
                      fd.set("draftId", draft.id);
                      runAction(() => executeCoPilotDraftAction(fd));
                    }}
                  >
                    Execute approved action
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Full audit trail:{" "}
        <Link className="text-primary underline" href="/dashboard/copilot/audit">
          Copilot audit log
        </Link>
      </p>
    </div>
  );
}

function RecommendationCard({
  rec,
  canDraft,
  pending,
  onPromote,
}: {
  rec: CoPilotRecommendation;
  canDraft: boolean;
  pending: boolean;
  onPromote: () => void;
}) {
  return (
    <Card data-testid={`co-pilot-rec-${rec.category}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">{rec.title}</CardTitle>
          <Badge variant={SEVERITY_VARIANT[rec.severity] ?? "outline"}>{rec.severity}</Badge>
          <Badge variant="outline">{CATEGORY_LABEL[rec.category]}</Badge>
        </div>
        <CardDescription>{rec.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          <span className="font-medium">Impact:</span> {rec.impactLabel}
        </p>
        <p className="text-muted-foreground">{rec.suggestedAction}</p>
        <div className="flex flex-wrap gap-2">
          {canDraft ? (
            <Button
              type="button"
              size="sm"
              disabled={pending}
              data-testid="co-pilot-send-for-approval"
              onClick={onPromote}
            >
              Send for approval
            </Button>
          ) : null}
          <Button asChild size="sm" variant="ghost">
            <Link href={rec.actionRoute}>Review in module</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
