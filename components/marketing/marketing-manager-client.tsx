"use client";

import Link from "next/link";
import { CloudRain, Mail, Sparkles, Sun } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AI_MARKETING_MANAGER_ROUTE } from "@/lib/ai/marketing-manager-policy";
import type { MarketingManagerSnapshot } from "@/lib/ai/marketing-manager-types";
import { cn } from "@/lib/utils";

const SEVERITY_VARIANT: Record<
  MarketingManagerSnapshot["autoCampaigns"][number]["severity"],
  "destructive" | "default" | "secondary" | "outline"
> = {
  critical: "destructive",
  high: "default",
  normal: "secondary",
  low: "outline",
};

const STATUS_VARIANT: Record<
  MarketingManagerSnapshot["autoCampaigns"][number]["status"],
  "default" | "secondary" | "outline"
> = {
  ready: "default",
  draft: "secondary",
  blocked: "outline",
};

type Props = {
  snapshot: MarketingManagerSnapshot;
};

export function MarketingManagerClient({ snapshot }: Props) {
  return (
    <div className="space-y-6" data-testid="ai-marketing-manager-root">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Marketing Manager</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Auto campaign recommendations and weather-driven promos from order volume, churn signals, and
          calendar proxies. Confidence {Math.round(snapshot.summary.confidence * 100)}%.
        </p>
      </div>

      <Card data-testid="ai-marketing-manager-daily-brief">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Daily marketing brief</CardTitle>
          <CardDescription>{snapshot.dailyBrief.executiveSummary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-lg font-medium">{snapshot.dailyBrief.headline}</p>
          {snapshot.dailyBrief.bullets.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {snapshot.dailyBrief.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4 text-muted-foreground" aria-hidden />
              Auto campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {snapshot.autoCampaigns.filter((row) => row.status === "ready").length}
            </p>
            <p className="text-sm text-muted-foreground">
              ready · {snapshot.summary.klaviyoConfigured ? "Klaviyo connected" : "Klaviyo not configured"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CloudRain className="h-4 w-4 text-sky-600" aria-hidden />
              Weather promos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{snapshot.weatherPromos.length}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {snapshot.dailyBrief.weatherMode} mode today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sun className="h-4 w-4 text-amber-600" aria-hidden />
              Audience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{snapshot.summary.marketingConsentCount}</p>
            <p className="text-sm text-muted-foreground">
              consenting · {snapshot.summary.churnRiskCount} at-risk
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" aria-hidden />
            Auto campaigns
          </CardTitle>
          <CardDescription>
            Klaviyo-triggered flows ranked by readiness and audience size.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {snapshot.autoCampaigns.map((campaign) => (
              <li
                key={campaign.id}
                className={cn(
                  "flex flex-wrap items-start justify-between gap-2 rounded-md border p-3",
                  campaign.status === "ready" && "border-primary/30",
                )}
              >
                <div className="space-y-1">
                  <p className="font-medium">{campaign.label}</p>
                  <p className="text-sm text-muted-foreground">{campaign.recommendation}</p>
                  <p className="text-xs text-muted-foreground">
                    {campaign.audienceSize} recipients · {campaign.trigger} · ~
                    {campaign.estimatedLiftPercent}% est. lift
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant={STATUS_VARIANT[campaign.status]}>{campaign.status}</Badge>
                  <Badge variant={SEVERITY_VARIANT[campaign.severity]}>{campaign.severity}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" aria-hidden />
            Weather & calendar promos
          </CardTitle>
          <CardDescription>
            Demand-based promo suggestions from weather proxy and local calendar signals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {snapshot.weatherPromos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weather or event promos suggested today.</p>
          ) : (
            <ul className="space-y-3">
              {snapshot.weatherPromos.map((promo) => (
                <li key={promo.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">{promo.headline}</p>
                    <Badge variant={SEVERITY_VARIANT[promo.severity]}>{promo.severity}</Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium text-primary">{promo.offer}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{promo.recommendation}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Focus: {promo.menuFocus} · {Math.round((promo.demandMultiplier - 1) * 100)}% demand uplift
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/dashboard/marketing/email-campaigns" className="underline">
          Email campaigns
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/dashboard/marketing/holiday-packages" className="underline">
          Holiday packages
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/dashboard/customers/churn-risk" className="underline">
          Churn risk
        </Link>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{AI_MARKETING_MANAGER_ROUTE}</span>
      </div>
    </div>
  );
}
