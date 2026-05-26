"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useActionState } from "react";

import { bulkAssignSupportTickets, submitDashboardSupportTicketForm } from "@/actions/support-tickets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SUPPORT_CATEGORY_LABEL } from "@/lib/support/support-categories";
import { SUPPORT_PRIORITY_LABEL } from "@/lib/support/support-priority";
import { SUPPORT_STATUS_LABEL } from "@/lib/support/support-status";
import type { SupportCenterSnapshot } from "@/services/support/support-service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type SupportTicketRow = {
  id: string;
  submitterUserId: string | null;
  assignedToId: string | null;
  subject: string;
  status: string;
  priority: string;
  category: string;
  severity: string;
  email: string;
  workspaceName: string | null;
  assignedName: string | null;
  slaDueAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="border-border/80 bg-card/95 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wide">{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function slaBadge(slaDueAt: string | null, status: string) {
  if (!slaDueAt || ["RESOLVED", "CLOSED", "CANCELLED", "DUPLICATE"].includes(status)) return null;
  const due = new Date(slaDueAt);
  const late = due.getTime() < Date.now();
  return (
    <Badge variant={late ? "destructive" : "secondary"} className="text-[10px]">
      {late ? "SLA overdue" : `SLA ${format(due, "MMM d HH:mm")}`}
    </Badge>
  );
}

function NewTicketPanel({
  workspaces,
  defaultEmail,
  defaultName,
}: {
  workspaces: { id: string; name: string }[];
  defaultEmail: string;
  defaultName: string;
}) {
  const [state, formAction, pending] = useActionState(submitDashboardSupportTicketForm, undefined);
  React.useEffect(() => {
    if (state?.ok && state.ticketRef) {
      toast.success(`Ticket ${state.ticketRef} created.`);
    } else {
      const _err = getActionError(state);
      if (_err) toast.error(_err);
    }
  }, [state]);

  const cats = Object.keys(SUPPORT_CATEGORY_LABEL) as (keyof typeof SUPPORT_CATEGORY_LABEL)[];
  const prios = Object.keys(SUPPORT_PRIORITY_LABEL) as (keyof typeof SUPPORT_PRIORITY_LABEL)[];

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle>New ticket</CardTitle>
        <CardDescription>
          Stored safely even if outbound email is not configured. Confirmation sends only when Resend is configured.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <input type="text" name="company_hp" className="hidden" tabIndex={-1} autoComplete="off" />
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="st-email">Email</Label>
              <Input id="st-email" name="email" type="email" defaultValue={defaultEmail} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="st-name">Name</Label>
              <Input id="st-name" name="requesterName" defaultValue={defaultName} placeholder="Your name" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="st-ws">Workspace</Label>
            <select
              id="st-ws"
              name="workspaceId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
            >
              <option value="">Not specified</option>
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="st-subj">Subject</Label>
              <Input id="st-subj" name="subject" required minLength={2} maxLength={255} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="st-cat">Category</Label>
              <select
                id="st-cat"
                name="category"
                required
                defaultValue="TECHNICAL"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {cats.map((k) => (
                  <option key={k} value={k}>
                    {SUPPORT_CATEGORY_LABEL[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="st-prio">Priority</Label>
              <select
                id="st-prio"
                name="priority"
                defaultValue="MEDIUM"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {prios.map((k) => (
                  <option key={k} value={k}>
                    {SUPPORT_PRIORITY_LABEL[k]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="st-sev">Severity</Label>
              <select
                id="st-sev"
                name="severity"
                defaultValue="MODERATE"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="st-mod">Affected module</Label>
              <Input id="st-mod" name="moduleKey" placeholder="e.g. integrations" maxLength={80} />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="st-relty">Related entity type</Label>
              <Input id="st-relty" name="relatedEntityType" placeholder="order, import_job, …" maxLength={80} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="st-relid">Related entity id</Label>
              <Input id="st-relid" name="relatedEntityId" maxLength={255} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="st-msg">Message</Label>
            <Textarea id="st-msg" name="message" required minLength={10} maxLength={8000} rows={6} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="st-diag" name="diagnosticsConsent" className="h-4 w-4 rounded border border-input" />
            <Label htmlFor="st-diag" className="text-sm font-normal text-muted-foreground">
              Share redacted browser metadata (no secrets) to speed up diagnosis
            </Label>
          </div>
          <input
            type="hidden"
            name="browserInfoJson"
            value={typeof window !== "undefined" ? JSON.stringify({ ua: navigator.userAgent, lang: navigator.language }) : ""}
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Submitting…" : "Submit ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TicketTable({
  tickets,
  canTriage,
  assignees,
}: {
  tickets: SupportTicketRow[];
  canTriage: boolean;
  assignees: { id: string; label: string }[];
}) {
  const [sel, setSel] = React.useState<Set<string>>(() => new Set());
  const toggle = (id: string) =>
    setSel((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="space-y-3">
      {canTriage ? (
        <div className="flex flex-wrap items-center gap-2">
          <Select
            onValueChange={async (v) => {
              const ids = [...sel];
              if (!ids.length) {
                toast.message("Select tickets first.");
                return;
              }
              await bulkAssignSupportTickets(ids, v === "__none__" ? null : v);
              toast.success("Assignments updated.");
              setSel(new Set());
              window.location.reload();
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Bulk assign…" />
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
          <span className="text-xs text-muted-foreground">{sel.size} selected</span>
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-border/80">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              {canTriage ? <th className="w-10 p-3" /> : null}
              <th className="p-3">Ticket</th>
              <th className="p-3">Status</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Category</th>
              <th className="p-3">Workspace</th>
              <th className="p-3">Requester</th>
              <th className="p-3">Owner</th>
              <th className="p-3">SLA</th>
              <th className="p-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-border/60 hover:bg-muted/20">
                {canTriage ? (
                  <td className="p-3">
                    <Checkbox checked={sel.has(t.id)} onCheckedChange={() => toggle(t.id)} />
                  </td>
                ) : null}
                <td className="p-3">
                  <Link href={`/dashboard/support/${t.id}`} className="font-medium text-primary hover:underline">
                    {t.subject}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    KS-{t.id.replace(/-/g, "").slice(0, 8).toUpperCase()}
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant="outline" className="font-normal">
                    {SUPPORT_STATUS_LABEL[t.status as keyof typeof SUPPORT_STATUS_LABEL] ?? t.status}
                  </Badge>
                </td>
                <td className="p-3">
                  <span className={cn(t.priority === "CRITICAL" && "font-medium text-destructive")}>
                    {SUPPORT_PRIORITY_LABEL[t.priority as keyof typeof SUPPORT_PRIORITY_LABEL] ?? t.priority}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">
                  {SUPPORT_CATEGORY_LABEL[t.category as keyof typeof SUPPORT_CATEGORY_LABEL] ?? t.category}
                </td>
                <td className="p-3">{t.workspaceName ?? "—"}</td>
                <td className="p-3 text-xs">{t.email}</td>
                <td className="p-3 text-xs">{t.assignedName ?? "—"}</td>
                <td className="p-3">{slaBadge(t.slaDueAt, t.status)}</td>
                <td className="p-3 text-xs text-muted-foreground">{format(new Date(t.updatedAt), "MMM d HH:mm")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="text-base font-semibold">No support tickets yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Create a ticket when you need help with setup, integrations, billing, imports, production, storefront, or
              operational workflows.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/support?tab=new">Create ticket</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SupportCenterClient({
  snapshot,
  tickets,
  workspaces,
  assignees,
  userId,
  defaultEmail,
  defaultName,
}: {
  snapshot: SupportCenterSnapshot;
  tickets: SupportTicketRow[];
  workspaces: { id: string; name: string }[];
  assignees: { id: string; label: string }[];
  userId: string;
  defaultEmail: string;
  defaultName: string;
}) {
  const sp = useSearchParams();
  const tab = sp.get("tab") ?? "my";
  const { canTriage, kpis } = snapshot;

  const em = defaultEmail.trim().toLowerCase();
  const myTickets = React.useMemo(
    () => tickets.filter((t) => t.submitterUserId === userId || t.email.toLowerCase() === em),
    [tickets, userId, em],
  );

  const filtered = (pred: (t: SupportTicketRow) => boolean) => tickets.filter(pred);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Support</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Create, track, triage, and resolve support tickets, integration issues, onboarding blockers, bugs, and
            operational incidents.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/support?tab=new">New ticket</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/support/kb">Knowledge base</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Open tickets" value={kpis.openTickets} />
        <Kpi label="Awaiting response" value={kpis.awaitingResponse} />
        <Kpi label="Assigned to me" value={kpis.assignedToMe} />
        <Kpi label="Overdue SLA" value={kpis.overdueSla} />
        <Kpi label="Critical / security" value={kpis.criticalIssues} />
        <Kpi label="Integration issues" value={kpis.integrationIssues} />
        <Kpi label="Billing tickets" value={kpis.billingTickets} />
        <Kpi label="Resolved this week" value={kpis.resolvedThisWeek} />
      </div>

      <Tabs key={tab} defaultValue={tab} className="space-y-4">
        <TabsList className="flex h-auto max-w-full flex-wrap gap-1">
          <TabsTrigger value="my">My tickets</TabsTrigger>
          <TabsTrigger value="new">New ticket</TabsTrigger>
          <TabsTrigger value="kb">Knowledge base</TabsTrigger>
          {canTriage ? (
            <>
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="assigned">Assigned to me</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
              <TabsTrigger value="bugs">Bugs</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </>
          ) : null}
        </TabsList>

        <TabsContent value="my">
          <TicketTable tickets={myTickets} canTriage={canTriage} assignees={assignees} />
        </TabsContent>
        <TabsContent value="new">
          <NewTicketPanel workspaces={workspaces} defaultEmail={defaultEmail} defaultName={defaultName} />
        </TabsContent>
        <TabsContent value="kb">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge base</CardTitle>
              <CardDescription>Browse curated articles from the Support section.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/dashboard/support/kb">Open knowledge base</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        {canTriage ? (
          <>
            <TabsContent value="inbox">
              <TicketTable tickets={filtered(() => true)} canTriage={canTriage} assignees={assignees} />
            </TabsContent>
            <TabsContent value="assigned">
              <TicketTable
                tickets={filtered((t) => t.assignedToId === userId)}
                canTriage={canTriage}
                assignees={assignees}
              />
            </TabsContent>
            <TabsContent value="critical">
              <TicketTable
                tickets={filtered((t) => t.priority === "CRITICAL" || t.category === "SECURITY")}
                canTriage={canTriage}
                assignees={assignees}
              />
            </TabsContent>
            <TabsContent value="integrations">
              <TicketTable tickets={filtered((t) => t.category === "INTEGRATION")} canTriage={canTriage} assignees={assignees} />
            </TabsContent>
            <TabsContent value="billing">
              <TicketTable tickets={filtered((t) => t.category === "BILLING")} canTriage={canTriage} assignees={assignees} />
            </TabsContent>
            <TabsContent value="onboarding">
              <TicketTable tickets={filtered((t) => t.category === "ONBOARDING")} canTriage={canTriage} assignees={assignees} />
            </TabsContent>
            <TabsContent value="bugs">
              <TicketTable tickets={filtered((t) => t.category === "BUG")} canTriage={canTriage} assignees={assignees} />
            </TabsContent>
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>Volume and SLA analytics for your scope.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline">
                    <Link href="/dashboard/support/reports">Open reports</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : null}
      </Tabs>
    </div>
  );
}
