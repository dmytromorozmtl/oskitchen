/**
 * Open Upstash paste file in default editor.
 *
 *   npm run pilot:open:paste
 */
import { execSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { upstashPastePath } from "./lib/upstash-paste-state";

const ROOT = process.cwd();
const TEMPLATE = join(ROOT, "docs/templates/UPSTASH_PASTE.env.example");
const PASTE = upstashPastePath(ROOT);

if (!existsSync(PASTE)) {
  if (existsSync(TEMPLATE)) copyFileSync(TEMPLATE, PASTE);
  else execSync(`npm run pilot:upstash:gate`, { stdio: "inherit", cwd: ROOT });
}

const editor = process.env.EDITOR || process.env.VISUAL || "code";
console.log(`Opening ${PASTE} with ${editor}…`);
console.log("\nPaste from: https://console.upstash.com/redis → REST API");
console.log("Then save and run: npm run pilot:upstash:gate\n");

try {
  execSync(`${editor} "${PASTE}"`, { stdio: "inherit" });
} catch {
  console.log(`File: ${PASTE}`);
}
