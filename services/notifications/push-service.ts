import webpush from "web-push";

import { prisma } from "@/lib/prisma";
import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";

export function isWebPushConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY?.trim() &&
      process.env.VAPID_PRIVATE_KEY?.trim() &&
      process.env.VAPID_SUBJECT?.trim(),
  );
}

function ensureVapid() {
  const publicKey = process.env.VAPID_PUBLIC_KEY!.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY!.trim();
  const subject = process.env.VAPID_SUBJECT!.trim();
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function savePushSubscription(
  userId: string,
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
) {
  return prisma.pushSubscription.upsert({
    where: { userId_endpoint: { userId, endpoint: sub.endpoint } },
    create: {
      userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    update: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
  });
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string },
): Promise<{ sent: number; failed: number }> {
  if (!isWebPushConfigured()) return { sent: 0, failed: 0 };
  ensureVapid();

  const pushScope = await resolveOwnerScopedWhere(userId);
  const subs = await prisma.pushSubscription.findMany({ where: pushScope });
  let sent = 0;
  let failed = 0;
  const data = JSON.stringify(payload);

  for (const s of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth },
        },
        data,
      );
      sent += 1;
    } catch {
      failed += 1;
    }
  }
  return { sent, failed };
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY?.trim() ?? null;
}
