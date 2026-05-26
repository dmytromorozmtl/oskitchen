import { z } from "zod";
export const storefrontPendingInviteSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().max(255),
  role: z.enum(["STAFF", "ADMIN"]).default("STAFF"),
  invitedAt: z.string().datetime(),
  invitedByUserId: z.string().uuid(),
});

export type StorefrontPendingInvite = z.infer<typeof storefrontPendingInviteSchema>;

const pendingArraySchema = z.array(storefrontPendingInviteSchema);

export function parseStorefrontPendingInvites(settingsCenterJson: unknown): StorefrontPendingInvite[] {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") return [];
  const sf = (settingsCenterJson as Record<string, unknown>).storefront;
  if (!sf || typeof sf !== "object") return [];
  const raw = (sf as Record<string, unknown>).pendingInvites;
  const parsed = pendingArraySchema.safeParse(raw);
  return parsed.success ? parsed.data : [];
}

export function mergePendingInvites(
  settingsCenterJson: unknown,
  invites: StorefrontPendingInvite[],
): Record<string, unknown> {
  const center =
    settingsCenterJson && typeof settingsCenterJson === "object"
      ? { ...(settingsCenterJson as Record<string, unknown>) }
      : {};
  const sfBlock =
    center.storefront && typeof center.storefront === "object"
      ? { ...(center.storefront as Record<string, unknown>) }
      : {};
  sfBlock.pendingInvites = invites;
  center.storefront = sfBlock;
  return center;
}
