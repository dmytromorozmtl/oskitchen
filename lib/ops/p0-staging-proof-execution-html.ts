/**
 * HTML renderer for P0 staging proof execution report.
 */
import type { P0StagingProofExecutionSummary } from "@/lib/ops/p0-staging-proof-execution-orchestrator";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderP0StagingProofExecutionHtml(summary: P0StagingProofExecutionSummary): string {
  const phaseRows = summary.phases
    .map(
      (phase) => `
      <tr>
        <td class="${phase.complete ? "status-pass" : "status-blocked"}">${phase.complete ? "✓" : "✗"}</td>
        <td>${escapeHtml(phase.label)}</td>
        <td>${escapeHtml(phase.owner)}</td>
        <td>${escapeHtml(phase.proofStatus ?? "n/a")}</td>
        <td>${escapeHtml(phase.detail)}</td>
        <td>${phase.smokeScript ? `<code>npm run ${escapeHtml(phase.smokeScript)}</code>` : "—"}</td>
      </tr>`,
    )
    .join("");

  const steps = summary.recommendedCommands
    .map((cmd) => `<li><code>${escapeHtml(cmd)}</code></li>`)
    .join("");

  const health = summary.stagingHealth;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>OS Kitchen P0 Staging Proof Execution</title>
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
  <h1>P0 Staging Proof — Step 2 Execution</h1>
  <p class="honesty">Policy ${escapeHtml(summary.policyId)} · Generated ${escapeHtml(summary.generatedAt)}</p>

  <div class="banner ${summary.milestone === "proof_passed" ? "banner-pass" : "banner-blocked"}">
    <strong>Milestone:</strong> ${escapeHtml(summary.milestone)}<br />
    <strong>Vault ready:</strong> ${summary.vaultReady ? "YES" : "NO"}<br />
    <strong>P0 proof:</strong> ${escapeHtml(summary.p0ProofStatus ?? "missing")} (${escapeHtml(summary.p0Overall ?? "n/a")})<br />
    <strong>Integrity:</strong> ${summary.integrityPassed ? "PASS" : "FAIL"}<br />
    <strong>Staging health:</strong> ${
      health.checked
        ? health.ok
          ? `PASS ${escapeHtml(health.url ?? "")}`
          : `FAIL ${escapeHtml(health.error ?? "")}`
        : "SKIPPED"
    }
  </div>

  <p class="honesty">${escapeHtml(summary.honestyNote)}</p>

  <h2>Execution phases</h2>
  <table>
    <thead><tr><th></th><th>Phase</th><th>Owner</th><th>Proof</th><th>Detail</th><th>Smoke</th></tr></thead>
    <tbody>${phaseRows}</tbody>
  </table>

  <h2>Recommended commands</h2>
  <ol>${steps}</ol>
</body>
</html>`;
}
