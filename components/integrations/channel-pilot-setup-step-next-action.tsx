import Link from "next/link";

import {
  resolveChannelPilotSetupStepRowNextAction,
} from "@/lib/integrations/channel-pilot-setup-focus-era18";
import type { ChannelPilotSetupStepDef } from "@/lib/integrations/channel-pilot-setup-wizard-steps";

export function ChannelPilotSetupStepNextAction(props: {
  def: ChannelPilotSetupStepDef;
  complete: boolean;
  isCurrent: boolean;
}) {
  const action = resolveChannelPilotSetupStepRowNextAction(
    props.def,
    props.complete,
    props.isCurrent,
  );

  if (!action) {
    return null;
  }

  return (
    <Link
      href={action.href}
      data-testid={`channel-pilot-setup-next-action-${props.def.id}`}
      className={
        action.tone === "urgent"
          ? "text-xs font-medium text-destructive hover:underline"
          : "text-xs text-primary hover:underline"
      }
    >
      {action.label}
    </Link>
  );
}
