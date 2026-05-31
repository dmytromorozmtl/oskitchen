import { APP_NAME } from "@/lib/constants";

export function emailShell(params: {
  title: string;
  bodyHtml: string;
  footer?: string;
}) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(params.title)}</title>
  </head>
  <body style="margin:0;font-family:Inter,system-ui,sans-serif;background:#f8fafc;color:#0f172a;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 8px 28px;font-size:20px;font-weight:600;color:#FF5F1F;">
                ${APP_NAME}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 28px 28px;font-size:15px;line-height:1.6;color:#334155;">
                ${params.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px 28px;font-size:12px;color:#94a3b8;">
                ${params.footer ?? `Sent by ${APP_NAME}`}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function orderConfirmationTemplate(params: {
  businessName?: string | null;
  customerName: string;
  orderId: string;
  total: string;
  itemsHtml: string;
  totalsHtml?: string;
  marketLabel?: string | null;
  lookupUrl?: string;
  fulfillmentLabel: string;
  fulfillmentDate?: string | null;
}) {
  const brand = params.businessName ?? APP_NAME;
  const marketLine = params.marketLabel
    ? `<p><strong>Market:</strong> ${escapeHtml(params.marketLabel)}</p>`
    : "";
  const body = `
    <p>Hi ${escapeHtml(params.customerName)},</p>
    <p>Thanks for your preorder with <strong>${escapeHtml(brand)}</strong>. Here is your confirmation.</p>
    ${marketLine}
    ${params.totalsHtml ?? ""}
    <p style="margin-top:16px;"><strong>Order total:</strong> ${escapeHtml(params.total)}</p>
    <p><strong>Fulfillment:</strong> ${escapeHtml(params.fulfillmentLabel)}${
      params.fulfillmentDate
        ? ` · <strong>${escapeHtml(params.fulfillmentDate)}</strong>`
        : ""
    }</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
      <thead>
        <tr style="text-align:left;border-bottom:1px solid #e2e8f0;">
          <th style="padding:8px 0;">Item</th>
          <th style="padding:8px 0;">Qty</th>
        </tr>
      </thead>
      <tbody>${params.itemsHtml}</tbody>
    </table>
    ${
      params.lookupUrl
        ? `<p style="margin-top:20px;"><a href="${escapeHtml(params.lookupUrl)}" style="color:#FF5F1F;font-weight:600;">Track your order</a></p>`
        : ""
    }
    <p style="color:#94a3b8;font-size:12px;margin-top:24px;">Order ID: ${escapeHtml(params.orderId)}</p>
  `;
  return emailShell({ title: "Order confirmed", bodyHtml: body });
}

export function preorderReminderTemplate(params: {
  businessName?: string | null;
  customerName: string;
  deadline: string;
  ctaUrl: string;
}) {
  const brand = params.businessName ?? APP_NAME;
  const body = `
    <p>Hi ${escapeHtml(params.customerName)},</p>
    <p>Preorder for <strong>${escapeHtml(brand)}</strong> closes soon: <strong>${escapeHtml(params.deadline)}</strong>.</p>
    <p><a href="${escapeHtml(params.ctaUrl)}" style="color:#FF5F1F;font-weight:600;">View menus</a></p>
  `;
  return emailShell({ title: "Preorder reminder", bodyHtml: body });
}

export function pickupReminderTemplate(params: {
  businessName?: string | null;
  customerName: string;
  when: string;
  address?: string | null;
}) {
  const brand = params.businessName ?? APP_NAME;
  const body = `
    <p>Hi ${escapeHtml(params.customerName)},</p>
    <p>Pickup at <strong>${escapeHtml(brand)}</strong> is scheduled for <strong>${escapeHtml(params.when)}</strong>.</p>
    ${
      params.address
        ? `<p><strong>Pickup address:</strong><br/>${escapeHtml(params.address)}</p>`
        : ""
    }
  `;
  return emailShell({ title: "Pickup reminder", bodyHtml: body });
}

export function deliveryReminderTemplate(params: {
  businessName?: string | null;
  customerName: string;
  when: string;
}) {
  const brand = params.businessName ?? APP_NAME;
  const body = `
    <p>Hi ${escapeHtml(params.customerName)},</p>
    <p>Your delivery from <strong>${escapeHtml(brand)}</strong> is scheduled for <strong>${escapeHtml(params.when)}</strong>.</p>
  `;
  return emailShell({ title: "Delivery reminder", bodyHtml: body });
}

export function orderReadyTemplate(params: {
  businessName?: string | null;
  customerName: string;
  instructions: string;
}) {
  const brand = params.businessName ?? APP_NAME;
  const body = `
    <p>Hi ${escapeHtml(params.customerName)},</p>
    <p>Your order from <strong>${escapeHtml(brand)}</strong> is <strong>ready</strong>.</p>
    <p>${escapeHtml(params.instructions)}</p>
  `;
  return emailShell({ title: "Order ready", bodyHtml: body });
}
