"use client";

import {
  resolvePackingVerifySessionRowNextAction,
  type PackingVerifyOpenSessionFocus,
} from "@/lib/packing-verification/packing-verify-focus-era18";
import { cn } from "@/lib/utils";

export function PackingVerifySessionNextAction(props: {
  session: PackingVerifyOpenSessionFocus;
  onResume: (sessionId: string) => void;
}) {
  const action = resolvePackingVerifySessionRowNextAction(props.session);

  return (
    <button
      type="button"
      data-testid={`packing-verify-session-next-action-${props.session.id}`}
      onClick={() => props.onResume(action.sessionId)}
      className={cn(
        "text-xs font-medium hover:underline",
        action.tone === "urgent" ? "text-destructive" : "text-primary",
      )}
    >
      {action.label}
    </button>
  );
}
