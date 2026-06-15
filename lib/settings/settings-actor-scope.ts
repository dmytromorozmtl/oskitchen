import { hasSuperAdminRoleRow } from "@/lib/platform-super-bypass";

import type { SettingsActorScope } from "./settings-permissions";

export async function createSettingsActorScope(input: {
  sessionUserId: string;
  email: string | null;
  role: string | null;
}): Promise<SettingsActorScope> {
  return {
    userId: input.sessionUserId,
    email: input.email,
    role: input.role,
    platformBypass: await hasSuperAdminRoleRow(input.sessionUserId),
  };
}
