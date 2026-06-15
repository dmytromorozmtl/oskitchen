import { APP_NAME } from "@/lib/constants";

export function cartRecoveryEmailTemplate(input: {
  businessName: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  unsubscribeUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
    <tr><td style="padding:28px 28px 8px;">
      <p style="margin:0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;">${input.businessName}</p>
      <h1 style="margin:12px 0 0;font-size:22px;line-height:1.3;">${input.headline}</h1>
    </td></tr>
    <tr><td style="padding:8px 28px 20px;font-size:15px;line-height:1.6;color:#334155;">${input.body}</td></tr>
    <tr><td style="padding:0 28px 28px;">
      <a href="${input.ctaUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:15px;">${input.ctaLabel}</a>
    </td></tr>
    <tr><td style="padding:16px 28px 24px;border-top:1px solid #f1f5f9;font-size:12px;color:#94a3b8;line-height:1.5;">
      Sent via ${APP_NAME}. <a href="${input.unsubscribeUrl}" style="color:#64748b;">Unsubscribe</a> from cart reminders.
    </td></tr>
  </table>
</body>
</html>`;
}
