import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("use-kds-realtime hook", () => {
  it("wraps subscribeKdsOrderUpdates with React state", () => {
    const source = readFileSync(join(ROOT, "hooks/use-kds-realtime.ts"), "utf8");
    expect(source).toContain("subscribeKdsOrderUpdates");
    expect(source).toContain("getKdsConnectionStatusLabel");
    expect(source).toContain("onReconnectAttempt");
    expect(source).toContain("connectionLabel");
  });
});
