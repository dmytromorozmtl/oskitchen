import { describe, expect, it } from "vitest";

import { parseDotenvLines } from "@/e2e/load-playwright-env";

describe("parseDotenvLines", () => {
  it("parses basic keys and quoted values", () => {
    const raw = `
# ignored
FOO=bar
BAZ="quoted"
EMPTY=
`;
    expect(parseDotenvLines(raw)).toEqual({
      FOO: "bar",
      BAZ: "quoted",
      EMPTY: "",
    });
  });
});
