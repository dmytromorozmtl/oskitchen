"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import type { PartnerOrgType, PartnerTier } from "@prisma/client";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { createPartnerOrganization } from "@/actions/partner-operations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IMPLEMENTATION_PIPELINE_ORDER } from "@/services/partner/partner-implementation-service";
import type { PartnerClientRowSerialized, PartnerCommandCenterSerialized } from "@/services/partner/partner-service";
import { PARTNER_CLIENT_STATUS_LABEL, PARTNER_ORG_TYPE_LABEL } from "@/lib/partner/partner-status";
import { PARTNER_TIER_LABEL } from "@/lib/partner/partner-tier";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FILTER_STORAGE_KEY = "partner-dashboard-client-filters-v1";

function formatUsdFromCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="border-border/80 bg-card/95 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums tracking-tight">{value}</CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent className="pt-0 text-[11px] leading-snug text-muted-foreground">{hint}</CardContent>
      ) : null}
    </Card>
  );
}

function tagsToString(tags: unknown): string | null {
  if (tags == null) return null;
  if (Array.isArray(tags)) return tags.map(String).join(", ");
  if (typeof tags === "object") return JSON.stringify(tags);
  return String(tags);
}

export function PartnerOperationsCenter({
  initial,
  canProvision,
}: {
  initial: PartnerCommandCenterSerialized;
  canProvision: boolean;
}) {
  const [snap, setSnap] = React.useState(initial);
  const [search, setSearch] = React.useState("");
  const [stageFilter, setStageFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [detail, setDetail] = React.useState<PartnerClientRowSerialized | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());
  const [createOpen, setCreateOpen] = React.useState(false);
  const [orgName, setOrgName] = React.useState("");
  const [orgType, setOrgType] = React.useState<PartnerOrgType>("AGENCY");
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    setSnap(initial);
  }, [initial]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTER_STORAGE_KEY);
      if (!raw) return;
      const j = JSON.parse(raw) as { search?: string; stageFilter?: string; statusFilter?: string };
      if (typeof j.search === "string") setSearch(j.search);
      if (typeof j.stageFilter === "string") setStageFilter(j.stageFilter);
      if (typeof j.statusFilter === "string") setStatusFilter(j.statusFilter);
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify({ search, stageFilter, statusFilter }));
    } catch {
      /* ignore */
    }
  }, [search, stageFilter, statusFilter]);

  const { kpis, clients, implementationDistribution, organizations, migrationReady, revenueByType } = snap;

  const filteredClients = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (stageFilter !== "ALL" && c.implementationStage !== stageFilter) return false;
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.businessName.toLowerCase().includes(q) ||
        c.clientEmail.toLowerCase().includes(q) ||
        (c.workspaceName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [clients, search, stageFilter, statusFilter]);

  const chartData = React.useMemo(
    () =>
      implementationDistribution.map((d) => ({
        stage: d.stage.replace(/_/g, " "),
        count: d.count,
      })),
    [implementationDistribution],
  );

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    if (selected.size === filteredClients.length && filteredClients.length > 0) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(filteredClients.map((c) => c.id)));
  };

  async function onCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await createPartnerOrganization({ name: orgName, orgType });
    setCreating(false);
    if ("error" in res && res.error) {
      toast.error(getActionError(res) ?? "Something went wrong");
      return;
    }
    toast.success("Partner organization created.");
    setCreateOpen(false);
    setOrgName("");
    setOrgType("AGENCY");
    window.location.reload();
  }

  return (
    <div className="space-y-8">
      {!migrationReady ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          Partner schema is not fully migrated — metrics are degraded. Run{" "}
          <code className="rounded bg-background/60 px-1 py-0.5 text-xs">prisma migrate deploy</code> in the
          deployment environment.
        </div>
      ) : null}

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Partner operations center</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Enterprise hub for agencies, consultants, implementation firms, and regional operators — client
          workspaces, pipeline health, revenue signals, and support load in one tenant-safe surface.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Kpi label="Active clients" value={kpis.activeClients} hint="Live + implementing" />
        <Kpi label="Onboarding projects" value={kpis.onboardingProjects} />
        <Kpi label="Go-live this week" value={kpis.goLiveThisWeek} />
        <Kpi label="At-risk workspaces" value={kpis.atRiskWorkspaces} hint="Health & stall heuristics" />
        <Kpi label="MRR managed" value={formatUsdFromCents(kpis.mrrManagedCents)} />
        <Kpi label="Implementation success" value={`${kpis.implementationSuccessPct}%`} hint="Post go-live stages" />
        <Kpi label="Support load" value={kpis.supportLoad} hint="Open managed tickets" />
        <Kpi label="Expansion opportunities" value={kpis.expansionOpportunities} />
        <Kpi label="Churn risk" value={kpis.churnRiskCount} />
        <Kpi label="Partner revenue (90d)" value={formatUsdFromCents(kpis.partnerRevenue90dCents)} />
        <Kpi label="Avg health score" value={kpis.avgHealth || "—"} />
        <Kpi label="Training completion (proxy)" value={`${kpis.trainingCompletionPct}%`} hint="Heuristic by status" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/80 bg-card/95 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Implementation pipeline</CardTitle>
            <CardDescription>Distribution across lifecycle stages for your accessible partner accounts.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={70} />
                <YAxis allowDecimals={false} width={32} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Revenue mix</CardTitle>
            <CardDescription>Attributed partner revenue rows (90d window not applied here).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {revenueByType.length === 0 ? (
              <p className="text-muted-foreground">No revenue rows yet.</p>
            ) : (
              revenueByType.map((r) => (
                <div key={r.type} className="flex items-center justify-between gap-2 border-b border-border/60 py-1.5 last:border-0">
                  <span className="text-muted-foreground">{r.type.replace(/_/g, " ")}</span>
                  <span className="font-medium tabular-nums">{formatUsdFromCents(r.amountCents)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Pipeline board</h2>
          <p className="text-xs text-muted-foreground">Read-only columns — drag-and-drop stages ship in a follow-up.</p>
        </div>
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex min-w-max gap-2">
            {IMPLEMENTATION_PIPELINE_ORDER.map((stage) => {
              const count = implementationDistribution.find((d) => d.stage === stage)?.count ?? 0;
              const label =
                stage === "GO_LIVE"
                  ? "Go-live"
                  : stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <div
                  key={stage}
                  className="flex w-40 shrink-0 flex-col rounded-lg border border-border/80 bg-muted/30 px-3 py-2"
                >
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
                  <span className="mt-1 text-2xl font-semibold tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Partner organizations</CardTitle>
            <CardDescription>Accounts you can operate under this session (tenant-scoped).</CardDescription>
          </div>
          {canProvision ? (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button type="button" size="sm">
                  Create partner organization
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={onCreateOrg}>
                  <DialogHeader>
                    <DialogTitle>New partner organization</DialogTitle>
                    <DialogDescription>
                      Creates a partner shell you own. Consultants without provision rights should be invited as
                      members instead.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label htmlFor="po-name">Organization name</Label>
                      <Input
                        id="po-name"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="e.g. Northwind Implementation"
                        required
                        minLength={2}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Type</Label>
                      <Select value={orgType} onValueChange={(v) => setOrgType(v as PartnerOrgType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(PARTNER_ORG_TYPE_LABEL) as PartnerOrgType[]).map((k) => (
                            <SelectItem key={k} value={k}>
                              {PARTNER_ORG_TYPE_LABEL[k]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={creating}>
                      {creating ? "Creating…" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : null}
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
              <h3 className="text-base font-semibold">No partner organizations yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Partner organizations allow agencies, consultants, and implementation teams to manage multiple
                OS Kitchen client workspaces securely.
              </p>
              {canProvision ? (
                <Button type="button" className="mt-4" onClick={() => setCreateOpen(true)}>
                  Create partner organization
                </Button>
              ) : (
                <p className="mt-4 text-xs text-muted-foreground">
                  Ask a platform administrator to provision an organization or invite you as a partner member.
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {organizations.map((o) => (
                <div key={o.id} className="rounded-lg border border-border/80 bg-background/60 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{o.name}</h3>
                    <Badge variant="secondary">{PARTNER_ORG_TYPE_LABEL[o.orgType as PartnerOrgType] ?? o.orgType}</Badge>
                    {o.whiteLabelEnabled ? <Badge variant="outline">White-label</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {PARTNER_TIER_LABEL[o.tier as PartnerTier] ?? o.tier} · {o.clientCount} clients ·{" "}
                    {o.status}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">{o.slug}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle>Client workspaces</CardTitle>
          <CardDescription>
            Search, filter, and inspect managed restaurants. Server-side pagination ships next; this view loads the
            latest {clients.length} rows across your accessible accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="client-search">Search</Label>
              <Input
                id="client-search"
                placeholder="Business, workspace, or client email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid gap-2 lg:w-48">
              <Label>Stage</Label>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All stages</SelectItem>
                  {IMPLEMENTATION_PIPELINE_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 lg:w-44">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  {(Object.keys(PARTNER_CLIENT_STATUS_LABEL) as (keyof typeof PARTNER_CLIENT_STATUS_LABEL)[]).map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {PARTNER_CLIENT_STATUS_LABEL[s]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={toggleSelectAllVisible}>
              {selected.size === filteredClients.length && filteredClients.length > 0 ? "Clear selection" : "Select visible"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={selected.size === 0}
              onClick={() => {
                const ids = filteredClients.filter((c) => selected.has(c.id)).map((c) => c.id);
                void navigator.clipboard.writeText(ids.join("\n"));
                toast.message(`Copied ${ids.length} client id(s) to clipboard.`);
              }}
            >
              Copy selected IDs
            </Button>
            <span className="text-xs text-muted-foreground">
              Filters persist locally (saved view). {selected.size} selected.
            </span>
          </div>

          {filteredClients.length === 0 && clients.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
              <h3 className="text-base font-semibold">No client workspaces assigned</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Assigned restaurant, catering, café, or enterprise workspaces will appear here once onboarding begins.
              </p>
            </div>
          ) : filteredClients.length === 0 ? (
            <p className="text-sm text-muted-foreground">No clients match your filters.</p>
          ) : (
            <div className="rounded-md border border-border/80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Client</TableHead>
                    <TableHead>Workspace</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">MRR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((c) => (
                    <TableRow
                      key={c.id}
                      className={cn("cursor-pointer", selected.has(c.id) && "bg-muted/40")}
                      onClick={() => setDetail(c)}
                    >
                      <TableCell
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelected(c.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={selected.has(c.id)}
                          onChange={() => toggleSelected(c.id)}
                          aria-label={`Select ${c.businessName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{c.businessName}</div>
                        <div className="text-xs text-muted-foreground">{c.clientEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{c.workspaceName ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.workspaceActive == null ? "" : c.workspaceActive ? "Active" : "Inactive"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {c.implementationStageLabel}
                        </Badge>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {PARTNER_CLIENT_STATUS_LABEL[c.status as keyof typeof PARTNER_CLIENT_STATUS_LABEL] ?? c.status}
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">{c.healthScore ?? "—"}</TableCell>
                      <TableCell className="max-w-[140px] truncate text-sm">
                        {c.assignedManagerName ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {c.mrrCents != null ? formatUsdFromCents(c.mrrCents) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={detail != null} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {detail ? (
            <>
              <SheetHeader>
                <SheetTitle>{detail.businessName}</SheetTitle>
                <SheetDescription>
                  {detail.workspaceName ?? "No workspace linked"} · {detail.implementationStageLabel}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Health</p>
                    <p className="text-lg font-semibold tabular-nums">{detail.healthScore ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Launch readiness</p>
                    <p className="text-lg font-semibold tabular-nums">
                      {detail.launchReadinessPct != null ? `${detail.launchReadinessPct}%` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Support tier</p>
                    <p>{detail.supportTier.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">MRR</p>
                    <p>{detail.mrrCents != null ? formatUsdFromCents(detail.mrrCents) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Expansion</p>
                    <p>{detail.expansionPotential ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Launch date</p>
                    <p>
                      {detail.launchDate
                        ? format(new Date(detail.launchDate), "MMM d, yyyy")
                        : "—"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Integrations</p>
                  <p className="mt-1 text-muted-foreground">{detail.integrationSummary ?? "No summary recorded."}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Onboarding</p>
                  <p className="mt-1">{detail.onboardingStatusLabel ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Implementation owner</p>
                  <p className="mt-1">
                    {detail.assignedManagerName ?? "Unassigned"}
                    {detail.assignedManagerEmail ? (
                      <span className="block text-xs text-muted-foreground">{detail.assignedManagerEmail}</span>
                    ) : null}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Tags</p>
                  <p className="mt-1 text-muted-foreground">{tagsToString(detail.partnerTags) ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Internal notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{detail.internalNotes ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Last activity</p>
                  <p className="mt-1">
                    {detail.lastActivityAt
                      ? format(new Date(detail.lastActivityAt), "MMM d, yyyy HH:mm")
                      : "—"}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
