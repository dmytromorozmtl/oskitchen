import { Resend } from "resend";

import { APP_NAME, SITE_URL } from "@/lib/constants";
import { isResendConfigured } from "@/lib/env";
import {
  deliveryReminderTemplate,
  orderConfirmationTemplate,
  orderReadyTemplate,
  pickupReminderTemplate,
  preorderReminderTemplate,
} from "@/lib/email/templates";
import { storefrontTeamInviteTemplate } from "@/lib/email/templates/storefront-team-invite";
import { b2bInvoiceOverdueReminderTemplate } from "@/lib/email/templates/b2b-invoice-overdue-reminder";
import { b2bArOperatorDigestTemplate } from "@/lib/email/templates/b2b-ar-operator-digest";
import { logger } from "@/lib/logger";

const from =
  process.env.RESEND_FROM_EMAIL ?? "OS Kitchen <onboarding@resend.dev>";

export function isEmailConfigured() {
  return isResendConfigured();
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    logger.warn("RESEND_API_KEY missing — emails will be skipped.");
    return null;
  }
  return new Resend(key);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendOrderConfirmation(params: {
  to: string;
  customerName: string;
  orderId: string;
  total: string;
  lookupUrl?: string;
  businessName?: string | null;
  fulfillmentLabel: string;
  fulfillmentDate?: string | null;
  lines: { title: string; quantity: number }[];
  marketLabel?: string | null;
  totalsHtml?: string;
}) {
  const resend = getResend();
  if (!resend) return { skipped: true as const };

  const itemsHtml = params.lines
    .map(
      (l) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${escapeHtml(l.title)}</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${l.quantity}</td></tr>`,
    )
    .join("");

  const html = orderConfirmationTemplate({
    businessName: params.businessName,
    customerName: params.customerName,
    orderId: params.orderId,
    total: params.total,
    itemsHtml,
    totalsHtml: params.totalsHtml,
    marketLabel: params.marketLabel,
    lookupUrl: params.lookupUrl,
    fulfillmentLabel: params.fulfillmentLabel,
    fulfillmentDate: params.fulfillmentDate,
  });

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Your ${APP_NAME} order is confirmed`,
    html,
  });
  return { sent: true as const };
}

export async function sendPreorderReminder(params: {
  to: string;
  customerName: string;
  deadline: string;
  businessName?: string | null;
}) {
  const resend = getResend();
  if (!resend) return { skipped: true as const };
  const html = preorderReminderTemplate({
    businessName: params.businessName,
    customerName: params.customerName,
    deadline: params.deadline,
    ctaUrl: SITE_URL,
  });
  await resend.emails.send({
    from,
    to: params.to,
    subject: `Preorder closes soon — ${APP_NAME}`,
    html,
  });
  return { sent: true as const };
}

export async function sendPickupReminder(params: {
  to: string;
  customerName: string;
  when: string;
  address?: string | null;
  businessName?: string | null;
}) {
  const resend = getResend();
  if (!resend) return { skipped: true as const };
  const html = pickupReminderTemplate({
    businessName: params.businessName,
    customerName: params.customerName,
    when: params.when,
    address: params.address,
  });
  await resend.emails.send({
    from,
    to: params.to,
    subject: `Pickup reminder — ${APP_NAME}`,
    html,
  });
  return { sent: true as const };
}

export async function sendDeliveryReminder(params: {
  to: string;
  customerName: string;
  when: string;
  businessName?: string | null;
}) {
  const resend = getResend();
  if (!resend) return { skipped: true as const };
  const html = deliveryReminderTemplate({
    businessName: params.businessName,
    customerName: params.customerName,
    when: params.when,
  });
  await resend.emails.send({
    from,
    to: params.to,
    subject: `Delivery reminder — ${APP_NAME}`,
    html,
  });
  return { sent: true as const };
}

export async function sendOrderReady(params: {
  to: string;
  customerName: string;
  businessName?: string | null;
  instructions: string;
}) {
  const resend = getResend();
  if (!resend) return { skipped: true as const };
  const html = orderReadyTemplate({
    businessName: params.businessName,
    customerName: params.customerName,
    instructions: params.instructions,
  });
  await resend.emails.send({
    from,
    to: params.to,
    subject: `Your order is ready — ${APP_NAME}`,
    html,
  });
  return { sent: true as const };
}

export async function sendStorefrontTeamInviteEmail(params: {
  to: string;
  businessName: string;
  role: string;
  inviteToken: string;
  isReminder?: boolean;
}) {
  const resend = getResend();
  if (!resend) return { skipped: true as const };

  const acceptUrl = `${SITE_URL}/invite/${encodeURIComponent(params.inviteToken)}`;
  const html = storefrontTeamInviteTemplate({
    businessName: params.businessName,
    inviteeEmail: params.to,
    role: params.role,
    acceptUrl,
    isReminder: params.isReminder,
  });

  await resend.emails.send({
    from,
    to: params.to,
    subject: params.isReminder
      ? `Reminder: storefront team invitation on ${APP_NAME}`
      : `You're invited to manage a storefront on ${APP_NAME}`,
    html,
  });
  return { sent: true as const };
}

export async function sendB2bInvoiceOverdueReminder(params: {
  to: string;
  customerName: string;
  invoiceNumber: string;
  amountDue: string;
  dueDate: string;
  daysPastDue: number;
  poNumber?: string | null;
  companyName?: string | null;
  paymentTermsLabel?: string | null;
  businessName?: string | null;
}) {
  const resend = getResend();
  if (!resend) return { skipped: true as const };

  const html = b2bInvoiceOverdueReminderTemplate({
    businessName: params.businessName,
    customerName: params.customerName,
    invoiceNumber: params.invoiceNumber,
    amountDue: params.amountDue,
    dueDate: params.dueDate,
    daysPastDue: params.daysPastDue,
    poNumber: params.poNumber,
    companyName: params.companyName,
    paymentTermsLabel: params.paymentTermsLabel,
  });

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Invoice reminder — ${params.invoiceNumber}`,
    html,
  });
  return { sent: true as const };
}

export async function sendB2bArOperatorDigest(params: {
  to: string;
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
  const resend = getResend();
  if (!resend) return { skipped: true as const };

  const html = b2bArOperatorDigestTemplate({
    businessName: params.businessName,
    openTotal: params.openTotal,
    openAmountCents: params.openAmountCents,
    overdueTotal: params.overdueTotal,
    bucket0_30: params.bucket0_30,
    bucket31_60: params.bucket31_60,
    bucket61Plus: params.bucket61Plus,
    topOverdue: params.topOverdue,
    orderHubUrl: params.orderHubUrl,
  });

  await resend.emails.send({
    from,
    to: params.to,
    subject: `B2B receivables digest — ${params.openTotal} open invoice(s)`,
    html,
  });
  return { sent: true as const };
}

/** Plain-text ops / growth notifications (founder inbox). */
export async function sendRawEmail(params: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: { filename: string; content: string }[];
}) {
  const resend = getResend();
  if (!resend) return { skipped: true as const };
  await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject.slice(0, 200),
    text: params.text ?? params.subject,
    ...(params.html ? { html: params.html } : {}),
    ...(params.attachments?.length
      ? {
          attachments: params.attachments.map((a) => ({
            filename: a.filename,
            content: a.content,
          })),
        }
      : {}),
  });
  return { sent: true as const };
}
