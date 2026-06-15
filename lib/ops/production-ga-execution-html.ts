/**
 * HTML renderer for production GA execution report.
 */
import type { ProductionGaExecutionSummary } from "@/lib/ops/production-ga-execution-orchestrator";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderProductionGaExecutionHtml(
  summary: ProductionGaExecutionSummary,
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
        <td>${escapeHtml(phase.label)}${phase.optional ? " (optional)" : ""}</td>
        <td>${escapeHtml(phase.detail)}</td>
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
  <title>OS Kitchen Production GA Execution</title>
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
  <h1>Production GA Readiness — Step 7 Execution</h1>
  <p class="honesty">Policy ${escapeHtml(summary.policyId)} · Generated ${escapeHtml(summary.generatedAt)}</p>

  <div class="banner ${summary.milestone === "production_ga_passed" ? "banner-pass" : "banner-blocked"}">
    <strong>Milestone:</strong> ${escapeHtml(summary.milestone)}<br />
    <strong>Scale expansion:</strong> ${escapeHtml(summary.scaleExpansionMilestone ?? "missing")}<br />
    <strong>GO:</strong> ${escapeHtml(summary.goDecision ?? "not evaluated")} · Customer: ${escapeHtml(summary.customerName ?? "not recorded")}<br />
    <strong>GA phases:</strong> ${summary.gaPhasesComplete ? "complete" : "in progress"} · P0: ${escapeHtml(summary.p0ProofStatus ?? "missing")} · Tier 2: ${escapeHtml(summary.tier2ProofStatus ?? "missing")}<br />
    <strong>Commercial inflection:</strong> ${escapeHtml(summary.commercialInflectionMilestone)} · score ${summary.pilotExecutableScore}/100
  </div>

  <p class="honesty">${escapeHtml(summary.honestyNote)}</p>

  <h2>Execution gates</h2>
  <table>
    <thead><tr><th></th><th>Gate</th><th>Proof</th><th>Detail</th><th>Command</th></tr></thead>
    <tbody>${gateRows}</tbody>
  </table>

  <h2>Production GA phases</h2>
  <table>
    <thead><tr><th></th><th>Phase</th><th>Detail</th></tr></thead>
    <tbody>${phaseRows}</tbody>
  </table>

  <h2>Recommended commands</h2>
  <ol>${steps}</ol>
</body>
</html>`;
}
