/**
 * Thin alias layer so operational AI modules can share the same capability matrix
 * as Copilot without duplicating grant tables.
 */
export { canUseCopilot, isSuperAdminCopilot } from "@/lib/ai/copilot-permissions";
export type { CopilotCapability as AiOpsCapability } from "@/lib/ai/copilot-types";
export type { CopilotActorScope as AiOpsActorScope } from "@/lib/ai/copilot-types";
