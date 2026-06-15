import { APP_NAME, SITE_URL } from "@/lib/constants";

export function storefrontTeamInviteTemplate(params: {
  businessName: string;
  inviteeEmail: string;
  role: string;
  acceptUrl: string;
  isReminder?: boolean;
}) {
  const biz = params.businessName.trim() || APP_NAME;
  const headline = params.isReminder
    ? `Reminder: your invitation to ${biz}`
    : `You're invited to ${biz}`;
  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a;max-width:560px;margin:0 auto;padding:24px">
  <h1 style="font-size:20px;margin:0 0 16px">${headline}</h1>
  <p>Someone invited <strong>${params.inviteeEmail}</strong> to help manage their storefront on ${APP_NAME} as <strong>${params.role}</strong>.</p>
  <p>Click below to accept — you'll sign in or create an account with this email:</p>
  <p style="margin:24px 0">
    <a href="${params.acceptUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600">Accept invitation</a>
  </p>
  <p style="font-size:13px;color:#64748b">If you did not expect this email, you can ignore it. This link expires in 30 days.</p>
  <p style="font-size:12px;color:#94a3b8;margin-top:32px">${APP_NAME} · ${SITE_URL}</p>
</body>
</html>`;
}
