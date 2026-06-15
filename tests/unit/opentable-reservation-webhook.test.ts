import { describe, expect, it } from "vitest";

import { extractOpenTableWebhookTopic } from "@/services/integrations/opentable/reservation-webhook.service";

describe("opentable reservation webhook", () => {
  it("extracts webhook topic from payload", () => {
    expect(extractOpenTableWebhookTopic({ event: "reservation.created" })).toBe(
      "reservation.created",
    );
    expect(extractOpenTableWebhookTopic({ event_type: "reservation.cancelled" })).toBe(
      "reservation.cancelled",
    );
    expect(extractOpenTableWebhookTopic({})).toBe("reservation.updated");
  });
});
