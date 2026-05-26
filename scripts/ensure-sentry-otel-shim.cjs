const fs = require("node:fs");
const path = require("node:path");

/**
 * npm hoists @opentelemetry/resources to the repo root while @sentry/node keeps
 * nested @opentelemetry/sdk-trace-base. Webpack then looks for resources under
 * @sentry/node/node_modules/@opentelemetry/resources and fails with ENOENT.
 */
const root = path.join(__dirname, "..");
const nestedDir = path.join(
  root,
  "node_modules",
  "@sentry",
  "node",
  "node_modules",
  "@opentelemetry"
);
const linkPath = path.join(nestedDir, "resources");
const target = path.join(root, "node_modules", "@opentelemetry", "resources");

if (!fs.existsSync(target)) {
  process.exit(0);
}

if (!fs.existsSync(nestedDir)) {
  process.exit(0);
}

try {
  if (fs.existsSync(linkPath)) {
    const stat = fs.lstatSync(linkPath);
    if (stat.isSymbolicLink()) {
      const current = fs.readlinkSync(linkPath);
      const expected = path.relative(path.dirname(linkPath), target);
      if (current === expected || path.resolve(path.dirname(linkPath), current) === target) {
        process.exit(0);
      }
      fs.unlinkSync(linkPath);
    } else {
      process.exit(0);
    }
  }

  const relativeTarget = path.relative(path.dirname(linkPath), target);
  fs.symlinkSync(relativeTarget, linkPath, "dir");
} catch {
  // partial install / Windows without symlink perms — ignore
}
