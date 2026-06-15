import Link from "next/link";
import { AlertTriangle, ArrowRight, PlugZap, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildGettingStartedPilotChannelFocus,
  pickGettingStartedPilotChannelAttentionItems,
  summarizeGettingStartedPilotChannelFocus,
} from "@/lib/onboarding/getting-started-pilot-channel-era18";
import {
  pickGettingStartedPilotChannelLiveProofAttentionItems,
  summarizeGettingStartedPilotChannelLiveProof,
} from "@/lib/onboarding/getting-started-pilot-channel-live-proof-era18";
import {
  buildGettingStartedPilotSsoFocus,
  pickGettingStartedPilotSsoAttentionItems,
  summarizeGettingStartedPilotSsoFocus,
} from "@/lib/onboarding/getting-started-pilot-sso-era18";
import type { GettingStartedPayload } from "@/services/onboarding/getting-started-status";

type CombinedAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  source: "sso" | "channel" | "live-proof";
  priority: number;
  tone: "urgent" | "normal";
};

export function GettingStartedAttentionStrip(props: { data: GettingStartedPayload }) {
  const channelFocus = buildGettingStartedPilotChannelFocus(props.data);
  const ssoFocus = buildGettingStartedPilotSsoFocus(props.data);
  const channelSummary = summarizeGettingStartedPilotChannelFocus(channelFocus);
  const ssoSummary = summarizeGettingStartedPilotSsoFocus(ssoFocus);
  const liveProofSummary = summarizeGettingStartedPilotChannelLiveProof(
    channelFocus,
    props.data.pilotChannelLiveProof.slices,
  );

  const items: CombinedAttentionItem[] = [
    ...pickGettingStartedPilotSsoAttentionItems(ssoFocus).map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.detail,
      href: item.href,
      source: "sso" as const,
      priority: item.priority,
      tone: item.tone,
    })),
    ...pickGettingStartedPilotChannelAttentionItems(
      channelFocus,
      props.data.pilotChannelLiveProof.slices,
    ).map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.detail,
      href: item.href,
      source: "channel" as const,
      priority: item.priority,
      tone: item.tone,
    })),
    ...pickGettingStartedPilotChannelLiveProofAttentionItems(
      channelFocus,
      props.data.pilotChannelLiveProof.slices,
    ).map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.detail,
      href: item.href,
      source: "live-proof" as const,
      priority: item.priority,
      tone: item.tone,
    })),
  ]
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 4);

  if (items.length === 0) return null;

  const hasUrgent = channelSummary.hasUrgent || ssoSummary.hasUrgent || liveProofSummary.hasUrgent;
  const hasSso = items.some((item) => item.source === "sso");
  const hasChannel =
    items.some((item) => item.source === "channel") ||
    items.some((item) => item.source === "live-proof");

  return (
    <Card
      className="border-amber-200/80 bg-amber-50/40 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20"
      data-testid="getting-started-attention-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {hasSso ? (
            <ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden />
          ) : (
            <PlugZap className="h-5 w-5 text-muted-foreground" aria-hidden />
          )}
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
          Pilot setup
          {hasSso && hasChannel ? " — enterprise SSO & channels" : hasSso ? " — enterprise SSO" : " — channel readiness"}
        </CardTitle>
        <CardDescription>
          {hasUrgent
            ? "Resolve pilot blockers before scaling staff access or channel order volume."
            : "Finish pilot setup steps to shorten time-to-first-order."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            data-testid={`getting-started-attention-${item.id}`}
            className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm hover:bg-muted/40"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
