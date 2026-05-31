import { emailShell } from "@/lib/email/templates";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function b2bInvoiceOverdueReminderTemplate(params: {
  businessName?: string | null;
  customerName: string;
  invoiceNumber: string;
  amountDue: string;
  dueDate: string;
  daysPastDue: number;
  poNumber?: string | null;
  companyName?: string | null;
  paymentTermsLabel?: string | null;
  businessName?: string | null;
  payNowUrl?: string | null;
}) {
  const brand = params.businessName ?? "OS Kitchen";
  const poLine = params.poNumber
    ? `<p><strong>Purchase order:</strong> ${escapeHtml(params.poNumber)}</p>`
    : "";
  const companyLine = params.companyName
    ? `<p><strong>Company:</strong> ${escapeHtml(params.companyName)}</p>`
    : "";
  const termsLine = params.paymentTermsLabel
    ? `<p><strong>Payment terms:</strong> ${escapeHtml(params.paymentTermsLabel)}</p>`
    : "";

  const body = `
    <p>Hi ${escapeHtml(params.customerName)},</p>
    <p>This is a friendly reminder from <strong>${escapeHtml(brand)}</strong> regarding an outstanding B2B invoice.</p>
    <div style="margin:20px 0;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
      <p style="margin:0 0 8px 0;"><strong>Invoice:</strong> ${escapeHtml(params.invoiceNumber)}</p>
      <p style="margin:0 0 8px 0;"><strong>Amount due:</strong> ${escapeHtml(params.amountDue)}</p>
      <p style="margin:0 0 8px 0;"><strong>Due date:</strong> ${escapeHtml(params.dueDate)}</p>
      <p style="margin:0;"><strong>Days past due:</strong> ${params.daysPastDue}</p>
    </div>
    ${companyLine}
    ${poLine}
    ${termsLine}
    ${
      params.payNowUrl
        ? `<p style="margin:20px 0;"><a href="${escapeHtml(params.payNowUrl)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#0f172a;color:#fff;text-decoration:none;font-weight:600;">Pay invoice online</a></p>`
        : ""
    }
    <p>Please arrange payment at your earliest convenience. If you have already sent payment, reply to this email with your remittance reference so we can reconcile your account.</p>
    <p style="margin-top:24px;color:#64748b;font-size:13px;">Thank you for your business.</p>
  `;

  return emailShell({
    title: `Invoice reminder — ${params.invoiceNumber}`,
    bodyHtml: body,
    footer: `Sent by ${brand}`,
  });
}
