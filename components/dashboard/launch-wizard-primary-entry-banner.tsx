import Link from "next/link";
import { Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Single recommended onboarding entry — Launch Wizard supersedes parallel go-live paths for new pilots. */
export function LaunchWizardPrimaryEntryBanner(props: { context?: "go_live" | "getting_started" }) {
  const context = props.context ?? "go_live";

  return (
    <div
      className="rounded-lg border border-primary/25 bg-primary/[0.04] px-4 py-3"
      data-testid="launch-wizard-primary-entry-banner"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Rocket className="h-4 w-4 text-primary" aria-hidden />
            Recommended setup path — Launch Wizard
          </p>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {context === "go_live"
              ? "Use Launch Wizard for step-by-step pilot setup with honest P0 and GO/NO-GO blockers. Go-live projects remain for launch validation and advanced blockers."
              : "Start in Launch Wizard for the fastest honest path to first operational order."}
          </p>
        </div>
        <Button asChild size="sm" className="rounded-full shrink-0">
          <Link href="/dashboard/launch-wizard">Open Launch Wizard</Link>
        </Button>
      </div>
    </div>
  );
}
