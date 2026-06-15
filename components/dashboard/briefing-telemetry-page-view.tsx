"use client";

import { useEffect, useRef } from "react";

import { trackBriefingView } from "@/lib/briefing/briefing-telemetry-client";

type Props = {
  rolePack: string;
  attentionTileCount: number;
  alertCount: number;
};

/** Records one briefing_view per mount when Owner Daily Briefing hero renders. */
export function BriefingTelemetryPageView({ rolePack, attentionTileCount, alertCount }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackBriefingView({
      surface: "briefing_hero",
      entityId: rolePack,
      rolePack,
      category: `tiles:${attentionTileCount},alerts:${alertCount}`,
    });
  }, [rolePack, attentionTileCount, alertCount]);

  return null;
}
