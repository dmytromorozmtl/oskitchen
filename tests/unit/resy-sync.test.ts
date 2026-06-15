import { describe, expect, it } from "vitest";

import {
  externalResyNote,
  mapResyStatus,
  parseResyDateTime,
  parseResyReservationRows,
} from "@/services/integrations/resy-sync-service";

describe("resy sync", () => {
  it("maps Resy status strings to internal reservation status", () => {
    expect(mapResyStatus("confirmed")).toBe("CONFIRMED");
    expect(mapResyStatus("seated")).toBe("SEATED");
    expect(mapResyStatus("cancelled")).toBe("CANCELLED");
    expect(mapResyStatus("no-show")).toBe("NO_SHOW");
    expect(mapResyStatus("unknown")).toBe("PENDING");
  });

  it("parses reservation rows from Resy API payload", () => {
    const rows = parseResyReservationRows({
      reservations: [
        {
          reservation_id: "res-99",
          first_name: "Jamie",
          last_name: "Lee",
          email: "jamie@example.com",
          num_seats: 4,
          time_slot: "2026-06-15T19:00:00Z",
          status: "confirmed",
        },
      ],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("res-99");
    expect(rows[0]?.guestName).toBe("Jamie Lee");
    expect(rows[0]?.partySize).toBe(4);
  });

  it("builds idempotent external note tag", () => {
    expect(externalResyNote("res-99")).toBe("resy:res:res-99");
  });

  it("parses ISO datetime for reservedAt", () => {
    const dt = parseResyDateTime("2026-06-15T19:00:00Z");
    expect(dt.getUTCHours()).toBe(19);
  });
});
