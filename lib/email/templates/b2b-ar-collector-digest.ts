import { emailShell } from "@/lib/email/templates";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function b2bArCollectorDigestTemplate(params: {
  businessName?: string | null;
  openCount: number;
  slaBreachedCount: number;
  tasksByAssignee: Array<{
    assignee: string;
    tasks: Array<{
      companyName: string;
      maxDaysPastDue: number;
      openAmountCents: number;
      slaBreached: boolean;
      priority: string;
    }>;
  }>;
  receivablesUrl: string;
}) {
  const brand = params.businessName ?? "OS Kitchen";
  const groupsHtml =
    params.tasksByAssignee.length > 0
      ? params.tasksByAssignee
          .map((group) => {
            const rows = group.tasks
              .map(
                (task) => `<tr>
          <td style="padding:8px 0;">${escapeHtml(task.companyName)}</td>
          <td style="padding:8px 0;">${task.maxDaysPastDue}d</td>
          <td style="padding:8px 0;">${escapeHtml(task.priority)}${task.slaBreached ? " · SLA breach" : ""}</td>
          <td style="padding:8px 0;text-align:right;">${escapeHtml(formatMoney(task.openAmountCents))}</td>
        </tr>`,
              )
              .join("");
            return `<div style="margin-top:16px;">
        <p style="margin:0 0 8px 0;font-weight:600;">${escapeHtml(group.assignee)}</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="text-align:left;border-bottom:1px solid #e2e8f0;">
              <th style="padding:8px 0;">Company</th>
              <th style="padding:8px 0;">Past due</th>
              <th style="padding:8px 0;">Priority</th>
              <th style="padding:8px 0;text-align:right;">Open</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
          })
          .join("")
      : `<p style="margin-top:12px;color:#64748b;">No open collector tasks.</p>`;

  const body = `
    <p>Daily B2B collector task digest for <strong>${escapeHtml(brand)}</strong>.</p>
    <div style="margin:20px 0;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
      <p style="margin:0 0 8px 0;"><strong>Open tasks:</strong> ${params.openCount}</p>
      <p style="margin:0;"><strong>SLA breached:</strong> ${params.slaBreachedCount}</p>
    </div>
    ${groupsHtml}
    <p style="margin-top:20px;">
      <a href="${escapeHtml(params.receivablesUrl)}" style="color:#FF5F1F;font-weight:600;">Open receivables dashboard →</a>
    </p>
  `;

  return emailShell({
    title: "B2B collector task digest",
    bodyHtml: body,
    footer: `Sent by ${brand}`,
  });
}
