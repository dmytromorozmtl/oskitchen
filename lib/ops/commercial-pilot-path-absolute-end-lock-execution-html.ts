/**
 * HTML renderer for commercial pilot path absolute end lock execution report.
 */
import type { CommercialPilotPathAbsoluteEndLockExecutionSummary } from "@/lib/ops/commercial-pilot-path-absolute-end-lock-execution-orchestrator";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderCommercialPilotPathAbsoluteEndLockExecutionHtml(
  summary: CommercialPilotPathAbsoluteEndLockExecutionSummary,
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

  const layerRows = summary.pathLayers
    .map(
      (layer) => `
      <tr>
        <td>S${layer.step}</td>
        <td>${escapeHtml(layer.label)}</td>
        <td><code>${escapeHtml(layer.policyId)}</code></td>
        <td>${escapeHtml(layer.role)}</td>
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
  <title>OS Kitchen Commercial Pilot Path Absolute End Lock</title>
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
  <h1>Commercial Pilot Path Absolute End Lock — Step 16</h1>
  <p class="honesty">Policy ${escapeHtml(summary.policyId)} · Generated ${escapeHtml(summary.generatedAt)}</p>

  <div class="banner ${summary.milestone === "commercial_pilot_path_absolute_end_lock_passed" ? "banner-pass" : "banner-blocked"}">
    <strong>Milestone:</strong> ${escapeHtml(summary.milestone)}<br />
    <strong>Steady-state loop lock:</strong> ${escapeHtml(summary.steadyStateOperatorLoopLockMilestone ?? "missing")}<br />
    <strong>Absolute end:</strong> ${escapeHtml(summary.absoluteEndMilestone)} · path ${summary.completedSteps}/${summary.totalSteps}<br />
    <strong>GO:</strong> ${escapeHtml(summary.goDecision ?? "not evaluated")} · Customer: ${escapeHtml(summary.customerName ?? "not recorded")}<br />
    <strong>Report:</strong> ${summary.absoluteEndReportPresent ? "present" : "missing"} · engineering closed: ${summary.pathEngineeringClosed ? "yes" : "no"}<br />
    <strong>Commercial inflection:</strong> ${escapeHtml(summary.commercialInflectionMilestone)} · score ${summary.pilotExecutableScore}/100
  </div>

  <p class="honesty">${escapeHtml(summary.honestyNote)}</p>

  <h2>Execution gates</h2>
  <table>
    <thead><tr><th></th><th>Gate</th><th>Proof</th><th>Detail</th><th>Command</th></tr></thead>
    <tbody>${gateRows}</tbody>
  </table>

  <h2>Path absolute end layers</h2>
  <table>
    <thead><tr><th>Step</th><th>Layer</th><th>Policy</th><th>Role</th></tr></thead>
    <tbody>${layerRows}</tbody>
  </table>

  <h2>Recommended commands</h2>
  <ul>${steps}</ul>
</body>
</html>`;
}
