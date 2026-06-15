/**
 * Record a P0 incident for go/no-go tracking.
 *
 *   npm run beta:record-incident -- --title="..." --severity=P0
 *   npm run beta:record-incident -- --list
 *   npm run beta:record-incident -- --resolve=inc-20260517-001
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PATH = join(process.cwd(), "docs", "artifacts", "BETA_P0_INCIDENTS.json");

type Incident = {
  id: string;
  title: string;
  severity: "P0" | "P1";
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
};

type IncidentFile = { incidents: Incident[] };

function load(): IncidentFile {
  if (!existsSync(PATH)) return { incidents: [] };
  try {
    return JSON.parse(readFileSync(PATH, "utf8")) as IncidentFile;
  } catch {
    return { incidents: [] };
  }
}

function save(data: IncidentFile) {
  mkdirSync(join(process.cwd(), "docs", "artifacts"), { recursive: true });
  writeFileSync(PATH, JSON.stringify(data, null, 2), "utf8");
}

function main() {
  const list = process.argv.includes("--list");
  const resolveId = process.argv.find((a) => a.startsWith("--resolve="))?.split("=")[1];
  const title = process.argv.find((a) => a.startsWith("--title="))?.split("=").slice(1).join("=");
  const severity =
    (process.argv.find((a) => a.startsWith("--severity="))?.split("=")[1] as "P0" | "P1") ?? "P0";
  const notes = process.argv.find((a) => a.startsWith("--notes="))?.split("=").slice(1).join("=");

  const data = load();

  if (list) {
    if (data.incidents.length === 0) {
      console.log("No incidents recorded.");
      return;
    }
    for (const i of data.incidents) {
      const open = i.resolvedAt ? "resolved" : "OPEN";
      console.log(`${i.id} [${i.severity}] ${open} — ${i.title} (${i.createdAt.slice(0, 10)})`);
    }
    const openP0 = data.incidents.filter((i) => i.severity === "P0" && !i.resolvedAt).length;
    console.log(`\nOpen P0: ${openP0}`);
    return;
  }

  if (resolveId) {
    const inc = data.incidents.find((i) => i.id === resolveId);
    if (!inc) {
      console.error(`Incident not found: ${resolveId}`);
      process.exit(1);
    }
    inc.resolvedAt = new Date().toISOString();
    save(data);
    console.log(`Resolved ${resolveId}`);
    return;
  }

  if (!title?.trim()) {
    console.error(
      "Usage: npm run beta:record-incident -- --title=\"...\" [--severity=P0] [--notes=...]",
    );
    console.error("       npm run beta:record-incident -- --list");
    console.error("       npm run beta:record-incident -- --resolve=<id>");
    process.exit(1);
  }

  const id = `inc-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(data.incidents.length + 1).padStart(3, "0")}`;
  data.incidents.push({
    id,
    title: title.trim(),
    severity,
    createdAt: new Date().toISOString(),
    notes,
  });
  save(data);
  console.log(`Recorded ${id}: ${title}`);
  console.log(`File: ${PATH}`);
}

main();
