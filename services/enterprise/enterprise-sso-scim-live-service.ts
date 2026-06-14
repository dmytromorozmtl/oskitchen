import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildEnterpriseSsoScimLiveDashboard } from "@/lib/enterprise/enterprise-sso-scim-live-builders";
import { getWorkspaceSsoAdminView } from "@/lib/enterprise/workspace-sso-admin-service";
import { getWorkspaceScimAdminView } from "@/lib/enterprise/workspace-scim-admin-service";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";

export type { EnterpriseSsoScimLiveDashboard } from "@/lib/enterprise/enterprise-sso-scim-live-types";

const SSO_SMOKE_ARTIFACT = join(
  process.cwd(),
  "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
);

function readWiringCertPassed(): boolean {
  try {
    const raw = readFileSync(SSO_SMOKE_ARTIFACT, "utf8");
    const parsed = JSON.parse(raw) as { wiringCertPassed?: boolean };
    return parsed.wiringCertPassed === true;
  } catch {
    return false;
  }
}

export async function loadEnterpriseSsoScimLiveDashboard(workspaceId: string) {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const [sso, scim] = await Promise.all([
    getWorkspaceSsoAdminView({ workspaceId, ownerUserId }),
    getWorkspaceScimAdminView({ workspaceId, ownerUserId }),
  ]);

  return buildEnterpriseSsoScimLiveDashboard({
    workspaceId,
    ssoEntitlementEnabled: sso.ssoEntitlementEnabled,
    ssoActive: sso.active,
    ssoConfigured: sso.configured,
    activeIdpVendor: sso.settings?.idpVendor ?? null,
    scimEnabled: scim.active,
    scimPhase: scim.pilotPhase,
    scimTokenConfigured: scim.tokenConfigured,
    provisionedUserCount: scim.provisionedUserCount,
    wiringCertPassed: readWiringCertPassed(),
    scimApiRoutesLive: true,
  });
}
