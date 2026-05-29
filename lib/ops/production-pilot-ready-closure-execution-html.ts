/**
 * HTML renderer for production pilot ready closure execution report.
 */
import type { ProductionPilotReadyClosureExecutionSummary } from "@/lib/ops/production-pilot-ready-closure-execution-orchestrator";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderProductionPilotReadyClosureExecutionHtml(
  summary: ProductionPilotReadyClosureExecutionSummary,
): string {
  const gateRows = summary.gates
    .map(
      (gate) => `
      <tr>
        <td class="${gate.complete ? "status-pass" : "status-blocked"}">${gate.complete ? "✓" : "✗"}</td>
        <td>${escapeHtml(gate.label)}</td>
        <td>${escapeHtml(gate.proofStatus ?? "n/a")}</td>
        <td>${escapeHtml(gate.detail)}</td>
        <td>${gate.command ? `<code>${escapeHtml(gate.command)}</code>` : "—"}</td>
      </tr>`,
    )
    .join("");

  const chainRows = summary.chainSteps
    .map(
      (step) => `
      <tr>
        <td class="${step.complete ? "status-pass" : "status-blocked"}">${step.complete ? "✓" : "✗"}</td>
        <td>${escapeHtml(step.label)}</td>
        <td>${escapeHtml(step.actualMilestone ?? "missing")}</td>
        <td>${escapeHtml(step.expectedMilestone)}</td>
      </tr>`,
    )
    .join("");

  const steps = summary.recommendedCommands
    .map((cmd) => `<li><code>${escapeHtml(cmd)}</code></li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>KitchenOS Production Pilot Ready Closure</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #111; line-height: 1.5; }
    .banner { padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; }
    .banner-pass { background: #ecfdf5; border: 1px solid #6ee7b7; }
    .banner-blocked { background: #fff7ed; border: 1px solid #fdba74; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0 2rem; font-size: 0.9rem; }
    th, td { border: 1px solid #e5e7eb; padding: 0.5rem 0.65rem; text-align: left; vertical-align: top; }
    th { background: #f9fafb; }
    .status-pass { color: #047857; font-weight: 700; }
    .status-blocked { color: #b45309; font-weight: 700; }
    code { font-family: ui-monospace, monospace; font-size: 0.85em; }
    .honesty { font-size: 0.85rem; color: #6b7280; }
  </style>
</head>
<body>
  <h1>Production Pilot Ready — Step 14 Closure</h1>
  <p class="honesty">Policy ${escapeHtml(summary.policyId)} · Generated ${escapeHtml(summary.generatedAt)}</p>

  <div class="banner ${summary.milestone === "production_pilot_ready_passed" ? "banner-pass" : "banner-blocked"}">
    <strong>Milestone:</strong> ${escapeHtml(summary.milestone)}<br />
    <strong>Maintenance mode:</strong> ${escapeHtml(summary.maintenanceModeExecutionMilestone ?? "missing")}<br />
    <strong>GO:</strong> ${escapeHtml(summary.goDecision ?? "not evaluated")} · Customer: ${escapeHtml(summary.customerName ?? "not recorded")}<br />
    <strong>Chain:</strong> ${summary.chainStepsPassed}/${summary.chainStepsTotal} · Vault: ${summary.vaultReady ? "ready" : "blocked"}<br />
    <strong>Commercial inflection:</strong> ${escapeHtml(summary.commercialInflectionMilestone)} · score ${summary.pilotExecutableScore}/100
  </div>

  <p class="honesty">${escapeHtml(summary.honestyNote)}</p>

  <h2>Execution gates</h2>
  <table>
    <thead><tr><th></th><th>Gate</th><th>Proof</th><th>Detail</th><th>Command</th></tr></thead>
    <tbody>${gateRows}</tbody>
  </table>

  <h2>Execution chain (Steps 2–13)</h2>
  <table>
    <thead><tr><th></th><th>Step</th><th>Actual</th><th>Expected</th></tr></thead>
    <tbody>${chainRows}</tbody>
  </table>

  <h2>Recommended commands</h2>
  <ul>${steps}</ul>
</body>
</html>`;
}
