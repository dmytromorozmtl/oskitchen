import { describe, expect, it } from "vitest";

import {
  LINEAR_PATH_DOC_CHAIN_STEP_DOCS,
  LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC,
  TERMINAL_FORBIDDEN_ACTIONS,
  resolveLinearPathPermanentlyClosedPrerequisites,
} from "@/lib/commercial/linear-path-permanently-closed-phases-era24";

describe("linear-path-permanently-closed-phases-era24", () => {
  it("locks 16-step doc chain", () => {
    expect(LINEAR_PATH_DOC_CHAIN_STEP_DOCS).toHaveLength(16);
    expect(LINEAR_PATH_DOC_CHAIN_STEP_DOCS[15]).toBe(LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC);
    expect(TERMINAL_FORBIDDEN_ACTIONS.length).toBeGreaterThanOrEqual(6);
  });

  it("requires absolute end for terminal closure", () => {
    expect(
      resolveLinearPathPermanentlyClosedPrerequisites({ absoluteEndActive: false })
        .terminalClosureActive,
    ).toBe(false);
    expect(
      resolveLinearPathPermanentlyClosedPrerequisites({ absoluteEndActive: true })
        .terminalClosureActive,
    ).toBe(true);
    expect(
      resolveLinearPathPermanentlyClosedPrerequisites({ absoluteEndActive: true })
        .linearPathPermanentlyClosed,
    ).toBe(true);
  });
});
