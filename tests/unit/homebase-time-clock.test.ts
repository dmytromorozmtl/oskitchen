import { describe, expect, it } from "vitest";

import { externalHomebaseTimecardNote } from "@/services/integrations/homebase/time-clock.service";

describe("homebase time clock sync", () => {
  it("builds idempotent timecard note tag", () => {
    expect(externalHomebaseTimecardNote("tc-42")).toBe("homebase:timecard:tc-42");
  });
});
