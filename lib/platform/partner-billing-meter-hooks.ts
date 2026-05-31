import type { PartnerOAuthCredential } from "@/lib/oauth/partner-oauth-auth";
import {
  recordPartnerApiRequestBillingMeter,
  recordPartnerWebhookDeliveryBillingMeter,
} from "@/services/platform/partner-billing-service";

/** Best-effort partner API request meter — never blocks public API responses. */
export async function triggerPartnerApiRequestBillingMeter(input: {
  credential: PartnerOAuthCredential;
  routeKey: string;
}): Promise<void> {
  try {
    await recordPartnerApiRequestBillingMeter({
      clientId: input.credential.clientId,
      installationId: input.credential.installationId,
      workspaceId: null,
      routeKey: input.routeKey,
    });
  } catch (error) {
    console.error("partner_api_request_billing_meter_failed", error);
  }
}

/** Best-effort webhook delivery meter — never blocks delivery pipeline. */
export async function triggerPartnerWebhookDeliveryBillingMeter(input: {
  clientId: string;
  installationId: string;
  workspaceId: string | null;
  deliveryId: string;
  eventType: string;
}): Promise<void> {
  try {
    await recordPartnerWebhookDeliveryBillingMeter(input);
  } catch (error) {
    console.error("partner_webhook_delivery_billing_meter_failed", error);
  }
}
