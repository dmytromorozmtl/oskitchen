const fs = require("node:fs");
const path = require("node:path");

/**
 * Vitest 4 preloads `suppress-warnings.cjs` via NODE_OPTIONS during CLI startup.
 * Partial or corrupted installs can leave `node_modules/vitest/` without this file,
 * which breaks every Vitest invocation before tests load.
 */
const vitestDir = path.join(__dirname, "..", "node_modules", "vitest");
const target = path.join(vitestDir, "suppress-warnings.cjs");
const contents = `'use strict';

process.emitWarning = () => {};
`;

if (!fs.existsSync(vitestDir)) {
  process.exit(0);
}

try {
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, contents, "utf8");
  }
} catch {
  // install may be incomplete in partial CI — ignore
}
