import { checkRateLimit } from "@/lib/rate-limit/rate-limit";
import { SCIM_RATE_LIMIT_PER_MINUTE } from "@/lib/scim/scim-constants";

export function enforceScimRateLimit(workspaceId: string): {
  ok: boolean;
  retryAfterMs?: number;
} {
  return checkRateLimit(`scim:${workspaceId}`, {
    windowMs: 60_000,
    max: SCIM_RATE_LIMIT_PER_MINUTE,
  });
}
