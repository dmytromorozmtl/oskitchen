import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";
import {
  pickGoLiveAttentionItems,
  summarizeGoLiveFocus,
  type GoLiveFocusSnapshot,
} from "@/lib/go-live/go-live-focus-era18";
import type { GoLiveProjectNextStepHero } from "@/lib/go-live/go-live-project-next-step-focus-era18";
import {
  pickImplementationPilotReadinessAttentionItems,
  summarizeImplementationPilotReadiness,
  type ImplementationPilotReadinessModel,
} from "@/lib/implementation/implementation-pilot-readiness-focus-era18";

export type GoLiveReadinessProgressTone = "urgent" | "caution" | "success";

export type GoLiveSecondarySignalsSummary = {
  pilotSignalCount: number;
  launchSignalCount: number;
  totalSignalCount: number;
  hasUrgent: boolean;
};

export function goLiveReadinessProgressTone(score: number): GoLiveReadinessProgressTone {
  if (score >= 85) return "success";
  if (score >= 60) return "caution";
  return "urgent";
}

export function shouldCollapseGoLiveSecondaryStrips(
  hero: GoLiveProjectNextStepHero | null,
): boolean {
  return hero !== null;
}

export function buildGoLiveSecondarySignalsSummary(input: {
  pilotReadiness: ImplementationPilotReadinessModel;
  focus: GoLiveFocusSnapshot;
  blockers: readonly LaunchBlocker[];
}): GoLiveSecondarySignalsSummary {
  const pilotItems = pickImplementationPilotReadinessAttentionItems(input.pilotReadiness);
  const launchItems = pickGoLiveAttentionItems(input.blockers, input.focus);
  const pilotSummary = summarizeImplementationPilotReadiness(pilotItems);
  const launchSummary = summarizeGoLiveFocus(input.focus);

  return {
    pilotSignalCount: pilotItems.length,
    launchSignalCount: launchItems.length,
    totalSignalCount: pilotItems.length + launchItems.length,
    hasUrgent: pilotSummary.hasUrgent || launchSummary.hasUrgent,
  };
}

export function goLiveSecondarySignalsSummaryLabel(summary: GoLiveSecondarySignalsSummary): string {
  if (summary.totalSignalCount === 0) {
    return "No additional launch signals";
  }

  const parts: string[] = [];
  if (summary.pilotSignalCount > 0) {
    parts.push(
      `${summary.pilotSignalCount} pilot signal${summary.pilotSignalCount === 1 ? "" : "s"}`,
    );
  }
  if (summary.launchSignalCount > 0) {
    parts.push(
      `${summary.launchSignalCount} launch signal${summary.launchSignalCount === 1 ? "" : "s"}`,
    );
  }

  return parts.join(" · ");
}
