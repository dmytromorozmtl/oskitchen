import { describe, expect, it } from "vitest";

import { resolveGoLivePilotReadinessTargetProject } from "@/lib/go-live/go-live-pilot-readiness-focus-era18";
import {
  GO_LIVE_PILOT_READINESS_FOCUS_ERA18_BACKLOG_ID,
  GO_LIVE_PILOT_READINESS_FOCUS_ERA18_POLICY_ID,
  GO_LIVE_PILOT_READINESS_FOCUS_ERA18_PROOF_STATUS,
  GO_LIVE_PILOT_READINESS_COMMAND_CENTER_ROUTE,
} from "@/lib/go-live/go-live-pilot-readiness-focus-era18-policy";

describe("go-live-pilot-readiness-focus-era18 policy", () => {
  it("registers era18 go-live pilot readiness proof", () => {
    expect(GO_LIVE_PILOT_READINESS_FOCUS_ERA18_POLICY_ID).toBe("era18-go-live-pilot-readiness-focus-v1");
    expect(GO_LIVE_PILOT_READINESS_FOCUS_ERA18_PROOF_STATUS).toBe(
      "go_live_pilot_readiness_attention_wired",
    );
    expect(GO_LIVE_PILOT_READINESS_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-058");
    expect(GO_LIVE_PILOT_READINESS_COMMAND_CENTER_ROUTE).toBe("/dashboard/go-live");
  });
});

describe("resolveGoLivePilotReadinessTargetProject", () => {
  const projects = [{ id: "proj-a" }, { id: "proj-b" }];

  it("prefers the requested project when present", () => {
    expect(resolveGoLivePilotReadinessTargetProject(projects, "proj-b")?.id).toBe("proj-b");
  });

  it("falls back to the first project when preferred id is missing", () => {
    expect(resolveGoLivePilotReadinessTargetProject(projects, "missing")?.id).toBe("proj-a");
  });

  it("returns null when no projects exist", () => {
    expect(resolveGoLivePilotReadinessTargetProject([])).toBeNull();
  });
});
