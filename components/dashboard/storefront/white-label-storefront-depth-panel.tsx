import Link from "next/link";
import {
  ExternalLink,
  Globe,
  Palette,
  ShoppingBag,
  Smartphone,
  UtensilsCrossed,
} from "lucide-react";

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
  WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS,
  WHITE_LABEL_STOREFRONT_DEPTH_ROUTE,
  type WhiteLabelDepthCapability,
  type WhiteLabelDepthMaturity,
  type WhiteLabelStorefrontDepthModel,
} from "@/lib/storefront/white-label-storefront-depth-absolute-final-policy";

function pillarIcon(pillar: (typeof WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS)[number]) {
  switch (pillar) {
    case "branded_theme_tokens":
      return Palette;
    case "custom_domain_routing":
      return Globe;
    case "commission_free_direct_ordering":
      return ShoppingBag;
    case "catering_group_pages":
      return UtensilsCrossed;
    case "branded_pwa_install":
      return Smartphone;
    default:
      return Palette;
  }
}

function pillarLabel(pillar: (typeof WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS)[number]) {
  switch (pillar) {
    case "branded_theme_tokens":
      return "Branded theme";
    case "custom_domain_routing":
      return "Custom domain";
    case "commission_free_direct_ordering":
      return "Direct ordering";
    case "catering_group_pages":
      return "Catering & marketing";
    case "branded_pwa_install":
      return "Branded PWA";
    default:
      return pillar;
  }
}

function maturityBadgeVariant(maturity: WhiteLabelDepthMaturity) {
  if (maturity === "LIVE") return "default" as const;
  if (maturity === "BETA") return "secondary" as const;
  if (maturity === "ROADMAP") return "outline" as const;
  return "outline" as const;
}

function CapabilityRow({ capability }: { capability: WhiteLabelDepthCapability }) {
  return (
    <li
      className="flex flex-col gap-2 border-b border-border/60 px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
      data-testid="white-label-depth-capability"
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{capability.label}</p>
          <Badge variant={maturityBadgeVariant(capability.maturity)} className="rounded-full text-[10px]">
            {capability.maturity}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          ChowNow parity: {capability.chowNowLabel}
        </p>
        <p className="text-sm text-muted-foreground">{capability.detail}</p>
      </div>
      <Button asChild size="sm" variant="outline" className="shrink-0 rounded-full">
        <Link href={capability.manageHref}>Manage</Link>
      </Button>
    </li>
  );
}

export function WhiteLabelStorefrontDepthPanel({ model }: { model: WhiteLabelStorefrontDepthModel }) {
  const { summary, capabilities } = model;

  const byPillar = WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS.map((pillar) => ({
    pillar,
    items: capabilities.filter((c) => c.pillar === pillar),
  }));

  return (
    <div className="space-y-6" data-testid="white-label-storefront-depth-panel">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <p className="font-semibold">ChowNow parity · BETA depth dashboard</p>
        <p className="mt-1 text-muted-foreground">
          Honest maturity labels — SKIPPED when DNS automation or App Store binaries are not shipped.
          Do not promise custom domains until verified at your registrar. Payment processing fees
          still apply on commission-free direct ordering.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Readiness</CardDescription>
            <CardTitle className="text-3xl">{summary.readinessPercent}%</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Weighted LIVE/BETA/ROADMAP score across {capabilities.length} capabilities
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>LIVE</CardDescription>
            <CardTitle className="text-3xl text-emerald-600 dark:text-emerald-400">
              {summary.liveCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Shipped today in workspace</CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>BETA / ROADMAP</CardDescription>
            <CardTitle className="text-3xl">
              {summary.betaCount + summary.roadmapCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {summary.skippedCount} SKIPPED — blocked or partner-gated
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Storefront preview</CardDescription>
            <CardTitle className="flex items-center gap-2 text-base">
              <span
                className="inline-block h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: summary.previewThemeColor }}
                aria-hidden
              />
              {summary.hasLogo ? "Logo set" : "No logo"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            {summary.storefrontUrl ? (
              <a
                href={summary.storefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
              >
                {summary.storefrontUrl}
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            ) : (
              "Publish storefront slug to preview"
            )}
            {summary.pwaPublished ? (
              <p>PWA manifest published</p>
            ) : (
              <p>PWA BETA — generate at /branding</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {byPillar.map(({ pillar, items }) => {
          const Icon = pillarIcon(pillar);
          const liveInPillar = items.filter((i) => i.maturity === "LIVE").length;
          return (
            <Card key={pillar} className="border-border/70 shadow-sm" data-testid="white-label-depth-pillar">
              <CardHeader className="space-y-2 pb-2">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                <CardTitle className="text-sm">{pillarLabel(pillar)}</CardTitle>
                <CardDescription className="text-xs">
                  {liveInPillar}/{items.length} LIVE
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Capability depth</CardTitle>
          <CardDescription>
            ChowNow parity checklist — DNS is not automatic for custom domains. Enterprise hide-branding
            is partner-gated.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border/60">
            {capabilities.map((capability) => (
              <CapabilityRow key={capability.id} capability={capability} />
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Policy: white-label-storefront-depth-absolute-final-v1 · Route: {WHITE_LABEL_STOREFRONT_DEPTH_ROUTE}
      </p>
    </div>
  );
}
