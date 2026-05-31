import eventsConfig from "@/config/platform/outbound-webhook-events.json";

export const OUTBOUND_WEBHOOK_EVENTS_PATH = "config/platform/outbound-webhook-events.json" as const;

export type OutboundWebhookEventDefinition = {
  type: string;
  label: string;
  category: string;
  description: string;
  sampleFields: string[];
};

export type OutboundWebhookEventType =
  | "order.created"
  | "order.updated"
  | "reservation.created"
  | "waitlist.joined"
  | "waitlist.seated"
  | "inventory.updated";

const KNOWN_EVENT_TYPES = eventsConfig.events.map((e) => e.type);

export function listOutboundWebhookEventDefinitions(): OutboundWebhookEventDefinition[] {
  return eventsConfig.events as OutboundWebhookEventDefinition[];
}

export function isKnownOutboundWebhookEventType(value: string): value is OutboundWebhookEventType {
  return (KNOWN_EVENT_TYPES as readonly string[]).includes(value);
}

export function validateOutboundWebhookEventTypes(events: string[]): string[] {
  const errors: string[] = [];
  if (events.length === 0) {
    errors.push("At least one event type is required.");
  }
  for (const event of events) {
    if (!isKnownOutboundWebhookEventType(event)) {
      errors.push(`Unknown event type: ${event}`);
    }
  }
  return errors;
}

export function outboundWebhookHeaders() {
  return {
    signature: eventsConfig.signatureHeader,
    timestamp: eventsConfig.timestampHeader,
    event: eventsConfig.eventHeader,
    deliveryId: eventsConfig.deliveryIdHeader,
    timestampToleranceSeconds: eventsConfig.timestampToleranceSeconds,
    maxPayloadBytes: eventsConfig.maxPayloadBytes,
  };
}

export function outboundWebhookEventLabel(eventType: string): string {
  const def = listOutboundWebhookEventDefinitions().find((e) => e.type === eventType);
  return def?.label ?? eventType;
}
