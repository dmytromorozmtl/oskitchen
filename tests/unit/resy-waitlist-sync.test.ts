import { describe, expect, it } from "vitest";

import { externalResyWaitlistNote } from "@/services/integrations/resy/waitlist-sync.service";
import { extractResyWebhookTopic } from "@/services/integrations/resy/reservation-webhook.service";

describe("resy waitlist sync", () => {
  it("builds idempotent waitlist note tag", () => {
    expect(externalResyWaitlistNote("wait-42")).toBe("resy:wait:wait-42");
  });

  it("extracts webhook topic from payload", () => {
    expect(extractResyWebhookTopic({ event: "reservation.created" })).toBe("reservation.created");
    expect(extractResyWebhookTopic({ event_type: "waitlist.joined" })).toBe("waitlist.joined");
    expect(extractResyWebhookTopic({})).toBe("reservation.updated");
  });
});
