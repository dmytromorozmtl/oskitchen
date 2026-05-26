export const DEVELOPER_API_SCOPES = [
  "orders:read",
  "orders:write",
  "menus:read",
  "products:read",
  "customers:read",
  "integrations:read",
  "webhooks:receive",
] as const;

export type DeveloperApiScope = (typeof DEVELOPER_API_SCOPES)[number];

export const DEVELOPER_API_SCOPE_LABEL: Record<DeveloperApiScope, string> = {
  "orders:read": "Read orders and statuses",
  "orders:write": "Create or update orders (high risk)",
  "menus:read": "Read menus and availability windows",
  "products:read": "Read catalog / menu items",
  "customers:read": "Read CRM profiles and consent flags",
  "integrations:read": "Read integration metadata (no secrets)",
  "webhooks:receive": "Receive inbound webhook topics configured for the workspace",
};

/** Alias for enterprise documentation modules — keep in sync with `DEVELOPER_API_SCOPES`. */
export const API_SCOPES = DEVELOPER_API_SCOPES;
export type ApiScope = DeveloperApiScope;
