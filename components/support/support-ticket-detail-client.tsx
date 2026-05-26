"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";

import {
  addSupportTicketComment,
  assignSupportTicket,
  escalateSupportTicketAction,
  updateSupportTicketStatus,
} from "@/actions/support-tickets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  SUPPORT_COMMENT_VISIBILITY_LABEL,
  supportCommentVisibilityBadgeLabel,
} from "@/lib/support/support-comment-visibility-labels";
import { SUPPORT_CATEGORY_LABEL } from "@/lib/support/support-categories";
import { SUPPORT_PRIORITY_LABEL } from "@/lib/support/support-priority";
import { SUPPORT_STATUS_LABEL } from "@/lib/support/support-status";
import { toast } from "sonner";

export type TicketDetailSerialized = {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  severity: string;
  category: string;
  email: string;
  requesterName: string | null;
  workspaceName: string | null;
  moduleKey: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  slaDueAt: string | null;
  createdAt: string;
};

export type CommentRow = {
  id: string;
  message: string;
  visibility: string;
  createdAt: string;
  authorName: string | null;
};

export type EventRow = {
  id: string;
  eventType: string;
  createdAt: string;
  metadata: unknown;
};

export type AuditRow = {
  id: string;
  action: string;
  createdAt: string;
  entityType: string;
  entityLabel: string | null;
};

