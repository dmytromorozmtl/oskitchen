import { describe, expect, it } from "vitest";

import {
  externalOpenTableNote,
  mapOpenTableStatus,
  parseOpenTableDateTime,
  parseOpenTableReservationRows,
} from "@/services/integrations/opentable-sync-service";

describe("opentable sync", () => {
  it("maps OpenTable status strings to internal reservation status", () => {
    expect(mapOpenTableStatus("booked")).toBe("CONFIRMED");
    expect(mapOpenTableStatus("seated")).toBe("SEATED");
    expect(mapOpenTableStatus("cancelled")).toBe("CANCELLED");
    expect(mapOpenTableStatus("no-show")).toBe("NO_SHOW");
    expect(mapOpenTableStatus("unknown")).toBe("PENDING");
  });

  it("parses reservation rows from OpenTable API payload", () => {
    const rows = parseOpenTableReservationRows({
      items: [
        {
          confirmation_number: "ot-42",
          given_name: "Sam",
          surname: "Rivera",
          email_address: "sam@example.com",
          party_size: 3,
          scheduled_time: "2026-06-15T18:30:00Z",
          reservation_status: "booked",
        },
      ],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("ot-42");
    expect(rows[0]?.guestName).toBe("Sam Rivera");
    expect(rows[0]?.partySize).toBe(3);
  });

  it("builds idempotent external note tag", () => {
    expect(externalOpenTableNote("ot-42")).toBe("opentable:res:ot-42");
  });

  it("parses ISO datetime for reservedAt", () => {
    const dt = parseOpenTableDateTime("2026-06-15T18:30:00Z");
    expect(dt.getUTCHours()).toBe(18);
    expect(dt.getUTCMinutes()).toBe(30);
  });
});
