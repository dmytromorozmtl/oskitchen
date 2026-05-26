"use client";

import Link from "next/link";
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type GrowthCommandCenterSerialized = {
  kpis: {
    workspaceProfiles: number;
    activeSubscriptions: number;
    trialingSubscriptions: number;
    paidRevenue30dUsd: number;
    activationRatePct: number;
    demoWinRatePct: number;
    usageEvents24h: number;
    wau: number;
    betaLeads: number;
    demosNew: number;
    referralAttributed: number;
    npsPlaceholder: number | null;
  };
  leadFunnel: { status: string; count: number }[];
  demoFunnel: { status: string; count: number }[];
  signupsWeekly: { week: string; count: number }[];
  activationFunnel: { step: string; count: number; pct: number }[];
  usageTop: { eventName: string; count: number }[];
  healthMix: { status: string; count: number }[];
  atRisk: { userId: string; email: string; fullName: string; churnScore: number; reasons: string[] }[];
  expansion: { userId: string; email: string; fullName: string; composite: number }[];
  outreachCampaigns: { id: string; name: string; channel: string; audience: string; status: string; createdAt: string }[];
  content: { releaseNotesDraft: number; releaseNotesPublished: number };
  onboarding: { totalCalls: number; upcomingCalls: number };
};

export function GrowthCommandCenter({ data }: { data: GrowthCommandCenterSerialized }) {
  const { kpis } = data;
  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Kpi label="Workspaces" value={kpis.workspaceProfiles} hint="User profiles" />
        <Kpi label="Active subs" value={kpis.activeSubscriptions} />
        <Kpi label="Trialing" value={kpis.trialingSubscriptions} />
        <Kpi label="Paid revenue (30d)" value={`$${kpis.paidRevenue30dUsd.toLocaleString()}`} hint="Invoice paid totals" />
        <Kpi label="Activation rate" value={`${kpis.activationRatePct}%`} hint="Onboarding completed" />
        <Kpi label="Demo win rate" value={`${kpis.demoWinRatePct}%`} hint="Won / all demos" />
        <Kpi label="Usage events (24h)" value={kpis.usageEvents24h} />
        <Kpi label="WAU (7d)" value={kpis.wau} hint="Distinct users with usage" />
        <Kpi label="Beta leads" value={kpis.betaLeads} />
        <Kpi label="Demos (new)" value={kpis.demosNew} />
        <Kpi label="Referral signups" value={kpis.referralAttributed} />
        <Kpi label="NPS" value="—" hint="Wire CSAT / survey" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead funnel (by status)</CardTitle>
            <CardDescription>Pipeline volume from `beta_leads` — pair with lifecycle stages on Leads.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.leadFunnel} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo outcomes</CardTitle>
            <CardDescription>Conversion hygiene across `demo_requests`.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.demoFunnel} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Demos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Signup trend (weekly)</CardTitle>
            <CardDescription>New profiles bucketed by ISO week (last ~8 weeks).</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.signupsWeekly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" name="Signups" stroke="hsl(var(--primary))" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activation funnel</CardTitle>
            <CardDescription>PLG milestones from `activation_states` (workspace coverage).</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.activationFunnel} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="step" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="pct" fill="hsl(var(--chart-3))" name="% of tracked workspaces" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top product events</CardTitle>
            <CardDescription>From `usage_events` — tune naming in `lib/growth/growth-events.ts`.</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.usageTop} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="eventName" width={140} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health snapshots (7d mix)</CardTitle>
            <CardDescription>Latest `customer_health_snapshots` distribution.</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.healthMix} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Churn watchlist</CardTitle>
              <CardDescription>Heuristic risk from usage gaps + billing + integrations.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/growth/customer-success">Open CS</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.atRisk.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-sm text-muted-foreground">
                      No accounts crossed the heuristic threshold.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.atRisk.map((r) => (
                    <TableRow key={r.userId}>
                      <TableCell>
                        <div className="font-medium">{r.fullName}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {r.reasons.map((x) => (
                            <Badge key={x} variant="outline" className="text-[10px] font-normal">
                              {x}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{r.churnScore}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expansion signals</CardTitle>
            <CardDescription>Active subscribers with usage / staff / integration velocity.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.expansion.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-sm text-muted-foreground">
                      No accounts crossed the expansion heuristic yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.expansion.map((r) => (
                    <TableRow key={r.userId}>
                      <TableCell>
                        <div className="font-medium">{r.fullName}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{r.composite}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Outreach campaigns</CardTitle>
              <CardDescription>Founder outbound programs (`outreach_campaigns`).</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/growth/outreach">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {data.outreachCampaigns.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.channel} · {c.audience}
                    </p>
                  </div>
                  <Badge variant="secondary">{c.status}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content & onboarding ops</CardTitle>
            <CardDescription>Release notes + scheduled onboarding calls.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg border border-border/60 p-3">
              <p className="text-muted-foreground">Release notes</p>
              <p className="text-2xl font-semibold tabular-nums">{data.content.releaseNotesPublished}</p>
              <p className="text-xs text-muted-foreground">{data.content.releaseNotesDraft} drafts</p>
            </div>
            <div className="rounded-lg border border-border/60 p-3">
              <p className="text-muted-foreground">Onboarding calls</p>
              <p className="text-2xl font-semibold tabular-nums">{data.onboarding.totalCalls}</p>
              <p className="text-xs text-muted-foreground">{data.onboarding.upcomingCalls} upcoming (today+)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi(props: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-2">
        <CardDescription>{props.label}</CardDescription>
        <CardTitle className="text-xl tabular-nums">{props.value}</CardTitle>
        {props.hint ? <p className="text-xs text-muted-foreground">{props.hint}</p> : null}
      </CardHeader>
    </Card>
  );
}