export function SupportTicketDetailClient({
  ticket,
  comments,
  events,
  auditRows,
  canTriage,
  assignees,
}: {
  ticket: TicketDetailSerialized;
  comments: CommentRow[];
  events: EventRow[];
  auditRows: AuditRow[];
  canTriage: boolean;
  assignees: { id: string; label: string }[];
}) {
  const [busy, setBusy] = React.useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/support">← Back</Link>
        </Button>
        <Badge variant="outline">
          KS-{ticket.id.replace(/-/g, "").slice(0, 8).toUpperCase()}
        </Badge>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {SUPPORT_CATEGORY_LABEL[ticket.category as keyof typeof SUPPORT_CATEGORY_LABEL] ?? ticket.category} ·{" "}
          {SUPPORT_PRIORITY_LABEL[ticket.priority as keyof typeof SUPPORT_PRIORITY_LABEL] ?? ticket.priority} ·{" "}
          {SUPPORT_STATUS_LABEL[ticket.status as keyof typeof SUPPORT_STATUS_LABEL] ?? ticket.status}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Original message</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm">{ticket.message}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Requester:</span> {ticket.requesterName ?? "—"} ({ticket.email})
            </p>
            <p>
              <span className="text-muted-foreground">Workspace:</span> {ticket.workspaceName ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Module:</span> {ticket.moduleKey ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Related:</span> {ticket.relatedEntityType ?? "—"}{" "}
              {ticket.relatedEntityId ?? ""}
            </p>
            <p>
              <span className="text-muted-foreground">SLA due:</span>{" "}
              {ticket.slaDueAt ? format(new Date(ticket.slaDueAt), "MMM d yyyy HH:mm") : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {canTriage ? (
        <Card>
          <CardHeader>
            <CardTitle>Triage</CardTitle>
            <CardDescription>Assign, change status, or escalate.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Select
              onValueChange={async (v) => {
                setBusy(true);
                const res = await assignSupportTicket(ticket.id, v === "__none__" ? null : v);
                setBusy(false);
                if ("error" in res && res.error) toast.error(getActionError(res) ?? "Something went wrong");
                else {
                  toast.success("Updated assignment.");
                  window.location.reload();
                }
              }}
            >
              <SelectTrigger className="w-[220px]" disabled={busy}>
                <SelectValue placeholder="Assign to…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Unassigned</SelectItem>
                {assignees.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={async (v) => {
                setBusy(true);
                const res = await updateSupportTicketStatus(ticket.id, v as import("@prisma/client").SupportTicketStatus);
                setBusy(false);
                if ("error" in res && res.error) toast.error(getActionError(res) ?? "Something went wrong");
                else {
                  toast.success("Status updated.");
                  window.location.reload();
                }
              }}
            >
              <SelectTrigger className="w-[200px]" disabled={busy}>
                <SelectValue placeholder="Set status…" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SUPPORT_STATUS_LABEL) as (keyof typeof SUPPORT_STATUS_LABEL)[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {SUPPORT_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const res = await escalateSupportTicketAction(ticket.id);
                setBusy(false);
                if ("error" in res && res.error) toast.error(getActionError(res) ?? "Something went wrong");
                else {
                  toast.success("Escalated.");
                  window.location.reload();
                }
              }}
            >
              Escalate
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thread</CardTitle>
            <CardDescription>
              Внутренние заметки не видны клиенту. По умолчанию ответ помечается как «Сообщение клиенту».
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="rounded-lg border border-border/70 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{format(new Date(c.createdAt), "MMM d HH:mm")}</span>
                  <Badge variant="secondary" className="max-w-[min(100%,18rem)] whitespace-normal text-left text-[10px] leading-snug">
                    {supportCommentVisibilityBadgeLabel(c.visibility)}
                  </Badge>
                  <span>{c.authorName ?? "User"}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap">{c.message}</p>
              </div>
            ))}
            {comments.length === 0 ? <p className="text-sm text-muted-foreground">No replies yet.</p> : null}
            <form
              className="grid gap-2 border-t border-border/60 pt-4"
              onSubmit={async (ev) => {
                ev.preventDefault();
                const fd = new FormData(ev.currentTarget);
                const message = String(fd.get("message") ?? "").trim();
                const visibility = String(fd.get("visibility") ?? "CUSTOMER") as "INTERNAL" | "CUSTOMER" | "PARTNER";
                const res = await addSupportTicketComment({ ticketId: ticket.id, message, visibility });
                if ("error" in res && res.error) toast.error(getActionError(res) ?? "Something went wrong");
                else {
                  toast.success("Comment added.");
                  window.location.reload();
                }
              }}
            >
              <Label htmlFor="reply">Add reply</Label>
              <Textarea id="reply" name="message" required minLength={1} rows={4} />
              {canTriage ? (
                <div className="grid gap-2">
                  <Label>Visibility</Label>
                  <select name="visibility" className="min-h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue="CUSTOMER">
                    {(Object.keys(SUPPORT_COMMENT_VISIBILITY_LABEL) as (keyof typeof SUPPORT_COMMENT_VISIBILITY_LABEL)[]).map(
                      (key) => (
                        <option key={key} value={key}>
                          {SUPPORT_COMMENT_VISIBILITY_LABEL[key]}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              ) : (
                <input type="hidden" name="visibility" value="CUSTOMER" />
              )}
              <Button type="submit">Send</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Ticket events and nearby audit context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {events.map((e) => (
              <div key={e.id} className="border-b border-border/60 pb-2 last:border-0">
                <div className="font-medium">{e.eventType.replace(/_/g, " ")}</div>
                <div className="text-xs text-muted-foreground">{format(new Date(e.createdAt), "MMM d HH:mm:ss")}</div>
              </div>
            ))}
            {events.length === 0 ? <p className="text-muted-foreground">No events yet.</p> : null}
            <div className="pt-4">
              <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Audit (workspace scoped)</h4>
              {auditRows.map((a) => (
                <div key={a.id} className="border-b border-border/40 py-1 text-xs last:border-0">
                  <span className="font-medium">{a.action}</span> · {a.entityType}{" "}
                  {a.entityLabel ? `— ${a.entityLabel}` : ""}{" "}
                  <span className="text-muted-foreground">{format(new Date(a.createdAt), "MMM d HH:mm")}</span>
                </div>
              ))}
              {auditRows.length === 0 ? <p className="text-xs text-muted-foreground">No audit rows in window.</p> : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
