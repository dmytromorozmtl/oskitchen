/**
 * HTML renderer for Tier 2 staging proof execution report.
 */
import type { Tier2StagingProofExecutionSummary } from "@/lib/ops/tier2-staging-proof-execution-orchestrator";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderTier2StagingProofExecutionHtml(
  summary: Tier2StagingProofExecutionSummary,
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
  <title>KitchenOS Tier 2 Staging Proof Execution</title>
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
  <h1>Tier 2 Staging Proof — Step 3 Execution</h1>
  <p class="honesty">Policy ${escapeHtml(summary.policyId)} · Generated ${escapeHtml(summary.generatedAt)}</p>

  <div class="banner ${summary.milestone === "proof_passed" ? "banner-pass" : "banner-blocked"}">
    <strong>Milestone:</strong> ${escapeHtml(summary.milestone)}<br />
    <strong>P0 proof:</strong> ${escapeHtml(summary.p0ProofStatus ?? "missing")} · P0 execution: ${escapeHtml(summary.p0ExecutionMilestone ?? "n/a")}<br />
    <strong>Tier 2 proof:</strong> ${escapeHtml(summary.tier2ProofStatus ?? "missing")} (${escapeHtml(summary.tier2Overall ?? "n/a")})<br />
    <strong>KDS Playwright:</strong> ${escapeHtml(summary.kdsPlaywrightProofStatus ?? "missing")}<br />
    <strong>P0 integrity:</strong> ${summary.p0IntegrityPassed ? "PASS" : "FAIL"} · <strong>Tier 2 integrity:</strong> ${summary.tier2IntegrityPassed ? "PASS" : "FAIL"}<br />
    <strong>GO/NO-GO:</strong> ${escapeHtml(summary.goDecision ?? "not evaluated")} (${summary.goBlockerCount} blockers)
  </div>

  <p class="honesty">${escapeHtml(summary.honestyNote)}</p>

  <h2>Execution gates</h2>
  <table>
    <thead><tr><th></th><th>Gate</th><th>Proof</th><th>Detail</th><th>Command</th></tr></thead>
    <tbody>${gateRows}</tbody>
  </table>

  <h2>Tier 2 golden path phases</h2>
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
