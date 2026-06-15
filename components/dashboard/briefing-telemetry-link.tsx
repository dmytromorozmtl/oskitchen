"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { trackBriefingClick } from "@/lib/briefing/briefing-telemetry-client";
import type { BriefingTelemetrySurface } from "@/lib/briefing/briefing-telemetry-policy";
import { normalizeBriefingActionPath } from "@/lib/briefing/owner-daily-briefing-production-grade-era20";

export type BriefingClickSurface = Extract<
  BriefingTelemetrySurface,
  | "next_action"
  | "ranked_action"
  | "hero_tile"
  | "risk_signal"
  | "production_lane"
  | "pilot_lane"
  | "integration_lane"
  | "operational_empty"
  | "ai_briefing_section"
>;

type Props = ComponentProps<typeof Link> & {
  surface: BriefingClickSurface;
  entityId: string;
  rolePack?: string;
  linkState?: string;
  category?: string;
  severity?: string;
  rank?: number;
};

export function BriefingTelemetryLink({
  surface,
  entityId,
  rolePack,
  linkState,
  category,
  severity,
  rank,
  href,
  onClick,
  ...rest
}: Props) {
  const hrefString = typeof href === "string" ? href : String(href);

  return (
    <Link
      href={href}
      onClick={(event) => {
        trackBriefingClick({
          eventName: "briefing_click",
          surface,
          entityId,
          rolePack,
          hrefPath: normalizeBriefingActionPath(hrefString),
          linkState,
          category,
          severity,
          rank,
        });
        onClick?.(event);
      }}
      {...rest}
    />
  );
}
