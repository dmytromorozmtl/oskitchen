import { describe, expect, it } from "vitest";

import {
  buildKdsPriorityLaneItems,
  isKdsPriorityLaneCandidate,
  partitionKdsQueueByPriority,
  scoreKdsTicketPriority,
  shouldShowKdsPriorityLane,
  sortKdsTicketsByPriority,
} from "@/lib/kitchen/kds-priority-lane-era19";
import {
  KDS_PRIORITY_LANE_ERA19_POLICY_ID,
  KDS_PRIORITY_LANE_ERA19_PROOF_STATUS,
} from "@/lib/kitchen/kds-priority-lane-era19-policy";
import { kdsTicketAnchor } from "@/lib/kitchen/kds-ticket-focus-era18";

const allergenPrep = {
  id: "aaaaaaaa-bbbb-cccc-dddd-111111111111",
  status: "PREPARING",
  elapsedSeconds: 120,
  createdAt: "2026-05-28T10:14:00.000Z",
  customerName: "Alex",
  hasAllergenConflict: true,
};

const overduePrep = {
  id: "aaaaaaaa-bbbb-cccc-dddd-222222222222",
  status: "PREPARING",
  elapsedSeconds: 960,
  createdAt: "2026-05-28T10:00:00.000Z",
  customerName: "Sam",
};

const overdueExpo = {
  id: "aaaaaaaa-bbbb-cccc-dddd-333333333333",
  status: "READY",
  elapsedSeconds: 960,
  createdAt: "2026-05-28T09:45:00.000Z",
  customerName: "Jordan",
};

const freshPrep = {
  id: "aaaaaaaa-bbbb-cccc-dddd-444444444444",
  status: "PREPARING",
  elapsedSeconds: 180,
  createdAt: "2026-05-28T10:12:00.000Z",
  customerName: "Riley",
};

describe("kds priority lane era19 policy", () => {
  it("locks era19 kds priority lane policy id", () => {
    expect(KDS_PRIORITY_LANE_ERA19_POLICY_ID).toBe("era19-kds-priority-lane-v1");
    expect(KDS_PRIORITY_LANE_ERA19_PROOF_STATUS).toBe("kds_priority_lane_wired");
  });
});

describe("scoreKdsTicketPriority", () => {
  it("ranks allergen prep above non-allergen overdue prep when both are urgent", () => {
    expect(scoreKdsTicketPriority(allergenPrep)).toBeGreaterThan(
      scoreKdsTicketPriority(overduePrep),
    );
  });

  it("ranks overdue allergen prep highest", () => {
    const urgentAllergen = {
      ...allergenPrep,
      elapsedSeconds: 960,
    };
    expect(scoreKdsTicketPriority(urgentAllergen)).toBeGreaterThan(
      scoreKdsTicketPriority(overduePrep),
    );
  });
});

describe("sortKdsTicketsByPriority", () => {
  it("sorts prep column with allergen and overdue first", () => {
    const sorted = sortKdsTicketsByPriority([freshPrep, overduePrep, allergenPrep]);
    expect(sorted[0]?.id).toBe(allergenPrep.id);
    expect(sorted[1]?.id).toBe(overduePrep.id);
  });
});

describe("partitionKdsQueueByPriority", () => {
  it("partitions and sorts prep and expo by priority score", () => {
    const orders = [freshPrep, overduePrep, allergenPrep, overdueExpo];
    const { preparing, ready } = partitionKdsQueueByPriority(orders);

    expect(preparing.map((order) => order.id)).toEqual([
      allergenPrep.id,
      overduePrep.id,
      freshPrep.id,
    ]);
    expect(ready.map((order) => order.id)).toEqual([overdueExpo.id]);
  });
});

describe("buildKdsPriorityLaneItems", () => {
  it("returns top priority lane tickets with anchors and reasons", () => {
    const { preparing, ready } = partitionKdsQueueByPriority([
      freshPrep,
      overduePrep,
      allergenPrep,
      overdueExpo,
    ]);
    const items = buildKdsPriorityLaneItems(preparing, ready);

    expect(items.length).toBeLessThanOrEqual(3);
    expect(items[0]?.order.id).toBe(allergenPrep.id);
    expect(items[0]?.href).toBe(kdsTicketAnchor(allergenPrep.id));
    expect(items[0]?.reasons).toContain("allergen");
    expect(items.some((item) => item.reasons.includes("overdue_expo"))).toBe(true);
  });

  it("excludes fresh non-priority tickets from the lane", () => {
    expect(isKdsPriorityLaneCandidate(freshPrep)).toBe(false);
    expect(shouldShowKdsPriorityLane([freshPrep])).toBe(false);
  });
});
