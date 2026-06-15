import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  channelPilotLiveProofSetupHref,
  channelPilotProviderLabel,
  channelPilotSetupPageHref,
  formatChannelLiveProofOperatorStatus,
} from "@/lib/integrations/integration-health-live-proof-focus-era18";
import { INTEGRATION_HEALTH_LIVE_PROOF_ANCHOR } from "@/lib/integrations/integration-health-live-proof-focus-era18-policy";
import type { ChannelPilotLiveProofSlice } from "@/lib/integrations/integration-health-live-proof-focus-era18";

export function ChannelLiveProofStatusPanel(props: {
  slices: readonly ChannelPilotLiveProofSlice[];
}) {
  return (
    <Card
      id={INTEGRATION_HEALTH_LIVE_PROOF_ANCHOR.slice(1)}
      className="border-border/80 shadow-sm scroll-mt-24"
      data-testid="channel-live-proof-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Radio className="h-5 w-5 text-muted-foreground" aria-hidden />
          Woo / Shopify live proof — operator view
        </CardTitle>
        <CardDescription>
          In-app pilot wizard progress is separate from engineering live smoke (
          <span className="font-mono text-xs">npm run smoke:woo-shopify-live</span>
          ). Neither row claims live PASS until the smoke artifact shows proof_passed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {props.slices.map((slice) => {
          const label = channelPilotProviderLabel(slice.provider);
          const statusLabel = formatChannelLiveProofOperatorStatus(slice.operatorStatus);
          const step = slice.progress.currentStepId ?? "save_credentials";
          const href =
            slice.operatorStatus === "wizard_incomplete"
              ? channelPilotLiveProofSetupHref(slice.provider, step)
              : slice.operatorStatus === "no_connection"
                ? channelPilotSetupPageHref(slice.provider)
                : `/dashboard/integration-health${INTEGRATION_HEALTH_LIVE_PROOF_ANCHOR}`;

          const actionLabel =
            slice.operatorStatus === "wizard_incomplete"
              ? "Continue pilot setup"
              : slice.operatorStatus === "no_connection"
                ? "Start setup"
                : slice.operatorStatus === "awaiting_engineering_live_smoke"
                  ? "In-app ready"
                  : "Fix connection";

          const toneVariant =
            slice.operatorStatus === "awaiting_engineering_live_smoke"
              ? "secondary"
              : slice.operatorStatus === "wizard_incomplete" ||
                  slice.operatorStatus === "connection_blocked"
                ? "destructive"
                : "outline";

          return (
            <Link
              key={slice.provider}
              href={href}
              data-testid={`channel-live-proof-${slice.provider.toLowerCase()}`}
              className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-3 text-sm hover:bg-muted/40"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{label}</p>
                  <Badge variant={toneVariant} className="rounded-full text-[10px] font-normal">
                    {statusLabel}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {slice.progress.pilotReady
                    ? "All five pilot wizard steps complete in-app."
                    : `${slice.progress.completedCount}/${slice.progress.totalCount} pilot wizard steps complete.`}
                  {slice.operatorStatus === "awaiting_engineering_live_smoke"
                    ? " Engineering must run live smoke before commercial live-proof claims."
                    : null}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
                {actionLabel}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
