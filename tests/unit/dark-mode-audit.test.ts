import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const AUDIT_PATH = join(process.cwd(), "docs/dark-mode-audit.md");
const GLOBALS_PATH = join(process.cwd(), "app/globals.css");
const SHELL_PATH = join(process.cwd(), "components/dashboard/dashboard-shell.tsx");
const LOCK_PATH = join(process.cwd(), "components/providers/public-theme-lock.tsx");

describe("dark mode audit doc", () => {
  it("exists with architecture and remediation sections", () => {
    const doc = readFileSync(AUDIT_PATH, "utf8");
    expect(doc).toContain("# Dark mode audit — OS Kitchen");
    expect(doc).toContain("dark-mode-audit-v1");
    expect(doc).toContain("PublicThemeLock");
    expect(doc).toContain("dashboard-shell.tsx");
    expect(doc).toContain("## Remediation backlog");
    expect(doc).toContain("status-color-tokens.md");
  });

  it("references live theme infrastructure in codebase", () => {
    const globals = readFileSync(GLOBALS_PATH, "utf8");
    const shell = readFileSync(SHELL_PATH, "utf8");
    const lock = readFileSync(LOCK_PATH, "utf8");
    expect(globals).toContain(".dark {");
    expect(globals).toContain(".dark-section");
    expect(shell).toContain("ThemeToggle");
    expect(lock).toContain('setTheme("light")');
  });
});
