import Link from "next/link";

import { resolveSsoPilotSetupStepRowNextAction } from "@/lib/enterprise/enterprise-sso-pilot-setup-focus-era18";
import type { SsoPilotSetupStepDef } from "@/lib/enterprise/enterprise-sso-pilot-setup-wizard-steps";

export function SsoPilotSetupStepNextAction(props: {
  def: SsoPilotSetupStepDef;
  complete: boolean;
  isCurrent: boolean;
  workspaceId?: string;
}) {
  const action = resolveSsoPilotSetupStepRowNextAction(
    props.def,
    props.complete,
    props.isCurrent,
    props.workspaceId,
  );

  if (!action) {
    return null;
  }

  return (
    <Link
      href={action.href}
      data-testid={`sso-pilot-setup-next-action-${props.def.id}`}
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
