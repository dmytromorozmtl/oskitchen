import { describe, expect, it } from "vitest";

import { resolveTrainingActorScope } from "@/lib/training/resolve-training-actor-scope";
import { canUseTraining } from "@/lib/training/training-permissions";
import { workspacePermissionForTrainingCapability } from "@/lib/training/training-mutation-permission";

describe("resolveTrainingActorScope", () => {
  it("does not treat every user as owner", () => {
    const scope = resolveTrainingActorScope({
      workspaceRole: "STAFF",
      email: "trainer@example.com",
      profileRole: "trainer",
      profileEmail: "trainer@example.com",
    });
    expect(scope.isOwner).toBe(false);
    expect(canUseTraining(scope, "training.program.create")).toBe(true);
    expect(canUseTraining(scope, "training.cert.revoke")).toBe(false);
  });

  it("maps participant capabilities to training.participate", () => {
    expect(workspacePermissionForTrainingCapability("training.quiz.attempt")).toBe(
      "training.participate",
    );
    expect(workspacePermissionForTrainingCapability("training.program.create")).toBe(
      "training.manage",
    );
  });
});
