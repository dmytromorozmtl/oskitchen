import { acceptAllPendingInvitesForEmail } from "@/services/storefront/storefront-team-invite-service";

export type AcceptPendingInvitesResult = {
  accepted: number;
  workspaces: string[];
};

/** On signup/login — accept DB-backed invites for this email. */
export async function acceptPendingStorefrontInvitesForUser(
  userId: string,
  email: string,
): Promise<AcceptPendingInvitesResult> {
  return acceptAllPendingInvitesForEmail(userId, email);
}
