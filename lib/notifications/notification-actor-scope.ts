import { requireUserProfile } from "@/lib/auth";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

import {
  resolveNotificationActorScope,
  type NotificationActorScope,
} from "@/lib/notifications/notification-permissions";

export async function getNotificationActorScope(): Promise<NotificationActorScope> {
  const actor = await requireWorkspacePermissionActor();
  const profile = await requireUserProfile();
  return resolveNotificationActorScope({
    userId: actor.userId,
    email: profile.email ?? actor.email ?? null,
    profileRole: profile.role ?? null,
    platformBypass: actor.platformBypass,
  });
}
