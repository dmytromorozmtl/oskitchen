import { existsSync, readFileSync, writeFileSync } from "node:fs";

function formatEnvLine(key: string, value: string): string {
  const needsQuotes = /[\s#&|$`"'\\]/.test(value);
  if (!needsQuotes) return `${key}=${value}`;
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `${key}="${escaped}"`;
}

/** Remove KEY= line from a dotenv file if present. */
export function removeEnvKey(filePath: string, key: string): void {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, "utf8");
  const re = new RegExp(`^${key}=.*\\n?`, "m");
  if (!re.test(raw)) return;
  writeFileSync(filePath, raw.replace(re, ""), "utf8");
}

/** Set or append KEY=value in a dotenv file (no shell quoting issues). */
export function patchEnvFile(filePath: string, key: string, value: string): void {
  const line = formatEnvLine(key, value);
  if (!existsSync(filePath)) {
    writeFileSync(filePath, `${line}\n`, "utf8");
    return;
  }
  const raw = readFileSync(filePath, "utf8");
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(raw)) {
    writeFileSync(filePath, raw.replace(re, line), "utf8");
  } else {
    const suffix = raw.endsWith("\n") ? "" : "\n";
    writeFileSync(filePath, `${raw}${suffix}${line}\n`, "utf8");
  }
}
