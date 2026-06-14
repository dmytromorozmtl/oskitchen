import type { ApiScope } from "@/lib/developer/api-scopes";
import { API_SCOPES } from "@/lib/developer/api-scopes";

export function listDocumentedApiScopes(): readonly ApiScope[] {
  return API_SCOPES;
}
