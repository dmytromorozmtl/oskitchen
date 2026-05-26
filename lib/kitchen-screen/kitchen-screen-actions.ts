import type { ProductionWorkStatus } from "@prisma/client";

/** Which status buttons to show on the kitchen execution card (gloves-on). */
export function kitchenWorkItemActions(status: ProductionWorkStatus): {
  start: boolean;
  ready: boolean;
  hold: boolean;
  resume: boolean;
  complete: boolean;
  packHandoff: boolean;
} {
  return {
    start: status === "TO_PREP" || status === "HOLD",
    ready: status === "IN_PROGRESS",
    hold:
      status === "IN_PROGRESS" || status === "READY" || status === "TO_PREP" || status === "PACK_HANDOFF",
    resume: status === "HOLD",
    complete: status === "IN_PROGRESS" || status === "READY" || status === "PACK_HANDOFF",
    packHandoff: status !== "PACK_HANDOFF" && status !== "DONE" && status !== "CANCELLED",
  };
}
