/**
 * Internal domain events (in-process bus).
 * Replace with a queue / outbox when scaling past single-node assumptions.
 */

export type KitchenOsEventName =
  | "order_created"
  | "order_imported"
  | "production_completed"
  | "packing_completed"
  | "delivery_failed"
  | "integration_failed"
  | "customer_created"
  | "inventory_low"
  | "automation_triggered";

export type KitchenOsEventPayload = {
  userId?: string;
  orderId?: string;
  externalId?: string;
  message?: string;
  meta?: Record<string, unknown>;
};

export type KitchenOsEvent = {
  name: KitchenOsEventName;
  occurredAt: Date;
  payload: KitchenOsEventPayload;
};

export type KitchenOsEventHandler = (event: KitchenOsEvent) => void;

const handlers = new Map<KitchenOsEventName, Set<KitchenOsEventHandler>>();

export function onKitchenOsEvent(name: KitchenOsEventName, handler: KitchenOsEventHandler): () => void {
  let set = handlers.get(name);
  if (!set) {
    set = new Set();
    handlers.set(name, set);
  }
  set.add(handler);
  return () => {
    set?.delete(handler);
  };
}

export function emitKitchenOsEvent(name: KitchenOsEventName, payload: KitchenOsEventPayload = {}): void {
  const event: KitchenOsEvent = { name, occurredAt: new Date(), payload };
  const set = handlers.get(name);
  if (!set) return;
  for (const h of set) {
    try {
      h(event);
    } catch {
      // Handlers must not throw — log via app logger when wiring real automation.
    }
  }
}
