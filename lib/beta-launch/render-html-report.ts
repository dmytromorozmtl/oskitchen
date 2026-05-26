import type { LaunchReport } from "@/lib/beta-launch/types";
import { LAUNCH_STEPS } from "@/lib/beta-launch/types";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const STATUS_COLOR: Record<string, string> = {
  pass: "#16a34a",
  fail: "#dc2626",
  skip: "#6b7280",
  manual: "#d97706",
};

export function renderLaunchReportHtml(report: LaunchReport): string {
  const rows: string[] = [];
  for (const [stepId, block] of Object.entries(report.steps)) {
    const meta = LAUNCH_STEPS[Number(stepId) as keyof typeof LAUNCH_STEPS];
    rows.push(`<section class="step"><h2>Step ${stepId}: ${esc(block.title)}</h2><p class="owner">${esc(meta.owner)}</p><table>`);
    rows.push("<thead><tr><th>Status</th><th>Gate</th><th>Detail</th></tr></thead><tbody>");
    for (const g of block.gates) {
      const color = STATUS_COLOR[g.status] ?? "#333";
      rows.push(
        `<tr><td style="color:${color};font-weight:600">${esc(g.status.toUpperCase())}</td><td>${esc(g.name)}</td><td>${esc(g.message)}</td></tr>`,
      );
    }
    rows.push("</tbody></table></section>");
  }

  const ready = report.summary.readyForBeta;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>KitchenOS Beta Launch Report</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1rem; color: #111; }
    h1 { font-size: 1.5rem; }
    .banner { padding: 1rem 1.25rem; border-radius: 8px; margin: 1.5rem 0; font-weight: 600; }
    .banner.ok { background: #dcfce7; color: #166534; }
    .banner.fail { background: #fee2e2; color: #991b1b; }
    .meta { color: #555; font-size: 0.9rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; font-size: 0.9rem; }
    th, td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; vertical-align: top; }
    th { background: #f9fafb; }
    .step { margin-bottom: 2rem; }
    .owner { color: #6b7280; margin-top: -0.5rem; }
  </style>
</head>
<body>
  <h1>KitchenOS Beta Launch Report</h1>
  <p class="meta">Generated ${esc(report.generatedAt)} · env ${esc(report.environment)}</p>
  <p class="meta">pass=${report.summary.pass} fail=${report.summary.fail} manual=${report.summary.manual} skip=${report.summary.skip}</p>
  <div class="banner ${ready ? "ok" : "fail"}">${ready ? "Ready for closed beta (automated gates)" : "Not ready — fix FAIL gates"}</div>
  ${rows.join("\n")}
</body>
</html>`;
}
