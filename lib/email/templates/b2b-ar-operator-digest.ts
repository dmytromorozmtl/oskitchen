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

export function b2bArOperatorDigestTemplate(params: {
  businessName?: string | null;
  openTotal: number;
  openAmountCents: number;
  overdueTotal: number;
  bucket0_30: number;
  bucket31_60: number;
  bucket61Plus: number;
  topOverdue: Array<{
    invoiceNumber: string;
    companyName: string | null;
    daysPastDue: number;
    openAmountCents: number;
  }>;
  orderHubUrl: string;
}) {
  const brand = params.businessName ?? "OS Kitchen";
  const rowsHtml =
    params.topOverdue.length > 0
      ? `<table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:13px;">
      <thead>
        <tr style="text-align:left;border-bottom:1px solid #e2e8f0;">
          <th style="padding:8px 0;">Invoice</th>
          <th style="padding:8px 0;">Company</th>
          <th style="padding:8px 0;">Past due</th>
          <th style="padding:8px 0;text-align:right;">Open</th>
        </tr>
      </thead>
      <tbody>
        ${params.topOverdue
          .map(
            (row) => `<tr>
          <td style="padding:8px 0;font-family:monospace;">${escapeHtml(row.invoiceNumber)}</td>
          <td style="padding:8px 0;">${escapeHtml(row.companyName ?? "—")}</td>
          <td style="padding:8px 0;">${row.daysPastDue}d</td>
          <td style="padding:8px 0;text-align:right;">${escapeHtml(formatMoney(row.openAmountCents))}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`
      : `<p style="margin-top:12px;color:#64748b;">No overdue B2B invoices this week.</p>`;

  const body = `
    <p>Weekly B2B receivables digest for <strong>${escapeHtml(brand)}</strong>.</p>
    <div style="margin:20px 0;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
      <p style="margin:0 0 8px 0;"><strong>Open invoices:</strong> ${params.openTotal} · ${escapeHtml(formatMoney(params.openAmountCents))}</p>
      <p style="margin:0 0 8px 0;"><strong>Overdue:</strong> ${params.overdueTotal}</p>
      <p style="margin:0;"><strong>Aging:</strong> 0–30d ${params.bucket0_30} · 31–60d ${params.bucket31_60} · 61+d ${params.bucket61Plus}</p>
    </div>
    ${rowsHtml}
    <p style="margin-top:20px;">
      <a href="${escapeHtml(params.orderHubUrl)}" style="color:#FF5F1F;font-weight:600;">Open Order Hub →</a>
    </p>
  `;

  return emailShell({
    title: "B2B receivables weekly digest",
    bodyHtml: body,
    footer: `Sent by ${brand}`,
  });
}
