/**
 * HTML renderer for sustained product evolution execution report.
 */
import type { SustainedProductEvolutionExecutionSummary } from "@/lib/ops/sustained-product-evolution-execution-orchestrator";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderSustainedProductEvolutionExecutionHtml(
  summary: SustainedProductEvolutionExecutionSummary,
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

  const trackRows = summary.tracks
    .map(
      (track) => `
      <tr>
        <td class="${track.status === "healthy" || track.status === "guidance" ? "status-pass" : "status-blocked"}">${escapeHtml(track.status)}</td>
        <td>${escapeHtml(track.label)}</td>
        <td>${escapeHtml(track.ownerRole)}</td>
        <td>${escapeHtml(track.detail)}</td>
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
  <title>OS Kitchen Sustained Product Evolution Execution</title>
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
  <h1>Sustained Product Evolution — Step 11 Execution</h1>
  <p class="honesty">Policy ${escapeHtml(summary.policyId)} · Generated ${escapeHtml(summary.generatedAt)}</p>

  <div class="banner ${summary.milestone === "sustained_product_evolution_passed" ? "banner-pass" : "banner-blocked"}">
    <strong>Milestone:</strong> ${escapeHtml(summary.milestone)}<br />
    <strong>Sustained ops:</strong> ${escapeHtml(summary.sustainedOpsExecutionMilestone ?? "missing")}<br />
    <strong>GO:</strong> ${escapeHtml(summary.goDecision ?? "not evaluated")} · Customer: ${escapeHtml(summary.customerName ?? "not recorded")}<br />
    <strong>Tracks:</strong> ${summary.tracksHealthy ? "healthy" : `${summary.overdueCount} overdue`} · Improvement loop: ${summary.continuousImprovementLoopActive ? "active" : "blocked"}<br />
    <strong>Commercial inflection:</strong> ${escapeHtml(summary.commercialInflectionMilestone)} · score ${summary.pilotExecutableScore}/100
  </div>

  <p class="honesty">${escapeHtml(summary.honestyNote)}</p>

  <h2>Execution gates</h2>
  <table>
    <thead><tr><th></th><th>Gate</th><th>Proof</th><th>Detail</th><th>Command</th></tr></thead>
    <tbody>${gateRows}</tbody>
  </table>

  <h2>Product evolution tracks (6)</h2>
  <table>
    <thead><tr><th>Status</th><th>Track</th><th>Owner</th><th>Detail</th></tr></thead>
    <tbody>${trackRows}</tbody>
  </table>

  <h2>Recommended commands</h2>
  <ul>${steps}</ul>
</body>
</html>`;
}
