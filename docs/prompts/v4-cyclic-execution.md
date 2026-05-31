# OS Kitchen — CYCLIC SELF-HEALING EXECUTION PROMPT (v4.0)

See parent chat for full prompt body. Each invocation: run diagnostics → fix ONE blocker → commit → append `artifacts/execution-log.txt`.

**Invoke:** "Выполни один цикл по v4.0"

**Stop when:** `artifacts/final-execution-report.json` shows `ready: true` and `pilotExecutableScore: 100`.
