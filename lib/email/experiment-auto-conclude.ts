import { APP_NAME, SITE_URL } from "@/lib/constants";
import { isEmailConfigured, sendRawEmail } from "@/lib/email";

export async function sendExperimentAutoConcludeScheduledEmail(input: {
  to: string;
  storeName: string;
  storeSlug: string;
  scheduledAt: string;
  liftPp: number;
}) {
  if (!isEmailConfigured()) return { skipped: true as const };

  const when = new Date(input.scheduledAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const html = `
    <p>Your theme experiment for <strong>${input.storeName}</strong> (<code>${input.storeSlug}</code>) passed all auto-conclude gates.</p>
    <p>Draft lift: <strong>+${input.liftPp} pp</strong>. Scheduled publish + conclude at <strong>${when}</strong> unless you intervene.</p>
    <p><a href="${SITE_URL}/dashboard/storefront/advanced">Review on Advanced</a> ·
    <a href="${SITE_URL}/dashboard/storefront/settings/experiments">Experiment settings</a></p>
    <p class="text-muted">Disable auto-conclude under Settings → Experiments if you want to decide manually.</p>
  `;

  await sendRawEmail({
    to: input.to,
    subject: `${APP_NAME} — experiment auto-conclude scheduled (${input.storeSlug})`,
    html,
  });
  return { sent: true as const };
}

export async function sendExperimentAutoConcludeApprovalEmail(input: {
  to: string;
  storeName: string;
  storeSlug: string;
  liftPp: number;
  approveUrl: string;
  rejectUrl: string;
}) {
  if (!isEmailConfigured()) return { skipped: true as const };

  const html = `
    <p>Auto-conclude is ready for <strong>${input.storeName}</strong> (<code>${input.storeSlug}</code>).</p>
    <p>Draft lift: <strong>+${input.liftPp} pp</strong>. Approve to publish the winner, or reject to keep the experiment scheduled off.</p>
    <p>
      <a href="${input.approveUrl}" style="display:inline-block;padding:10px 16px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;">Approve &amp; apply winner</a>
      &nbsp;
      <a href="${input.rejectUrl}" style="display:inline-block;padding:10px 16px;background:#64748b;color:#fff;text-decoration:none;border-radius:6px;">Reject</a>
    </p>
    <p class="text-muted">Links expire when used. You can also review on <a href="${SITE_URL}/dashboard/storefront/advanced">Advanced</a>.</p>
  `;

  await sendRawEmail({
    to: input.to,
    subject: `${APP_NAME} — approve experiment auto-conclude (${input.storeSlug})`,
    html,
  });
  return { sent: true as const };
}

export async function sendExperimentAutoConcludeExecutedEmail(input: {
  to: string;
  storeName: string;
  storeSlug: string;
  liftPp: number;
}) {
  if (!isEmailConfigured()) return { skipped: true as const };

  const html = `
    <p>Auto-conclude completed for <strong>${input.storeName}</strong> (<code>${input.storeSlug}</code>).</p>
    <p>Draft theme was published and the experiment was disabled (lift +${input.liftPp} pp).</p>
    <p><a href="${SITE_URL}/dashboard/storefront/theme">Open Theme</a> ·
    <a href="${SITE_URL}/dashboard/storefront/advanced">Advanced metrics</a></p>
  `;

  await sendRawEmail({
    to: input.to,
    subject: `${APP_NAME} — experiment winner applied automatically (${input.storeSlug})`,
    html,
  });
  return { sent: true as const };
}
