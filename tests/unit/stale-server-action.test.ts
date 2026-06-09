import { describe, expect, it } from "vitest";

import {
  isChunkLoadError,
  isStaleServerActionError,
  STALE_SERVER_ACTION_USER_MESSAGE,
  CHUNK_LOAD_USER_MESSAGE,
  CHUNK_LOAD_USER_TITLE,
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

  it("detects chunk load failures after deploy", () => {
    expect(isChunkLoadError(new Error("Loading chunk 29251 failed."))).toBe(true);
    expect(isChunkLoadError(new Error("ChunkLoadError: Loading chunk failed"))).toBe(true);
    expect(
      isChunkLoadError(new Error("Failed to fetch dynamically imported module")),
    ).toBe(true);
    expect(isChunkLoadError(new Error("Menu not found"))).toBe(false);
  });

  it("exports chunk load user copy", () => {
    expect(CHUNK_LOAD_USER_TITLE).toMatch(/version/i);
    expect(CHUNK_LOAD_USER_MESSAGE).toMatch(/reload/i);
  });
});
