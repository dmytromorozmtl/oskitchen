import {
  DEVELOPER_API_SCOPES,
  type DeveloperApiScope,
} from "@/lib/developer/api-scopes";

const SCOPE_SET = new Set<string>(DEVELOPER_API_SCOPES);

export function isDeveloperApiScope(value: unknown): value is DeveloperApiScope {
  return typeof value === "string" && SCOPE_SET.has(value);
}

/** Null or empty scopesJson grants all documented scopes for backward compatibility. */
export function parseApiKeyScopesJson(
  raw: string | null | undefined,
): readonly DeveloperApiScope[] {
  if (!raw?.trim()) return DEVELOPER_API_SCOPES;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEVELOPER_API_SCOPES;
    const scopes = parsed.filter(isDeveloperApiScope);
    return scopes.length > 0 ? scopes : DEVELOPER_API_SCOPES;
  } catch {
    return DEVELOPER_API_SCOPES;
  }
}

export function serializeApiKeyScopes(
  scopes: readonly DeveloperApiScope[],
): string {
  return JSON.stringify([...scopes]);
}

export function apiKeyHasScope(
  grantedScopes: readonly DeveloperApiScope[],
  requiredScope: DeveloperApiScope,
): boolean {
  return grantedScopes.includes(requiredScope);
}
