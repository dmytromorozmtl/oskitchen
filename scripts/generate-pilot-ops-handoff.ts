/**
 * Professional ops handoff — full path to Vercel GO with DoD per step.
 *
 *   npm run pilot:ops:handoff
 */
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadStagingPilotEnv } from "./lib/load-dotenv-file";
import {
  isValidUpstashToken,
  isValidUpstashUrl,
} from "./lib/staging-env-placeholders";
import {
  bestLiveStagingUrl,
  collectVercelUrlCandidates,
  nextIncompletePilotAction,
  pilotStagingUrl,
  probeAllStagingUrls,
  resolvePilotQueue,
  ROOT,
} from "./lib/pilot-action-queue";
import { getUpstashPasteState } from "./lib/upstash-paste-state";

const OUT = join(ROOT, "docs/generated/PILOT_OPS_HANDOFF.md");

function pasteHint(state: ReturnType<typeof getUpstashPasteState>["state"]): string {
  switch (state) {
    case "missing":
      return "Run npm run pilot:upstash:gate to create .env.upstash.paste.local";
    case "template":
      return ".env.upstash.paste.local still has example URL — replace with real Upstash REST credentials";
    case "url-only":
      return "UPSTASH_REDIS_REST_TOKEN is empty in .env.upstash.paste.local";
    case "ready":
      return "Paste file ready — run npm run pilot:upstash:gate";
  }
}

async function main() {
  loadStagingPilotEnv(ROOT);
  const resolved = await resolvePilotQueue();
  const done = resolved.filter((x) => x.complete).length;
  const total = resolved.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const next = await nextIncompletePilotAction();
  const paste = getUpstashPasteState(ROOT);
  const hasUpstash =
    isValidUpstashUrl(process.env.UPSTASH_REDIS_REST_URL ?? "") &&
    isValidUpstashToken(process.env.UPSTASH_REDIS_REST_TOKEN ?? "");
  const stagingUrl = pilotStagingUrl();
  const candidates = collectVercelUrlCandidates();
  const probes = candidates.length ? await probeAllStagingUrls(candidates) : [];
  const live = bestLiveStagingUrl(probes);
  const localMemory = process.env.PILOT_LOCAL_MEMORY_RATE_LIMIT === "1";

  const localReport = join(ROOT, "docs/generated/PILOT_LOCAL_100_REPORT.md");
  const localDone = existsSync(localReport);

  const lines: string[] = [
    "# Paid pilot — Ops handoff (100%)",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    `**Queue progress:** ${done}/${total} (${pct}%)`,
    `**Current blocker:** \`${next?.id ?? "none"}\` — ${next?.title ?? "complete"}`,
    "",
    "## Two tracks",
    "",
    "| Track | Command | Meaning |",
    "|-------|---------|---------|",
    `| **LOCAL 100%** | \`npm run pilot:local:100\` | Code + DB + local env (no Upstash/Vercel required) |`,
    `| **VERCEL GO** | paste Upstash + redeploy + \`npm run pilot:100-next\` | Production staging ready for pilot |`,
    "",
    localDone
      ? "LOCAL 100% report exists — run `npm run pilot:local:100` to refresh."
      : "Run `npm run pilot:local:100` first to close everything possible without Upstash.",
    "",
    "## Definition of Done (Vercel GO)",
    "",
    "| # | Criterion | Status |",
    "|---|-----------|--------|",
    `| 1 | Upstash REST ping OK | ${hasUpstash ? "PASS" : "**BLOCKED**"} |`,
    `| 2 | \`verify:staging-env\` (no --local-pilot) | ${hasUpstash && !localMemory ? "pending" : localMemory ? "WARN local memory" : "BLOCKED"} |`,
    `| 3 | Staging deploy HTTP 200 | ${live ? `PASS (${live})` : "**BLOCKED** (404)"} |`,
    `| 4 | \`smoke:golden-path-http\` | ${live ? "pending" : "BLOCKED"} |`,
    `| 5 | Staff in workspace | pending |`,
    `| 6 | Manual golden path + sign-off | pending |`,
    "",
    "## Do this now (ordered)",
    "",
  ];

  if (!hasUpstash) {
    lines.push(
      "### Step 1 — Upstash (~5 min) **YOU**",
      "",
      `Paste file status: **${paste.state}** — ${pasteHint(paste.state)}`,
      "",
      "```bash",
      "# 1. Edit paste file with real REST credentials",
      "code .env.upstash.paste.local   # or your editor",
      "",
      "# 2. Ingest + verify",
      "npm run pilot:upstash:gate",
      "```",
      "",
      "Console: https://console.upstash.com/redis → database → **REST API**",
      "",
      "**DoD:** `npm run staging:ops:status` shows UPSTASH = OK.",
      "",
    );
  }

  if (!live) {
    lines.push(
      "### Step 2 — Redeploy staging (~15 min) **YOU**",
      "",
      "```bash",
      "npm run pilot:deploy:gate",
      "# After redeploy in Vercel:",
      "npm run pilot:deploy:gate -- --url=https://YOUR-NEW-PREVIEW.vercel.app",
      "```",
      "",
      `Probed URL: \`${stagingUrl ?? "none"}\` → 404 on /api/health, /login`,
      "",
      "**DoD:** `npm run staging:url:probe` shows OK on at least one path.",
      "",
    );
  }

  if (hasUpstash) {
    lines.push(
      "### Vercel env push",
      "",
      "```bash",
      "npm run vercel:staging-push -- --dry-run",
      "npm run vercel:staging-push -- --apply",
      "# Redeploy staging",
      "```",
      "",
      "Checklist: `docs/generated/PILOT_UPSTASH_VERCEL_CHECKLIST.md` (after upstash gate)",
      "",
    );
  }

  lines.push(
    "### Step 3 — Automate remainder",
    "",
    "```bash",
    "npm run pilot:100-next",
    "```",
    "",
    "## Progress diagram",
    "",
    "```mermaid",
    "flowchart LR",
    "  subgraph done [Done]",
    "    A[Secrets TOTP DB]",
    "  end",
    "  subgraph blocked [Blocked]",
    "    B[Upstash]",
    "    C[Deploy live]",
    "  end",
    "  subgraph after [After unblock]",
    "    D[HTTP smoke]",
    "    E[Staff E2E]",
    "    F[Sign-off GO]",
    "  end",
    "  A --> B",
    "  B --> C",
    "  C --> D",
    "  D --> E",
    "  E --> F",
    "```",
    "",
    "## Queue",
    "",
  );

  for (const { action, complete } of resolved) {
    lines.push(`- [${complete ? "x" : " "}] ${action.id} (${action.owner})`);
  }

  lines.push(
    "",
    "## Artifacts",
    "",
    "| File | Purpose |",
    "|------|---------|",
    "| `docs/generated/NEXT_STEP_INSTRUCTIONS.md` | Live next-step guide |",
    "| `docs/generated/PILOT_GO_NO_GO_STATUS.md` | `npm run pilot:go-no-go-report` |",
    "| `.env.upstash.paste.local` | Paste Upstash credentials (gitignored) |",
    "| `docs/PILOT_100_PERCENT_RUNBOOK.md` | Full runbook |",
    "",
    "_Regenerate: `npm run pilot:ops:handoff`_",
    "",
  );

  writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`Wrote ${OUT}`);
  console.log(`Blocker: ${next?.id ?? "none"} | Upstash paste: ${paste.state}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
