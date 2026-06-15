import {
  DEVELOPER_API_SCOPES,
  type DeveloperApiScope,
} from "@/lib/developer/api-scopes";

/** OAuth-style scopes exposed in consent UI — mapped to enterprise API scopes internally. */
export const PARTNER_OAUTH_SCOPES = [
  "read:orders",
  "write:orders",
  "read:products",
  "read:inventory",
  "manage:webhooks",
  "read:capital_attestation",
  "read:capital_referrals",
] as const;

export type PartnerOAuthScope = (typeof PARTNER_OAUTH_SCOPES)[number];

/** Scopes that must never appear in partner app manifests (PCI / PAN adjacent). */
export const PARTNER_OAUTH_FORBIDDEN_SCOPES = [
  "read:payments",
  "write:payments",
  "read:card_data",
] as const;

export const PARTNER_OAUTH_SCOPE_LABEL: Record<PartnerOAuthScope, string> = {
  "read:orders": "Read orders and statuses",
  "write:orders": "Create or update orders",
  "read:products": "Read catalog and menu items",
  "read:inventory": "Read inventory levels and sync metadata",
  "manage:webhooks": "Manage outbound webhook subscriptions",
  "read:capital_attestation": "Read signed revenue export for a financing referral",
  "read:capital_referrals": "Read financing referral status and metadata",
};

export const CAPITAL_OAUTH_SCOPES = [
  "read:capital_attestation",
  "read:capital_referrals",
] as const satisfies readonly PartnerOAuthScope[];

export type CapitalOAuthScope = (typeof CAPITAL_OAUTH_SCOPES)[number];

const CAPITAL_OAUTH_SCOPE_SET = new Set<string>(CAPITAL_OAUTH_SCOPES);

export function isCapitalOAuthScope(value: string): value is CapitalOAuthScope {
  return CAPITAL_OAUTH_SCOPE_SET.has(value);
}

export function partnerOAuthInstallationHasCapitalScope(
  grantedOAuthScopes: readonly PartnerOAuthScope[],
  required: CapitalOAuthScope,
): boolean {
  return grantedOAuthScopes.includes(required);
}

const OAUTH_SCOPE_SET = new Set<string>(PARTNER_OAUTH_SCOPES);

export function isPartnerOAuthScope(value: string): value is PartnerOAuthScope {
  return OAUTH_SCOPE_SET.has(value);
}

export function parsePartnerOAuthScopeList(raw: string | null | undefined): PartnerOAuthScope[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter(isPartnerOAuthScope);
}

export function validatePartnerOAuthScopes(scopes: string[]): string[] {
  const errors: string[] = [];
  if (scopes.length === 0) errors.push("At least one scope is required.");
  for (const scope of scopes) {
    if (!isPartnerOAuthScope(scope)) errors.push(`Unknown OAuth scope: ${scope}`);
    if ((PARTNER_OAUTH_FORBIDDEN_SCOPES as readonly string[]).includes(scope)) {
      errors.push(`Forbidden scope: ${scope}`);
    }
  }
  return errors;
}

export function intersectPartnerOAuthScopes(
  requested: PartnerOAuthScope[],
  allowed: PartnerOAuthScope[],
): PartnerOAuthScope[] {
  const allowedSet = new Set(allowed);
  return requested.filter((scope) => allowedSet.has(scope));
}

const OAUTH_TO_DEVELOPER: Record<PartnerOAuthScope, readonly DeveloperApiScope[]> = {
  "read:orders": ["orders:read"],
  "write:orders": ["orders:read", "orders:write"],
  "read:products": ["products:read", "menus:read"],
  "read:inventory": ["products:read", "integrations:read"],
  "manage:webhooks": ["integrations:read"],
  "read:capital_attestation": [],
  "read:capital_referrals": [],
};

export function partnerOAuthScopesToDeveloperScopes(
  oauthScopes: readonly PartnerOAuthScope[],
): DeveloperApiScope[] {
  const out = new Set<DeveloperApiScope>();
  for (const scope of oauthScopes) {
    for (const mapped of OAUTH_TO_DEVELOPER[scope] ?? []) {
      out.add(mapped);
    }
  }
  const scopes = [...out];
  return scopes.length > 0 ? scopes : [];
}

export function partnerOAuthInstallationHasDeveloperScope(
  grantedOAuthScopes: readonly PartnerOAuthScope[],
  required: DeveloperApiScope,
): boolean {
  const developerScopes = partnerOAuthScopesToDeveloperScopes(grantedOAuthScopes);
  if (developerScopes.length === 0) return DEVELOPER_API_SCOPES.includes(required);
  return developerScopes.includes(required);
}
