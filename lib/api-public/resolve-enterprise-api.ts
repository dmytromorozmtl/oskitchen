import { getBillingAccess } from "@/lib/billing/access";
import { isBillingBypassed } from "@/lib/billing/dev-bypass";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";

import {
  resolvePublicApiCredential,
  type PublicApiCredential,
} from "@/lib/api-public/auth";

/** Validates API key plus Enterprise entitlement (billing bypass skips in development). */
export async function resolveEnterpriseApiCredential(
  authHeader: string | null,
): Promise<PublicApiCredential | null> {
  const credential = await resolvePublicApiCredential(authHeader);
  if (!credential) return null;

  if (credential.authKind === "partner_oauth") {
    return credential;
  }

  const { userId } = credential;
  if (isBillingBypassed()) return credential;
  if (await isSuperAdminUser(userId)) return credential;

  const gate = await canUseFeature(userId, "api_access");
  if (!gate.allowed) return null;

  const access = await getBillingAccess(userId);
  if (!access.hasPaidSubscription && !access.devBypass && !access.platformBypass) {
    return null;
  }

  return credential;
}

/** Validates API key plus Enterprise entitlement (billing bypass skips in development). */
export async function resolveEnterpriseApiUserId(
  authHeader: string | null,
): Promise<string | null> {
  const credential = await resolveEnterpriseApiCredential(authHeader);
  return credential?.userId ?? null;
}
