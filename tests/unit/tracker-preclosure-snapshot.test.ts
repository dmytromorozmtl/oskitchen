import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditTrackerPreclosureSnapshot,
  buildTrackerPreclosureSnapshot,
} from "@/lib/execution/build-tracker-preclosure-snapshot";
import {
  CANONICAL_TASK_SLOT_COUNT,
  TRACKER_PRECLOSURE_POLICY_ID,
  TRACKER_PRECLOSURE_SNAPSHOT_ARTIFACT,
} from "@/lib/execution/tracker-preclosure-policy";

const ROOT = process.cwd();

describe("tracker pre-closure snapshot — FINAL-25", () => {
  it("builds honest snapshot with 218+ canonical slots done pre-closure", () => {
    const snapshot = buildTrackerPreclosureSnapshot(ROOT);
    expect(snapshot.version).toBe(TRACKER_PRECLOSURE_POLICY_ID);
    expect(snapshot.canonicalSlotsTotal).toBe(CANONICAL_TASK_SLOT_COUNT);
    expect(snapshot.canonicalSlotsDone).toBeGreaterThanOrEqual(218);
    expect(snapshot.remainingCanonicalSlots).toEqual(expect.arrayContaining([219, 220]));
    expect(snapshot.preClosureReady).toBe(false);
    expect(auditTrackerPreclosureSnapshot(snapshot)).toBe(true);
  });

  it("writes snapshot artifact when present on disk", () => {
    const path = join(ROOT, TRACKER_PRECLOSURE_SNAPSHOT_ARTIFACT);
    if (!existsSync(path)) return;
    const snapshot = JSON.parse(readFileSync(path, "utf8")) as ReturnType<
      typeof buildTrackerPreclosureSnapshot
    >;
    expect(snapshot.version).toBe(TRACKER_PRECLOSURE_POLICY_ID);
    expect(auditTrackerPreclosureSnapshot(snapshot)).toBe(true);
  });
});
