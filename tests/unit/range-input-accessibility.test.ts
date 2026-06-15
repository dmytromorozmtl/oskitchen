import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

import { RangeInput } from "@/components/ui/range-input";

const ROOT = process.cwd();

function walkTsx(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walkTsx(full, out);
      continue;
    }
    if (entry.endsWith(".tsx")) out.push(full);
  }
  return out;
}

describe("RangeInput accessibility", () => {
  it("sets step and aria-* attributes on controlled sliders", () => {
    const html = renderToStaticMarkup(
      React.createElement(RangeInput, {
        id: "demo-range",
        min: 50,
        max: 500,
        step: 10,
        value: 120,
        valueText: "120 orders",
        "aria-labelledby": "demo-range-label",
      }),
    );

    expect(html).toContain('type="range"');
    expect(html).toContain('step="10"');
    expect(html).toContain('aria-valuemin="50"');
    expect(html).toContain('aria-valuemax="500"');
    expect(html).toContain('aria-valuenow="120"');
    expect(html).toContain('aria-valuetext="120 orders"');
    expect(html).toContain('aria-labelledby="demo-range-label"');
  });

  it("does not use raw type=\"range\" inputs outside RangeInput", () => {
    const offenders: string[] = [];

    for (const file of walkTsx(ROOT)) {
      if (file.includes(`${join("components", "ui", "range-input.tsx")}`)) continue;
      const source = readFileSync(file, "utf8");
      if (/type\s*=\s*["']range["']/.test(source)) {
        offenders.push(file.replace(`${ROOT}/`, ""));
      }
    }

    expect(offenders).toEqual([]);
  });
});
