import { describe, expect, it } from "vitest";

import {
  isStaleServerActionError,
  STALE_SERVER_ACTION_USER_MESSAGE,
} from "@/lib/server-actions/stale-server-action";

describe("stale-server-action", () => {
  it("detects Next.js failed-to-find-server-action copy", () => {
    expect(
      isStaleServerActionError(
        new Error(
          'Server Action "40f3e943cd05bcaaa5bb71002b8b6Oaf7ff79lad7e" was not found on the server.',
        ),
      ),
    ).toBe(true);
    expect(
      isStaleServerActionError(
        new Error("Failed to find Server Action — older or newer deployment"),
      ),
    ).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(isStaleServerActionError(new Error("Menu not found"))).toBe(false);
  });

  it("exports user-facing reload message", () => {
    expect(STALE_SERVER_ACTION_USER_MESSAGE).toMatch(/reload/i);
  });
});
