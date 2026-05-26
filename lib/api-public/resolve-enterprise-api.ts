import { getBillingAccess } from "@/lib/billing/access";
import { isBillingBypassed } from "@/lib/billing/dev-bypass";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";

import { resolvePublicApiUserId } from "@/lib/api-public/auth";

/** Validates API key plus Enterprise entitlement (billing bypass skips in development). */
export async function resolveEnterpriseApiUserId(
  authHeader: string | null,
): Promise<string | null> {
  const userId = await resolvePublicApiUserId(authHeader);
  if (!userId) return null;
  if (isBillingBypassed()) return userId;
  if (await isSuperAdminUser(userId)) return userId;

  const gate = await canUseFeature(userId, "api_access");
  if (!gate.allowed) return null;

  const access = await getBillingAccess(userId);
  if (!access.hasPaidSubscription && !access.devBypass && !access.platformBypass) return null;

  return userId;
}
