import { ImplementationPilotReadinessAttentionStrip } from "@/components/dashboard/implementation/implementation-pilot-readiness-attention-strip";
import { GoLiveAttentionStrip } from "@/components/dashboard/go-live/go-live-attention-strip";
import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";
import {
  buildGoLiveSecondarySignalsSummary,
  goLiveSecondarySignalsSummaryLabel,
  shouldCollapseGoLiveSecondaryStrips,
} from "@/lib/go-live/go-live-command-center-focus-era18";
import { GO_LIVE_SECONDARY_SIGNALS_ANCHOR } from "@/lib/go-live/go-live-command-center-focus-era18-policy";
import type { GoLiveProjectNextStepHero } from "@/lib/go-live/go-live-project-next-step-focus-era18";
import type { GoLiveFocusSnapshot } from "@/lib/go-live/go-live-focus-era18";
import type { ImplementationPilotReadinessModel } from "@/lib/implementation/implementation-pilot-readiness-focus-era18";

export function GoLiveSecondarySignalsPanel(props: {
  hero: GoLiveProjectNextStepHero | null;
  pilotReadiness: ImplementationPilotReadinessModel;
  focus: GoLiveFocusSnapshot;
  blockers: readonly LaunchBlocker[];
}) {
  const summary = buildGoLiveSecondarySignalsSummary({
    pilotReadiness: props.pilotReadiness,
    focus: props.focus,
    blockers: props.blockers,
  });

  if (summary.totalSignalCount === 0) return null;

  const collapse = shouldCollapseGoLiveSecondaryStrips(props.hero);
  const strips = (
    <>
      <ImplementationPilotReadinessAttentionStrip model={props.pilotReadiness} variant="go-live" />
      <GoLiveAttentionStrip focus={props.focus} blockers={props.blockers} />
    </>
  );

  if (!collapse) {
    return (
      <div id={GO_LIVE_SECONDARY_SIGNALS_ANCHOR.slice(1)} className="scroll-mt-24 space-y-4">
        {strips}
      </div>
    );
  }

  return (
    <details
      id={GO_LIVE_SECONDARY_SIGNALS_ANCHOR.slice(1)}
      className="scroll-mt-24 rounded-xl border border-border/70 bg-muted/20 px-3 py-2"
      data-testid="go-live-secondary-signals-collapsed"
    >
      <summary className="cursor-pointer list-none text-sm font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="text-muted-foreground">Additional signals — </span>
        {goLiveSecondarySignalsSummaryLabel(summary)}
        <span className="ml-1 text-xs text-muted-foreground">(expand)</span>
      </summary>
      <div className="mt-4 space-y-4">{strips}</div>
    </details>
  );
}
