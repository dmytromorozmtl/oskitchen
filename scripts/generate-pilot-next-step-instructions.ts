/**
 * Regenerate docs/generated/NEXT_STEP_INSTRUCTIONS.md from live pilot state.
 *
 *   npm run pilot:next-step:doc
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  bestLiveStagingUrl,
  collectVercelUrlCandidates,
  nextIncompletePilotAction,
  pilotEnv,
  pilotStagingUrl,
  probeAllStagingUrls,
  resolvePilotQueue,
  ROOT,
} from "./lib/pilot-action-queue";
import { loadStagingPilotEnv } from "./lib/load-dotenv-file";
import {
  isValidUpstashToken,
  isValidUpstashUrl,
} from "./lib/staging-env-placeholders";

const OUT = join(ROOT, "docs/generated/NEXT_STEP_INSTRUCTIONS.md");

const BLOCKER_PLAYBOOK: Record<
  string,
  { title: string; owner: string; eta: string; steps: string[] }
> = {
  upstash: {
    title: "Upstash REST (rate limits на Vercel)",
    owner: "Ops",
    eta: "~5 мин",
    steps: [
      "**Одна команда (рекомендуется):**",
      "```bash\nnpm run pilot:upstash:gate\n```",
      "Откроет scan всех `.env*`, создаст `.env.upstash.paste.local` если нужно, чеклист Vercel.",
      "Интерактивно: `npm run pilot:upstash:gate -- --wizard`",
      "Без терминала: отредактируйте `.env.upstash.paste.local` (шаблон `docs/templates/UPSTASH_PASTE.env.example`) → снова `pilot:upstash:gate`",
      "Upstash Console: https://console.upstash.com/redis → REST API",
      "После OK: `docs/generated/PILOT_UPSTASH_VERCEL_CHECKLIST.md`",
    ],
  },
  "deploy-live": {
    title: "Живой deploy staging (HTTP 200)",
    owner: "Ops / CI",
    eta: "~15–30 мин",
    steps: [
      "```bash\nnpm run pilot:deploy:gate\n```",
      "Если знаете новый URL:",
      "```bash\nnpm run pilot:deploy:gate -- --url=https://YOUR-PREVIEW.vercel.app\n```",
      "Чеклист: `docs/generated/PILOT_DEPLOY_VERCEL_CHECKLIST.md`",
      "CI: GitHub → **Paid Pilot Gate**",
    ],
  },
  staff: {
    title: "Staff invite (golden path / E2E)",
    owner: "Product",
    eta: "~10 мин",
    steps: [
      "Dashboard → Storefront → **Team** → пригласить staff (email отличный от owner).",
      "Или smoke:",
      "```bash\nnpm run smoke:team-invites -- --owner-email=workspace.moroz@gmail.com --email=staff@example.com\n```",
      "Затем: `npm run pilot:next-step`",
    ],
  },
  http: {
    title: "HTTP golden path smoke",
    owner: "Ops (auto)",
    eta: "~2 мин",
    steps: [
      "```bash\nSMOKE_BASE_URL=\"$NEXT_PUBLIC_APP_URL\" npm run smoke:golden-path-http\n```",
      "Или: `npm run pilot:next-step` (выполнит шаг автоматически).",
    ],
  },
  "e2e-env": {
    title: "E2E credentials",
    owner: "Ops",
    eta: "~5 мин",
    steps: [
      "Скопируйте `docs/generated/PILOT_E2E_ENV_SNIPPET.env` → export в shell или CI secrets.",
      "Документация: `docs/E2E_PILOT_JOURNEY.md`.",
      "```bash\nnpm run pilot:next-step\n```",
    ],
  },
  "golden-manual": {
    title: "Ручной golden path",
    owner: "Product",
    eta: "45–60 мин",
    steps: [
      "Чеклист: `docs/PILOT_GOLDEN_PATH_CHECKLIST.md`.",
      "После прохождения: `npm run pilot:record-signoff -- --role=product --by=\"…\" --go`.",
    ],
  },
  signoff: {
    title: "Tech + Ops + Product sign-off",
    owner: "All",
    eta: "~10 мин",
    steps: [
      "```bash\nnpm run pilot:record-signoff -- --role=tech --by=\"Tech Lead\" --go\nnpm run pilot:record-signoff -- --role=ops --by=\"Ops\" --go\nnpm run pilot:record-signoff -- --role=product --by=\"Product\" --go\n```",
      "Отчёт: `npm run pilot:go-no-go-report`",
    ],
  },
};

function envLine(key: string, ok: boolean): string {
  return `| ${key} | ${ok ? "OK" : "**FAIL**"} |`;
}

async function main() {
  loadStagingPilotEnv(ROOT);
  const resolved = await resolvePilotQueue();
  const done = resolved.filter((x) => x.complete).length;
  const total = resolved.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const next = await nextIncompletePilotAction();
  const stagingUrl = pilotStagingUrl();
  const candidates = collectVercelUrlCandidates();
  const probes = candidates.length ? await probeAllStagingUrls(candidates) : [];
  const liveUrl = bestLiveStagingUrl(probes);
  const hasUpstash =
    isValidUpstashUrl(pilotEnv("UPSTASH_REDIS_REST_URL") ?? "") &&
    isValidUpstashToken(pilotEnv("UPSTASH_REDIS_REST_TOKEN") ?? "");
  const localMemory = pilotEnv("PILOT_LOCAL_MEMORY_RATE_LIMIT") === "1";

  const lines: string[] = [
    "# Paid pilot — следующий шаг (100%)",
    "",
    `**Сгенерировано:** ${new Date().toISOString()}`,
    "",
    `**Прогресс очереди:** ${done}/${total} (${pct}%)`,
    "",
    "## Сводка",
    "",
    "| Проверка | Статус |",
    "|----------|--------|",
    envLine("CRON_SECRET + ENCRYPTION_KEY", Boolean(pilotEnv("CRON_SECRET") && pilotEnv("ENCRYPTION_KEY"))),
    envLine("PLATFORM_IMPERSONATION_TOTP_SECRET", Boolean(pilotEnv("PLATFORM_IMPERSONATION_TOTP_SECRET"))),
    envLine("UPSTASH (Vercel GO)", hasUpstash),
    envLine("DATABASE_URL", Boolean(pilotEnv("DATABASE_URL") && !pilotEnv("DATABASE_URL")!.includes("aws-REGION"))),
    `| NEXT_PUBLIC_APP_URL | ${stagingUrl ?? "_не задан_"} |`,
    `| Deploy live (/api/health или /login 200) | ${liveUrl ? `OK (${liveUrl})` : "**FAIL — redeploy**"} |`,
    localMemory ? "| PILOT_LOCAL_MEMORY_RATE_LIMIT | WARN — только локально, не Vercel GO |" : "",
    "",
    "## Очередь",
    "",
  ].filter(Boolean);

  for (const { action, complete } of resolved) {
    lines.push(`- [${complete ? "x" : " "}] **${action.id}** (${action.owner}) — ${action.title}`);
  }

  lines.push("", "---", "");

  if (next) {
    lines.push(`## ▶ Сейчас: \`${next.id}\` — ${next.title}`, "");
    lines.push(`**Владелец:** ${next.owner}`, "");
    const playbook = BLOCKER_PLAYBOOK[next.id];
    if (playbook) {
      lines.push(`**Оценка:** ${playbook.eta}`, "");
      let n = 0;
      for (const s of playbook.steps) {
        if (s.startsWith("```")) {
          lines.push("", s, "");
        } else {
          n += 1;
          lines.push(`${n}. ${s}`);
        }
      }
    } else if (next.manual?.length) {
      next.manual.forEach((m, i) => lines.push(`${i + 1}. ${m}`));
    }
    lines.push(
      "",
      "**Одна команда (всё автоматизируемое):**",
      "```bash",
      "npm run pilot:100-next",
      "```",
      "",
      "**Или один шаг очереди:**",
      "```bash",
      "npm run pilot:next-step",
      "```",
      "",
    );
  } else {
    lines.push("## Все шаги очереди выполнены", "", "```bash", "npm run pilot:go-no-go-report", "```", "");
  }

  if (probes.length) {
    lines.push("## Probe staging URLs", "", "| URL | Path | HTTP |", "|-----|------|------|");
    for (const p of probes) {
      lines.push(`| ${p.url} | ${p.path} | ${p.status || "ERR"} ${p.ok ? "✓" : ""} |`);
    }
    if (!liveUrl) {
      lines.push(
        "",
        "> **404 на всех путях** — preview URL устарел или приложение не задеплоено. Redeploy + `npm run staging:url:probe -- --fix`.",
      );
    }
    lines.push("");
  }

  lines.push(
    "## После Upstash (чеклист Vercel GO)",
    "",
    "1. `npm run verify:staging-env` (без `--local-pilot`)",
    "2. `npm run vercel:staging-push -- --apply`",
    "3. Redeploy staging на Vercel",
    "4. `npm run staging:url:probe -- --fix`",
    "5. `npm run pilot:next-step`",
    "",
    "## Локально без Upstash (не заменяет Vercel)",
    "",
    "```bash",
    "npm run pilot:local-continue",
    "```",
    "",
    "## Ссылки",
    "",
    "- Runbook: `docs/PILOT_100_PERCENT_RUNBOOK.md`",
    "- Upstash: `docs/UPSTASH_STAGING_SETUP.md`",
    "- GO/NO-GO: `npm run pilot:go-no-go-report` → `docs/generated/PILOT_GO_NO_GO_STATUS.md`",
    "",
    "_Обновить: `npm run pilot:next-step:doc`_",
    "",
  );

  writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`Wrote ${OUT} (${pct}% complete, next: ${next?.id ?? "none"})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
