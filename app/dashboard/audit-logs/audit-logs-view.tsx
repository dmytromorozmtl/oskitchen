"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { AuditExportFormat } from "@prisma/client";

import {
  getAuditLogDetailAction,
  loadMoreAuditLogsAction,
  runAuditExportAction,
  type AuditCenterFlags,
} from "@/actions/audit-center";
import { buildAuditExportDownloadHref } from "@/lib/audit/audit-export-filters";
import type { AuditListFilters } from "@/lib/audit/audit-types";
import type { AuditKpis } from "@/services/audit/audit-query-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
export type SerializedAuditRow = {
  id: string;
  createdAt: string;
  action: string;
  category: string | null;
  severity: string | null;
  source: string | null;
  entityType: string;
  entityId: string | null;
  entityLabel: string | null;
  userId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  route: string | null;
  method: string | null;
  requestId: string | null;
  redactionApplied: boolean;
  workspaceId: string | null;
};

type ExportHistoryRow = {
  id: string;
  format: AuditExportFormat;
  status: string;
  rowCount: number;
  createdAt: string;
  completedAt: string | null;
};

function buildHref(next: Partial<AuditListFilters> & { cursor?: string | null }): string {
  const base = new URLSearchParams();
  const f = next;
  if (f.tab && f.tab !== "activity") base.set("tab", f.tab);
  if (f.action) base.set("action", f.action);
  if (f.category) base.set("category", f.category);
  if (f.source) base.set("source", f.source);
  if (f.severity) base.set("severity", f.severity);
  if (f.actorUserId) base.set("user", f.actorUserId);
  if (f.actorEmail) base.set("email", f.actorEmail);
  if (f.entityType) base.set("entityType", f.entityType);
  if (f.entityId) base.set("entityId", f.entityId);
  if (f.requestId) base.set("requestId", f.requestId);
  if (f.route) base.set("route", f.route);
  if (f.keyword) base.set("q", f.keyword);
  if (f.from) base.set("from", f.from.toISOString());
  if (f.to) base.set("to", f.to.toISOString());
  if (f.redactionApplied) base.set("redaction", "1");
  if (f.onlyCritical) base.set("critical", "1");
  if (f.onlyFailed) base.set("failed", "1");
  if (f.workspaceId) base.set("workspaceId", f.workspaceId);
  if (next.cursor) base.set("cursor", next.cursor);
  const q = base.toString();
  return q ? `/dashboard/audit-logs?${q}` : "/dashboard/audit-logs";
}

function severityVariant(s: string | null | undefined): "default" | "secondary" | "destructive" | "outline" {
  if (s === "CRITICAL") return "destructive";
  if (s === "WARNING") return "destructive";
  if (s === "NOTICE") return "secondary";
  return "outline";
}

function summaryLine(row: SerializedAuditRow): string {
  const parts = [row.entityType];
  if (row.entityLabel) parts.push(row.entityLabel);
  else if (row.entityId) parts.push(row.entityId);
  return parts.join(" · ");
}

