import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { formatApiErrorMessage } from "@/components/ui/api-error-state";

const ROOT = process.cwd();
const COMPONENT_PATH = join(ROOT, "components/ui/api-error-state.tsx");

describe("ApiErrorState", () => {
  const source = readFileSync(COMPONENT_PATH, "utf8");

  it("exports card and inline API failure states with retry and support CTAs", () => {
    expect(source).toContain("export function ApiErrorState");
    expect(source).toContain('data-testid={testId}');
    expect(source).toContain('role="alert"');
    expect(source).toContain("Contact support");
    expect(source).toContain("Go to Today");
    expect(source).toContain('variant?: "card" | "inline"');
    expect(source).toContain("onRetry");
  });

  it("surfaces HTTP status and request reference when provided", () => {
    expect(source).toContain("statusCode");
    expect(source).toContain("requestId");
    expect(source).toContain("HTTP {statusCode}");
  });

  it("formats unknown API errors into user-safe messages", () => {
    expect(formatApiErrorMessage(new Error("Network timeout"))).toBe("Network timeout");
    expect(formatApiErrorMessage("Service unavailable")).toBe("Service unavailable");
    expect(formatApiErrorMessage({ message: "Rate limited" })).toBe("Rate limited");
    expect(formatApiErrorMessage(null)).toBe("Something went wrong.");
  });
});
