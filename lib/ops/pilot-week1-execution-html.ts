/**
 * HTML renderer for Pilot Week 1 execution report.
 */
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderPilotWeek1ExecutionHtml(
  summary: PilotWeek1ExecutionOrchestratorSummary,
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

  const phaseRows = summary.phases
    .map(
      (phase) => `
      <tr>
        <td class="${phase.complete ? "status-pass" : "status-blocked"}">${phase.complete ? "✓" : "✗"}</td>
        <td>${escapeHtml(phase.label)}</td>
        <td>${escapeHtml(phase.detail)}</td>
        <td>${phase.smokeScripts.length ? phase.smokeScripts.map((s) => `<code>npm run ${escapeHtml(s)}</code>`).join("<br />") : "—"}</td>
      </tr>`,
    )
    .join("");

  const steps = summary.recommendedCommands
    .map((cmd) => `<li><code>${escapeHtml(cmd)}</code></li>`)
    .join("");

  const surfaces = summary.productSurfaces
    .map((route) => `<li><code>${escapeHtml(route)}</code></li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>OS Kitchen Pilot Week 1 Execution</title>
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
  <h1>Pilot Week 1 — Step 5 Execution</h1>
  <p class="honesty">Policy ${escapeHtml(summary.policyId)} · Generated ${escapeHtml(summary.generatedAt)}</p>

  <div class="banner ${summary.milestone === "week1_execution_passed" ? "banner-pass" : "banner-blocked"}">
    <strong>Milestone:</strong> ${escapeHtml(summary.milestone)}<br />
    <strong>Commercial gate:</strong> ${escapeHtml(summary.commercialGateMilestone ?? "missing")}<br />
    <strong>GO:</strong> ${escapeHtml(summary.goDecision ?? "not evaluated")} · Customer: ${escapeHtml(summary.customerName ?? "not recorded")}<br />
    <strong>Week 1 days:</strong> ${summary.week1Complete ? "complete" : "in progress"}<br />
    <strong>Checkpoint:</strong> operator ${escapeHtml(summary.operatorGoldenPathProofStatus ?? "missing")} · rollback ${escapeHtml(summary.rollbackDrillProofStatus ?? "missing")}<br />
    <strong>CS sign-off:</strong> ${summary.csSignoffComplete ? "yes" : "no"} · integrity ${summary.week1IntegrityPassed ? "PASS" : "FAIL"}
  </div>

  <p class="honesty">${escapeHtml(summary.honestyNote)}</p>

  <h2>Execution gates</h2>
  <table>
    <thead><tr><th></th><th>Gate</th><th>Proof</th><th>Detail</th><th>Command</th></tr></thead>
    <tbody>${gateRows}</tbody>
  </table>

  <h2>Week 1 day phases</h2>
  <table>
    <thead><tr><th></th><th>Phase</th><th>Detail</th><th>Smoke</th></tr></thead>
    <tbody>${phaseRows}</tbody>
  </table>

  <h2>Product surfaces</h2>
  <ul>${surfaces}</ul>

  <h2>Recommended commands</h2>
  <ol>${steps}</ol>
</body>
</html>`;
}
