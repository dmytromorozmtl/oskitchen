"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BetaProgramStage } from "@prisma/client";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  bulkUpdateBetaProgramStage,
  sendBetaLifecycleEmail,
  updateBetaLeadFounderFields,
  updateBetaLeadProgramStage,
} from "@/actions/beta-operations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { generateFounderInsights } from "@/lib/beta/beta-insights";
import { BETA_PIPELINE_ORDER, BETA_STAGE_LABEL } from "@/lib/beta/beta-status";
import { BUSINESS_TYPE_LABELS } from "@/lib/business-modes";
import type { BetaOperationsSnapshot, BetaLeadRowSerialized } from "@/services/beta/beta-service";
import { toast } from "sonner";

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
        <CardDescription className="text-xs font-medium uppercase tracking-wide">
          {label}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent className="pt-0 text-[11px] text-muted-foreground">{hint}</CardContent>
      ) : null}
    </Card>
  );
}

export function BetaOperationsCenter({ initial }: { initial: BetaOperationsSnapshot }) {
  const router = useRouter();
  const [snap, setSnap] = React.useState(initial);
  const [tab, setTab] = React.useState<"overview" | "inbox" | "pipeline">("overview");
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [bulkStage, setBulkStage] = React.useState<BetaProgramStage>("REVIEWING");
  const [notesDraft, setNotesDraft] = React.useState("");

  React.useEffect(() => {
    setSnap(initial);
  }, [initial]);

  const detail = React.useMemo(
    () => snap.leads.find((l) => l.id === detailId) ?? null,
    [snap.leads, detailId],
  );

  React.useEffect(() => {
    if (detail) setNotesDraft(detail.founderNotes ?? "");
  }, [detail]);

  const insights = React.useMemo(() => {
    if (!detail) return null;
    return generateFounderInsights({
      businessType: detail.businessType as import("@prisma/client").BusinessType,
      programStage: detail.programStage as BetaProgramStage,
      fitScore: detail.score,
      riskScore: detail.riskScore ?? 40,
      activationProbability: detail.activationProbability ?? 50,
      arrPotentialScore: detail.arrPotentialScore ?? 40,
      expansionScore: detail.expansionScore ?? 40,
      country: detail.country,
      biggestPain: detail.biggestPain,
    });
  }, [detail]);

  const groupedPipeline = React.useMemo(() => {
    const m = new Map<BetaProgramStage, BetaLeadRowSerialized[]>();
    for (const s of BETA_PIPELINE_ORDER) m.set(s, []);
    for (const l of snap.leads) {
      const st = l.programStage as BetaProgramStage;
      const arr = m.get(st) ?? [];
      arr.push(l);
      m.set(st, arr);
    }
    return m;
  }, [snap.leads]);

  const refresh = () => router.refresh();

  const onStageChange = async (id: string, stage: BetaProgramStage) => {
    const res = await updateBetaLeadProgramStage(id, stage);
    if ("error" in res && res.error) toast.error(getActionError(res) ?? "Something went wrong");
    else {
      toast.success("Stage updated");
      refresh();
    }
  };

  const onSaveNotes = async () => {
    if (!detail) return;
    const res = await updateBetaLeadFounderFields({
      leadId: detail.id,
      founderNotes: notesDraft,
    });
    if ("error" in res && res.error) toast.error(getActionError(res) ?? "Something went wrong");
    else {
      toast.success("Notes saved");
      refresh();
    }
  };

  const onBulk = async () => {
    if (selected.size === 0) {
      toast.message("Select applications first");
      return;
    }
    const res = await bulkUpdateBetaProgramStage([...selected], bulkStage);
    if ("error" in res && res.error) toast.error(getActionError(res) ?? "Something went wrong");
    else {
      toast.success("Bulk update complete");
      setSelected(new Set());
      refresh();
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (checked) n.add(id);
      else n.delete(id);
      return n;
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Founder beta operations
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Early access command center</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Qualification, cohorts, lifecycle, and revenue signals for the public{" "}
            <code className="rounded bg-muted px-1">/beta</code> program — wired to the same{" "}
            <Link href="/dashboard/growth" className="text-primary underline-offset-4 hover:underline">
              Growth CRM
            </Link>{" "}
            dataset (<code className="rounded bg-muted px-1">beta_leads</code>).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/beta" target="_blank" rel="noreferrer">
              Open public beta page
            </Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/dashboard/growth/leads">Growth leads</Link>
          </Button>
        </div>
      </div>

      {!snap.migrationReady ? (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base">Database migration pending</CardTitle>
            <CardDescription>
              Run <code className="rounded bg-muted px-1">npx prisma migrate deploy</code> to enable
              pipeline stages, cohorts, and scoring columns.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="h-11 rounded-full bg-muted/60 p-1">
          <TabsTrigger className="rounded-full px-4" value="overview">
            Overview
          </TabsTrigger>
          <TabsTrigger className="rounded-full px-4" value="inbox">
            Inbox
          </TabsTrigger>
          <TabsTrigger className="rounded-full px-4" value="pipeline">
            Pipeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            <Kpi label="Total applicants" value={snap.kpis.totalApplicants} />
            <Kpi label="Approved / invited" value={snap.kpis.approved} />
            <Kpi label="Onboarding" value={snap.kpis.onboardingInProgress} />
            <Kpi label="Activated" value={snap.kpis.activated} />
            <Kpi label="Converted (paid)" value={snap.kpis.convertedPaid} />
            <Kpi label="Churned" value={snap.kpis.churned} />
            <Kpi label="Top vertical" value={snap.kpis.topVertical} hint="By volume in snapshot window" />
            <Kpi
              label="Top acquisition"
              value={snap.kpis.topAcquisitionSource}
              hint="UTM + source fields"
            />
            <Kpi
              label="Onboarding completion"
              value={`${snap.kpis.onboardingCompletionPct}%`}
              hint="Activated+ / in-flight onboarding cohort"
            />
            <Kpi
              label="Waitlist velocity"
              value={`${snap.kpis.waitlistGrowthPct}%`}
              hint="Last 30d vs prior 30d"
            />
            <Kpi
              label="Cohort activation"
              value={`${snap.kpis.cohortActivationRatePct}%`}
              hint="Members with cohort assigned"
            />
            {snap.legacyBetaApplicationCount > 0 ? (
              <Kpi
                label="Legacy beta_applications"
                value={snap.legacyBetaApplicationCount}
                hint="Pre-unification rows — see audit doc"
              />
            ) : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Applications over time</CardTitle>
                <CardDescription>Weekly new leads (56-day window)</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={snap.applicationsWeekly}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} width={32} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Industry distribution</CardTitle>
                <CardDescription>Business type mix (recent snapshot)</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={snap.industryDistribution} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={108}
                      tick={{ fontSize: 10 }}
                      interval={0}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Acquisition sources</CardTitle>
                <CardDescription>Coarse mix of utm_source + submission source</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={snap.acquisitionSources}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                    <XAxis dataKey="source" tick={{ fontSize: 10 }} interval={0} angle={-18} height={70} />
                    <YAxis allowDecimals={false} width={32} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Lifecycle funnel</CardTitle>
                <CardDescription>Aggregated program stages</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={snap.onboardingFunnel}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                    <XAxis dataKey="step" tick={{ fontSize: 10 }} interval={0} angle={-16} height={64} />
                    <YAxis allowDecimals={false} width={32} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Feature interest tokens</CardTitle>
              <CardDescription>From comma-separated feature text on applications</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {snap.featureRequestFrequency.length === 0 ? (
                <p className="text-sm text-muted-foreground">No feature tokens yet.</p>
              ) : (
                snap.featureRequestFrequency.map((f) => (
                  <Badge key={f.tag} variant="secondary" className="rounded-full font-normal">
                    {f.tag}{" "}
                    <span className="ml-1 tabular-nums text-muted-foreground">{f.count}</span>
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inbox" className="mt-6 space-y-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Enterprise inbox</CardTitle>
                <CardDescription>
                  {snap.leads.length} loaded · bulk stage · column sort client-side · drawer for founder
                  intelligence
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={bulkStage} onValueChange={(v) => setBulkStage(v as BetaProgramStage)}>
                  <SelectTrigger className="w-[200px] rounded-full">
                    <SelectValue placeholder="Bulk stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {BETA_PIPELINE_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>
                        {BETA_STAGE_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="premium" className="rounded-full" onClick={() => void onBulk()}>
                  Apply to selected
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {snap.leads.length === 0 ? (
                <EmptyInbox />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>Submitted</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Loc</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Readiness</TableHead>
                      <TableHead>Activation</TableHead>
                      <TableHead>ARR proxy</TableHead>
                      <TableHead>Cohort</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snap.leads.map((r) => (
                      <TableRow
                        key={r.id}
                        className="cursor-pointer"
                        onClick={() => setDetailId(r.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selected.has(r.id)}
                            onCheckedChange={(c) => toggleSelect(r.id, Boolean(c))}
                            aria-label={`Select ${r.businessName}`}
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {format(new Date(r.createdAt), "MMM d, yy")}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={r.programStage}
                            onValueChange={(v) => void onStageChange(r.id, v as BetaProgramStage)}
                          >
                            <SelectTrigger className="h-8 w-[140px] rounded-lg text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {BETA_PIPELINE_ORDER.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {BETA_STAGE_LABEL[s]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{r.score}</TableCell>
                        <TableCell className="font-medium">{r.businessName}</TableCell>
                        <TableCell className="text-sm">
                          {r.fullName}
                          <div className="text-xs text-muted-foreground">{r.email}</div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {BUSINESS_TYPE_LABELS[r.businessType as import("@prisma/client").BusinessType] ??
                            r.businessType}
                        </TableCell>
                        <TableCell className="text-xs tabular-nums">{r.locationsCount ?? "—"}</TableCell>
                        <TableCell className="max-w-[120px] truncate text-xs">
                          {r.weeklyOrderVolume ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs tabular-nums">
                          {r.onboardingReadiness ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs tabular-nums">
                          {r.activationProbability ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs tabular-nums">{r.arrPotentialScore ?? "—"}</TableCell>
                        <TableCell className="text-xs">{r.cohortName ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          {snap.leads.length === 0 ? (
            <EmptyInbox />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {BETA_PIPELINE_ORDER.map((stage) => {
                const rows = groupedPipeline.get(stage) ?? [];
                return (
                  <div key={stage} className="w-[260px] shrink-0 space-y-2">
                    <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {BETA_STAGE_LABEL[stage]}
                      </span>
                      <Badge variant="secondary" className="tabular-nums">
                        {rows.length}
                      </Badge>
                    </div>
                    <div className="min-h-[200px] space-y-2 rounded-lg border border-dashed border-border/50 p-2">
                      {rows.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          className="w-full rounded-lg border border-border/80 bg-card p-3 text-left text-sm shadow-sm transition-colors hover:border-primary/40"
                          onClick={() => setDetailId(r.id)}
                        >
                          <p className="font-medium leading-snug">{r.businessName}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {r.fullName} · fit {r.score}
                          </p>
                          <div className="mt-2">
                            <Select
                              value={r.programStage}
                              onValueChange={(v) => void onStageChange(r.id, v as BetaProgramStage)}
                            >
                              <SelectTrigger
                                className="h-8 rounded-lg text-xs"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {BETA_PIPELINE_ORDER.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {BETA_STAGE_LABEL[s]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Sheet open={Boolean(detail)} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-xl">
          {detail ? (
            <>
              <SheetHeader>
                <SheetTitle>{detail.businessName}</SheetTitle>
                <SheetDescription>
                  {detail.fullName} · {detail.email}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-1 flex-col gap-6 px-4 pb-8 pt-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{BETA_STAGE_LABEL[detail.programStage as BetaProgramStage]}</Badge>
                  <Badge variant="secondary" className="font-mono">
                    score {detail.score}
                  </Badge>
                  {detail.pinned ? <Badge>Pinned</Badge> : null}
                </div>

                {insights ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Founder intelligence</CardTitle>
                      <CardDescription>Heuristic briefing — swap for LLM when approved</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <p>{insights.fitSummary}</p>
                      <p>{insights.onboardingRisk}</p>
                      <p>{insights.arrOpportunity}</p>
                      <p>{insights.expansionOpportunity}</p>
                      <p>{insights.churnLikelihood}</p>
                      <p className="text-foreground">
                        <span className="font-medium">Modules: </span>
                        {insights.idealModules.join(", ")}
                      </p>
                      <p>{insights.recommendedOnboardingPath}</p>
                    </CardContent>
                  </Card>
                ) : null}

                <div className="space-y-2">
                  <Label>Program stage</Label>
                  <Select
                    value={detail.programStage}
                    onValueChange={(v) => void onStageChange(detail.id, v as BetaProgramStage)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BETA_PIPELINE_ORDER.map((s) => (
                        <SelectItem key={s} value={s}>
                          {BETA_STAGE_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cohort</Label>
                  <Select
                    value={detail.betaCohortId ?? "none"}
                    onValueChange={(v) =>
                      void (async () => {
                        const res = await updateBetaLeadFounderFields({
                          leadId: detail.id,
                          betaCohortId: v === "none" ? null : v,
                        });
                        if ("error" in res && res.error) toast.error(getActionError(res) ?? "Something went wrong");
                        else {
                          toast.success("Cohort updated");
                          refresh();
                        }
                      })()
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Assign cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No cohort</SelectItem>
                      {snap.cohorts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.members})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Founder notes</Label>
                  <Textarea
                    rows={5}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="rounded-xl"
                  />
                  <Button type="button" className="rounded-full" variant="secondary" onClick={() => void onSaveNotes()}>
                    Save notes
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="premium"
                    className="rounded-full"
                    onClick={() =>
                      void (async () => {
                        const res = await sendBetaLifecycleEmail({
                          leadId: detail.id,
                          kind: "approved",
                        });
                        if ("error" in res && res.error) toast.error(getActionError(res) ?? "Something went wrong");
                        else {
                          toast.success("Approval email sent or skipped if Resend unset");
                          refresh();
                        }
                      })()
                    }
                  >
                    Send approval email
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() =>
                      void (async () => {
                        const res = await sendBetaLifecycleEmail({
                          leadId: detail.id,
                          kind: "waitlist",
                        });
                        if ("error" in res && res.error) toast.error(getActionError(res) ?? "Something went wrong");
                        else {
                          toast.success("Waitlist email sent or skipped");
                          refresh();
                        }
                      })()
                    }
                  >
                    Send waitlist email
                  </Button>
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Feedback & timeline</p>
                  <p className="mt-2">
                    {detail.feedbackCount} feedback rows · {detail.invitationCount} invitations — extend with
                    dedicated tabs in a follow-up.
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

function EmptyInbox() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div>
        <h2 className="text-lg font-semibold">No beta applications yet</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Applications from the public early-access program will appear here once businesses submit the{" "}
          <code className="rounded bg-muted px-1">/beta</code> form.
        </p>
      </div>
      <Button asChild variant="premium" className="rounded-full">
        <Link href="/beta" target="_blank" rel="noreferrer">
          Open public beta page
        </Link>
      </Button>
      {/** second empty state when no approved - shown inline in overview via KPI zeros */}
    </div>
  );
}
