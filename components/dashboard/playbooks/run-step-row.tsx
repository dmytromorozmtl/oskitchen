"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { PlaybookRunStepStatus } from "@prisma/client";

import { transitionStepAction } from "@/actions/playbooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StepStatusBadge } from "./playbook-status-badge";

export type RunStepRowProps = {
  runId: string;
  runStepId: string;
  title: string;
  description?: string | null;
  status: PlaybookRunStepStatus;
  role?: string | null;
  moduleKey?: string | null;
  actionRoute?: string | null;
  estimatedMinutes?: number | null;
  required: boolean;
  hasTask: boolean;
  taskId?: string | null;
  blockedReason?: string | null;
  notes?: string | null;
};

export function RunStepRow(props: RunStepRowProps) {
  const [pending, start] = useTransition();
  const [showBlock, setShowBlock] = useState(false);
  const [reason, setReason] = useState(props.blockedReason ?? "");
  const [err, setErr] = useState<string | null>(null);

  function go(status: PlaybookRunStepStatus, blockedReason?: string | null) {
    start(async () => {
      setErr(null);
      const res = await transitionStepAction({
        runStepId: props.runStepId,
        status,
        runId: props.runId,
        blockedReason: blockedReason ?? null,
        notes: null,
      });
      if (!res.ok) setErr(res.error ?? "Unable to update");
      else if (status !== "BLOCKED") setShowBlock(false);
    });
  }

  return (
    <li className="rounded-lg border border-border/80 bg-card/90 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{props.title}</span>
            <StepStatusBadge status={props.status} />
            {!props.required ? (
              <span className="text-xs text-muted-foreground">(optional)</span>
            ) : null}
          </div>
          {props.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {props.role ? <span>Role: {props.role}</span> : null}
            {props.estimatedMinutes ? <span>{props.estimatedMinutes} min</span> : null}
            {props.moduleKey ? <span>Module: {props.moduleKey}</span> : null}
            {props.hasTask && props.taskId ? (
              <Link
                href={`/dashboard/tasks?focus=${props.taskId}`}
                className="text-primary underline-offset-2 hover:underline"
              >
                Open generated task
              </Link>
            ) : null}
            {props.actionRoute ? (
              <Link
                href={props.actionRoute}
                className="text-primary underline-offset-2 hover:underline"
              >
                Open module
              </Link>
            ) : null}
          </div>
          {props.status === "BLOCKED" && props.blockedReason ? (
            <p className="mt-2 text-sm text-amber-700">Blocked: {props.blockedReason}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {props.status !== "IN_PROGRESS" && props.status !== "COMPLETED" ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => go("IN_PROGRESS")}
            >
              Start
            </Button>
          ) : null}
          {props.status !== "COMPLETED" ? (
            <Button
              size="sm"
              disabled={pending}
              onClick={() => go("COMPLETED")}
            >
              Complete
            </Button>
          ) : null}
          {!props.required && props.status !== "SKIPPED" ? (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => go("SKIPPED")}
            >
              Skip
            </Button>
          ) : null}
          {props.status !== "BLOCKED" ? (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setShowBlock((v) => !v)}
            >
              {showBlock ? "Cancel" : "Block"}
            </Button>
          ) : null}
        </div>
      </div>
      {showBlock ? (
        <div className="mt-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this step blocked?"
            rows={2}
          />
          <Button
            size="sm"
            variant="destructive"
            disabled={pending || reason.trim().length === 0}
            onClick={() => go("BLOCKED", reason.trim())}
          >
            Mark blocked
          </Button>
        </div>
      ) : null}
      {err ? <p className="mt-2 text-xs text-rose-600">{err}</p> : null}
    </li>
  );
}
