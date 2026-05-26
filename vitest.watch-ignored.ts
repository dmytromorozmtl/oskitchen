import fs from "node:fs";
import path from "node:path";

const EXTRA_IGNORES = [
  ".git",
  "docs",
  "archive",
  "artifacts",
  ".deploy-logs",
  ".cursor",
  "agent-transcripts",
];

function expandIgnoreEntry(rootDir: string, rawEntry: string): string[] {
  let entry = rawEntry.trim();
  if (!entry || entry.startsWith("#") || entry.startsWith("!")) {
    return [];
  }

  entry = entry.replace(/^\//, "").replace(/\/$/, "");
  if (!entry) {
    return [];
  }

  const absolute = path.resolve(rootDir, entry);
  return [
    absolute,
    `${absolute}/**`,
    `**/${entry}`,
    `**/${entry}/**`,
  ];
}

export function buildVitestWatchIgnored(rootDir: string): string[] {
  const gitignorePath = path.join(rootDir, ".gitignore");
  const gitignoreEntries = fs.existsSync(gitignorePath)
    ? fs
        .readFileSync(gitignorePath, "utf8")
        .split(/\r?\n/)
    : [];

  const ignored = new Set<string>();
  for (const entry of [...gitignoreEntries, ...EXTRA_IGNORES]) {
    for (const pattern of expandIgnoreEntry(rootDir, entry)) {
      ignored.add(pattern);
    }
  }

  return [...ignored];
}
