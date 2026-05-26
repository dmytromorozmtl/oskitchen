export type ChannelErrorSeverity = "info" | "warning" | "error" | "blocker";

export type ChannelErrorDefinition = {
  code: string;
  severity: ChannelErrorSeverity;
  userMessage: string;
  developerMessage: string;
  suggestedAction: string;
};

export const CHANNEL_ERRORS: Record<string, ChannelErrorDefinition> = {
  CHANNEL_AUTH_FAILED: {
    code: "CHANNEL_AUTH_FAILED",
    severity: "blocker",
    userMessage: "This channel could not authenticate with the partner.",
    developerMessage: "OAuth/API credentials rejected or expired.",
    suggestedAction: "Reconnect the integration and rotate credentials if needed.",
  },
  CHANNEL_WEBHOOK_SIGNATURE_INVALID: {
    code: "CHANNEL_WEBHOOK_SIGNATURE_INVALID",
    severity: "error",
    userMessage: "The webhook signature did not match your saved secret.",
    developerMessage: "HMAC or WooCommerce signature verification failed.",
    suggestedAction: "Confirm the webhook secret in the partner admin matches KitchenOS.",
  },
  CHANNEL_DUPLICATE_EVENT: {
    code: "CHANNEL_DUPLICATE_EVENT",
    severity: "info",
    userMessage: "This webhook was already received and was ignored as a duplicate.",
    developerMessage: "Duplicate external_event_id for the same user and provider.",
    suggestedAction: "No action required unless replays are intentional.",
  },
  CHANNEL_PRODUCT_UNMATCHED: {
    code: "CHANNEL_PRODUCT_UNMATCHED",
    severity: "warning",
    userMessage: "One or more line items are not mapped to kitchen products.",
    developerMessage: "SKU/title mapping failed against local catalog.",
    suggestedAction: "Open Product mapping and link SKUs or titles.",
  },
  CHANNEL_ORDER_DUPLICATE: {
    code: "CHANNEL_ORDER_DUPLICATE",
    severity: "warning",
    userMessage: "This external order already exists and was updated instead of creating a duplicate row.",
    developerMessage: "ExternalOrder upsert by connectionId + externalOrderId.",
    suggestedAction: "Review staging if you expected a new order.",
  },
  CHANNEL_FULFILLMENT_MISSING: {
    code: "CHANNEL_FULFILLMENT_MISSING",
    severity: "warning",
    userMessage: "Fulfillment timing or method needs clarification.",
    developerMessage: "Pickup/delivery window missing after normalization.",
    suggestedAction: "Set fulfillment in the conflict resolver or partner admin.",
  },
  CHANNEL_STATUS_UNKNOWN: {
    code: "CHANNEL_STATUS_UNKNOWN",
    severity: "warning",
    userMessage: "The partner order status is not mapped to a KitchenOS status yet.",
    developerMessage: "No mapping for source status string.",
    suggestedAction: "Assign a normalized status manually or extend the mapping table.",
  },
  CHANNEL_CURRENCY_MISMATCH: {
    code: "CHANNEL_CURRENCY_MISMATCH",
    severity: "warning",
    userMessage: "Order currency differs from your kitchen default.",
    developerMessage: "Totals currency != kitchen_settings.currency.",
    suggestedAction: "Confirm FX handling or restrict the channel currency.",
  },
  CHANNEL_RATE_LIMITED: {
    code: "CHANNEL_RATE_LIMITED",
    severity: "warning",
    userMessage: "The partner API rate limit was hit; sync will retry later.",
    developerMessage: "HTTP 429 or documented throttle from partner.",
    suggestedAction: "Reduce sync frequency or enable backoff.",
  },
  CHANNEL_API_TIMEOUT: {
    code: "CHANNEL_API_TIMEOUT",
    severity: "error",
    userMessage: "The partner API timed out before completing.",
    developerMessage: "Network or partner latency exceeded client timeout.",
    suggestedAction: "Retry sync; if persistent, widen timeout or page smaller batches.",
  },
  CHANNEL_PARTNER_ACCESS_REQUIRED: {
    code: "CHANNEL_PARTNER_ACCESS_REQUIRED",
    severity: "blocker",
    userMessage: "Additional partner approval is required for this channel.",
    developerMessage: "Feature gated by partner program or scopes.",
    suggestedAction: "Complete partner onboarding or choose another channel.",
  },
  CHANNEL_CONFIG_INCOMPLETE: {
    code: "CHANNEL_CONFIG_INCOMPLETE",
    severity: "blocker",
    userMessage: "Channel setup is incomplete.",
    developerMessage: "Missing base URL, store keys, or webhook configuration.",
    suggestedAction: "Finish the setup wizard and test the connection.",
  },
};

export function getChannelError(code: string): ChannelErrorDefinition | null {
  return CHANNEL_ERRORS[code] ?? null;
}
