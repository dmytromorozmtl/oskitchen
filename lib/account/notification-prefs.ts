export type AccountNotificationPrefs = {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
};

export function readAccountNotificationPrefs(
  metadata: Record<string, unknown> | undefined,
): AccountNotificationPrefs {
  const raw = metadata?.notification_prefs;
  if (!raw || typeof raw !== "object") {
    return { emailEnabled: true, pushEnabled: true, smsEnabled: false };
  }
  const p = raw as Record<string, unknown>;
  return {
    emailEnabled: p.emailEnabled !== false,
    pushEnabled: p.pushEnabled !== false,
    smsEnabled: p.smsEnabled === true,
  };
}
