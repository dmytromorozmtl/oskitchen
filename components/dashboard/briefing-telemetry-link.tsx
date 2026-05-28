"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { captureProductEvent } from "@/lib/analytics/product-events";
import { normalizeBriefingActionPath } from "@/lib/briefing/owner-daily-briefing-production-grade-era20";

export type BriefingClickSurface =
  | "next_action"
  | "ranked_action"
  | "hero_tile"
  | "risk_signal"
  | "production_lane"
  | "pilot_lane"
  | "integration_lane"
  | "operational_empty";

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
        captureProductEvent("briefing_click", {
          surface,
          entity_id: entityId,
          role_pack: rolePack,
          href_path: normalizeBriefingActionPath(hrefString),
          link_state: linkState,
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