export function AuditLogsView(props: {
  initialFilters: AuditListFilters;
  initialRows: SerializedAuditRow[];
  nextCursor: string | null;
  kpis: AuditKpis;
  flags: AuditCenterFlags;
  exportHistory: ExportHistoryRow[];
  primaryWorkspaceId: string | null;
}) {
  const router = useRouter();
  const [rows, setRows] = React.useState(props.initialRows);
  const [nextCursor, setNextCursor] = React.useState(props.nextCursor);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<{ row: Record<string, unknown>; related: Record<string, unknown>[] } | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  React.useEffect(() => {
    setRows(props.initialRows);
    setNextCursor(props.nextCursor);
  }, [props.initialRows, props.nextCursor]);

  const filters = props.initialFilters;
  const tab = filters.tab ?? "activity";

  async function onLoadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    const res = await loadMoreAuditLogsAction(filters, nextCursor);
    setLoadingMore(false);
    if (!res.ok) return;
    const mapped = res.rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })) as SerializedAuditRow[];
    setRows((prev) => [...prev, ...mapped]);
    setNextCursor(res.nextCursor);
  }

  React.useEffect(() => {
    if (!detailId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    void getAuditLogDetailAction(detailId).then((res) => {
      if (cancelled) return;
      setDetailLoading(false);
      if (res.ok) setDetail({ row: res.row, related: res.related });
      else setDetail(null);
    });
    return () => {
      cancelled = true;
    };
  }, [detailId]);

  async function onExport(format: AuditExportFormat) {
    if (!props.flags.canExport) return;
    setExporting(true);
    const res = await runAuditExportAction({ format, filters });
    setExporting(false);
    if (!res.ok) return;
    const blob = new Blob([res.body], { type: format === "CSV" ? "text/csv;charset=utf-8" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = res.filename;
    a.click();
    URL.revokeObjectURL(url);
    router.refresh();
  }

  const hasRows = rows.length > 0;
  const isFiltered =
    Boolean(filters.action || filters.category || filters.source || filters.severity || filters.keyword || filters.from || filters.to);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Audit Logs</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Enterprise-grade activity trail for security, compliance, debugging, and operational accountability. Secrets are never logged.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {props.flags.canExport ? (
            <>
              <Button disabled={exporting} onClick={() => void onExport("CSV")}>
                Export CSV
              </Button>
              <Button variant="outline" disabled={exporting} onClick={() => void onExport("JSON")}>
                Export JSON
              </Button>
              <Button variant="secondary" asChild>
                <a
                  href={buildAuditExportDownloadHref({ filters, format: "csv", signed: true })}
                  download
                >
                  Signed CSV
                </a>
              </Button>
            </>
          ) : null}
          {props.flags.canManageRetention ? (
            <Button variant="secondary" asChild>
              <Link href="/dashboard/audit-logs/retention">Retention policy</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi title="Events today" value={props.kpis.eventsToday} />
        <Kpi title="Warnings" value={props.kpis.warnings} />
        <Kpi title="Critical" value={props.kpis.critical} />
        <Kpi title="Failed webhooks" value={props.kpis.failedWebhooks} />
        <Kpi title="Permission changes" value={props.kpis.permissionChanges} />
        <Kpi title="Imports committed" value={props.kpis.importsCommitted} />
        <Kpi title="Billing events" value={props.kpis.billingEvents} />
        <Kpi title="Suspicious / critical flags" value={props.kpis.suspicious} />
      </div>

      <Tabs value={tab} className="w-full">
        <TabsList className="flex h-auto max-w-full flex-wrap justify-start gap-1">
          {(
            [
              ["activity", "Activity"],
              ["security", "Security"],
              ["data", "Data changes"],
              ["integrations", "Integrations"],
              ["imports", "Imports"],
              ["billing", "Billing"],
              ["ai", "AI / Automation"],
              ["exports", "Exports"],
              ["storefront", "Storefront"],
            ] as const
          ).map(([key, label]) => (
            <TabsTrigger key={key} value={key} asChild>
              <Link href={buildHref({ ...filters, tab: key, cursor: undefined })} className="no-underline">
                {label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Deep-linkable query filters. Combine with tabs for preset lenses.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3 lg:grid-cols-4" method="get" action="/dashboard/audit-logs">
            <input type="hidden" name="tab" value={tab} />
            <Field label="Action contains">
              <Input name="action" defaultValue={filters.action ?? ""} placeholder="ORDER_CREATED" />
            </Field>
            <Field label="Category">
              <Input name="category" defaultValue={filters.category ?? ""} placeholder="SETTINGS" />
            </Field>
            <Field label="Keyword">
              <Input name="q" defaultValue={filters.keyword ?? ""} placeholder="Search summary fields" />
            </Field>
            <Field label="Actor user id">
              <Input name="user" defaultValue={filters.actorUserId ?? ""} />
            </Field>
            <Field label="Actor email">
              <Input name="email" defaultValue={filters.actorEmail ?? ""} />
            </Field>
            <Field label="Entity type">
              <Input name="entityType" defaultValue={filters.entityType ?? ""} />
            </Field>
            <Field label="Entity id">
              <Input name="entityId" defaultValue={filters.entityId ?? ""} />
            </Field>
            <Field label="Request id">
              <Input name="requestId" defaultValue={filters.requestId ?? ""} />
            </Field>
            <Field label="Route contains">
              <Input name="route" defaultValue={filters.route ?? ""} />
            </Field>
            <Field label="From (ISO)">
              <Input name="from" type="datetime-local" defaultValue={filters.from ? localInputValue(filters.from) : ""} />
            </Field>
            <Field label="To (ISO)">
              <Input name="to" type="datetime-local" defaultValue={filters.to ? localInputValue(filters.to) : ""} />
            </Field>
            <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="redaction" value="1" defaultChecked={filters.redactionApplied === true} />
                Redaction applied
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="critical" value="1" defaultChecked={filters.onlyCritical === true} />
                Only warnings / critical
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="failed" value="1" defaultChecked={filters.onlyFailed === true} />
                Only failed / error-class
              </label>
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-2 lg:col-span-4">
              <Button type="submit">Apply filters</Button>
              <Button type="button" variant="outline" asChild>
                <Link href={buildHref({ tab, cursor: undefined })}>Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {tab === "exports" ? (
        <Card>
          <CardHeader>
            <CardTitle>Export history</CardTitle>
            <CardDescription>Compliance exports are recorded. Downloads are generated client-side (up to 5,000 rows per run).</CardDescription>
          </CardHeader>
          <CardContent>
            {props.exportHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No exports yet. Use Export CSV / JSON above.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Rows</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {props.exportHistory.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="whitespace-nowrap text-xs">{new Date(e.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{e.format}</TableCell>
                      <TableCell>{e.status}</TableCell>
                      <TableCell className="text-right">{e.rowCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : null}

      {tab === "security" && !hasRows ? (
        <EmptySecurity />
      ) : !hasRows ? (
        isFiltered ? (
          <EmptyFiltered />
        ) : (
          <EmptyAll />
        )
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Time</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead className="text-right"> </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(row.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={severityVariant(row.severity)}>{row.severity ?? "—"}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium">{row.action}</TableCell>
                    <TableCell className="text-muted-foreground">{row.category ?? "—"}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-xs">
                      {row.actorEmail ?? row.userId ?? "—"}
                    </TableCell>
                    <TableCell>{row.source ?? "—"}</TableCell>
                    <TableCell className="max-w-[140px] truncate text-xs">
                      {row.entityType}
                      {row.entityId ? <span className="text-muted-foreground"> #{row.entityId.slice(0, 8)}…</span> : null}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">{summaryLine(row)}</TableCell>
                    <TableCell className="max-w-[160px] truncate text-xs">{row.route ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button type="button" size="sm" variant="ghost" onClick={() => setDetailId(row.id)}>
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {nextCursor ? (
              <div className="border-t p-3 text-center">
                <Button type="button" variant="outline" disabled={loadingMore} onClick={() => void onLoadMore()}>
                  {loadingMore ? "Loading…" : "Load more"}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Sheet open={detailId !== null} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Event detail</SheetTitle>
            <SheetDescription>PII-sensitive payloads are hidden unless you are owner/admin or platform superadmin.</SheetDescription>
          </SheetHeader>
          {detailLoading ? <p className="mt-4 text-sm text-muted-foreground">Loading…</p> : null}
          {!detailLoading && detail ? (
            <div className="mt-4 space-y-4 text-sm">
              <JsonBlock title="Summary" value={detail.row} />
              {detail.related.length ? <JsonBlock title="Related timeline (same entity)" value={detail.related} /> : null}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Kpi(props: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{props.title}</CardDescription>
        <CardTitle className="text-2xl">{props.value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{props.label}</Label>
      {props.children}
    </div>
  );
}

function JsonBlock(props: { title: string; value: unknown }) {
  return (
    <div>
      <div className="mb-1 font-medium">{props.title}</div>
      <pre className="max-h-[420px] overflow-auto rounded-md border bg-muted/40 p-3 text-xs leading-relaxed">{JSON.stringify(props.value, null, 2)}</pre>
    </div>
  );
}

function localInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EmptyAll() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No audit events yet</CardTitle>
        <CardDescription>
          Important actions across orders, settings, staff, integrations, imports, billing, and production will appear here once activity starts.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/dashboard/settings">Open Settings</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/orders">Create test order</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptySecurity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No security events detected</CardTitle>
        <CardDescription>
          Permission changes, staff invitations, API key changes, and suspicious activity will appear here.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function EmptyFiltered() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No matching audit events</CardTitle>
        <CardDescription>Try widening the date range or removing filters.</CardDescription>
      </CardHeader>
    </Card>
  );
}
