/**
 * HTML renderer for vault readiness report — human ops sign-off view.
 */
import type { VaultReadinessReport } from "@/lib/ops/vault-readiness-report";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusClass(ok: boolean): string {
  return ok ? "status-pass" : "status-blocked";
}

export function renderVaultReadinessHtml(report: VaultReadinessReport): string {
  const secretRows = report.secrets
    .map(
      (row) => `
      <tr>
        <td class="${statusClass(row.present)}">${row.present ? "✓" : "✗"}</td>
        <td><code>${escapeHtml(row.key)}</code></td>
        <td>${escapeHtml(row.owner)}</td>
        <td>${escapeHtml(row.description)}</td>
        <td>${escapeHtml(row.childSmokes.join(", "))}</td>
        <td><a href="${escapeHtml(row.docPath)}">${escapeHtml(row.docPath)}</a></td>
      </tr>`,
    )
    .join("");

  const phaseRows = report.phases
    .map(
      (phase) => `
      <tr>
        <td class="${statusClass(phase.complete)}">${phase.complete ? "✓" : "✗"}</td>
        <td>${escapeHtml(phase.label)}</td>
        <td>${escapeHtml(phase.missingKeys.join(", ") || "—")}</td>
        <td>${escapeHtml(phase.smokeScripts.join(", "))}</td>
      </tr>`,
    )
    .join("");

  const childRows = report.childSmokes
    .map(
      (child) => `
      <tr>
        <td>${escapeHtml(child.id)}</td>
        <td><code>${escapeHtml(child.smokeScript)}</code></td>
        <td>${escapeHtml(child.overall ?? "missing")}</td>
        <td>${escapeHtml(child.proofStatus ?? "n/a")}</td>
        <td>${escapeHtml(child.missingEnvVars.join(", ") || "—")}</td>
      </tr>`,
    )
    .join("");

  const steps = report.recommendedNextSteps
    .map((step) => `<li><code>${escapeHtml(step)}</code></li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>OS Kitchen Vault Readiness Report</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #111; line-height: 1.5; }
    h1, h2 { margin-bottom: 0.5rem; }
    .meta { color: #555; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .banner { padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; }
    .banner-blocked { background: #fff7ed; border: 1px solid #fdba74; }
    .banner-ready { background: #ecfdf5; border: 1px solid #6ee7b7; }
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
  <h1>OS Kitchen — Ops Vault Readiness</h1>
  <p class="meta">Generated ${escapeHtml(report.generatedAt)} · Policy ${escapeHtml(report.policyId)}</p>

  <div class="banner ${report.vaultReady ? "banner-ready" : "banner-blocked"}">
    <strong>Vault ready:</strong> ${report.vaultReady ? "YES" : "NO"}
    (${report.presentCount}/${report.totalCount} secrets present)<br />
    <strong>Day 0 milestone:</strong> ${escapeHtml(report.day0Milestone)}<br />
    <strong>P0 proof:</strong> ${escapeHtml(report.p0ProofStatus ?? "missing")}
    (aggregate ${escapeHtml(report.p0ArtifactOverall ?? "n/a")})
  </div>

  <p class="honesty">${escapeHtml(report.honestyNote)}</p>

  <h2>Secrets matrix</h2>
  <table>
    <thead><tr><th></th><th>Variable</th><th>Owner</th><th>Purpose</th><th>Child smokes</th><th>Doc</th></tr></thead>
    <tbody>${secretRows}</tbody>
  </table>

  <h2>Ops phases</h2>
  <table>
    <thead><tr><th></th><th>Phase</th><th>Missing</th><th>Smoke scripts</th></tr></thead>
    <tbody>${phaseRows}</tbody>
  </table>

  <h2>P0 child smokes (artifact truth)</h2>
  <table>
    <thead><tr><th>Child</th><th>Script</th><th>Overall</th><th>Proof</th><th>Missing env</th></tr></thead>
    <tbody>${childRows}</tbody>
  </table>

  <h2>Recommended next steps</h2>
  <ol>${steps}</ol>

  <p class="honesty">Canonical matrix: ${escapeHtml(report.vaultMatrixDoc)} · Checklist: ${escapeHtml(report.opsChecklistDoc)}</p>
</body>
</html>`;
}
