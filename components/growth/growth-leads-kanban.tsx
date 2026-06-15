"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const KANBAN_LANES = ["LEAD", "MQL", "SQL", "DEMO_SCHEDULED", "ACTIVATED", "PAYING", "AT_RISK"] as const;

export type LeadCard = {
  id: string;
  fullName: string;
  email: string;
  businessName: string;
  score: number;
  source: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
  createdAt: string;
};

const LANE_LABEL: Record<string, string> = {
  VISITOR: "Visitor",
  LEAD: "Lead",
  MQL: "MQL",
  SQL: "SQL",
  DEMO_SCHEDULED: "Demo scheduled",
  TRIAL_STARTED: "Trial started",
  ACTIVATED: "Activated",
  PAYING: "Paying",
  EXPANSION: "Expansion",
  AT_RISK: "At risk",
  CHURNED: "Churned",
};

export function GrowthLeadsKanban({ grouped }: { grouped: Record<string, LeadCard[]> }) {
  const total = Object.values(grouped).reduce((a, b) => a + b.length, 0);
  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No leads yet</CardTitle>
          <CardDescription>
            Leads from waitlists, demo requests, referrals, and outbound campaigns will appear here once acquisition channels are connected.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/growth/launch-analytics">Open Launch Analytics</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/growth/demo-requests">Review demo requests</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {KANBAN_LANES.map((stage) => {
        const rows = grouped[stage] ?? [];
        return (
          <div key={stage} className="w-[260px] shrink-0 space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {LANE_LABEL[stage] ?? stage}
              </span>
              <Badge variant="secondary" className="tabular-nums">
                {rows.length}
              </Badge>
            </div>
            <div className="min-h-[120px] space-y-2 rounded-lg border border-dashed border-border/50 p-2">
              {rows.length === 0 ? (
                <p className="px-1 py-6 text-center text-[11px] text-muted-foreground">No leads in this stage.</p>
              ) : (
                rows.map((r) => (
                  <Link key={r.id} href={`/dashboard/growth/leads/${r.id}`} className="block">
                    <Card className="border-border/80 transition-colors hover:border-primary/40">
                      <CardHeader className="space-y-1 p-3">
                        <CardTitle className="text-sm font-medium leading-snug">{r.businessName}</CardTitle>
                        <CardDescription className="text-xs">
                          {r.fullName} · {r.email}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap items-center gap-2 p-3 pt-0 text-[11px] text-muted-foreground">
                        <span className="font-mono">score {r.score}</span>
                        {r.utmSource ? <span>utm:{r.utmSource}</span> : null}
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
