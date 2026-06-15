export type ApiRouteClass =
  | "dashboard_session"
  | "platform_internal"
  | "public_api_key"
  | "storefront_public"
  | "webhook_signed"
  | "cron_secret"
  | "health"
  | "invite";

export type ApiAuthStrategy =
  | "middleware_session"
  | "handler_session"
  | "handler_api_key"
  | "handler_signed"
  | "handler_secret"
  | "public";

export type ApiRoutePolicy = {
  routeClass: ApiRouteClass;
  authStrategy: ApiAuthStrategy;
};

const EXACT_ROUTE_POLICIES: Record<string, ApiRoutePolicy> = {
  "/api/health": { routeClass: "health", authStrategy: "public" },
  "/api/openapi.json": { routeClass: "health", authStrategy: "public" },
  "/api/docs": { routeClass: "health", authStrategy: "public" },
  "/api/checkout": {
    routeClass: "dashboard_session",
    authStrategy: "handler_session",
  },
  "/api/billing-portal": {
    routeClass: "dashboard_session",
    authStrategy: "handler_session",
  },
};

const TOP_LEVEL_ROUTE_POLICIES: Record<string, ApiRoutePolicy> = {
  accounting: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  billing: { routeClass: "dashboard_session", authStrategy: "handler_session" },
  compliance: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  costing: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  cron: { routeClass: "cron_secret", authStrategy: "handler_secret" },
  dashboard: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  delivery: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  docs: { routeClass: "health", authStrategy: "public" },
  export: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  "gift-cards": {
    routeClass: "dashboard_session",
    authStrategy: "middleware_session",
  },
  growth: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  health: { routeClass: "health", authStrategy: "public" },
  "import-center": {
    routeClass: "dashboard_session",
    authStrategy: "middleware_session",
  },
  "import-export": {
    routeClass: "dashboard_session",
    authStrategy: "middleware_session",
  },
  "import-templates": {
    routeClass: "dashboard_session",
    authStrategy: "middleware_session",
  },
  inngest: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  integrations: {
    routeClass: "dashboard_session",
    authStrategy: "middleware_session",
  },
  internal: { routeClass: "platform_internal", authStrategy: "middleware_session" },
  invite: { routeClass: "invite", authStrategy: "public" },
  iot: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  labor: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  leads: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  loyalty: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  notifications: {
    routeClass: "dashboard_session",
    authStrategy: "middleware_session",
  },
  nps: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  "openapi.json": { routeClass: "health", authStrategy: "public" },
  pos: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  printing: { routeClass: "dashboard_session", authStrategy: "middleware_session" },
  public: { routeClass: "public_api_key", authStrategy: "handler_api_key" },
  purchasing: {
    routeClass: "dashboard_session",
    authStrategy: "middleware_session",
  },
  storefront: { routeClass: "storefront_public", authStrategy: "public" },
  webhooks: { routeClass: "webhook_signed", authStrategy: "handler_signed" },
};

export function getApiRoutePolicy(pathname: string): ApiRoutePolicy | null {
  if (!pathname.startsWith("/api")) return null;
  if (EXACT_ROUTE_POLICIES[pathname]) return EXACT_ROUTE_POLICIES[pathname];

  const parts = pathname.split("/").filter(Boolean);
  const topLevel = parts[1];
  if (!topLevel) return null;
  return TOP_LEVEL_ROUTE_POLICIES[topLevel] ?? null;
}

export function isApiRouteExemptFromMiddleware(pathname: string): boolean {
  const policy = getApiRoutePolicy(pathname);
  if (!policy) return false;
  return policy.authStrategy !== "middleware_session";
}

export function routeUsesDashboardSession(pathname: string): boolean {
  const policy = getApiRoutePolicy(pathname);
  if (!policy) return false;
  return (
    policy.routeClass === "dashboard_session" ||
    policy.routeClass === "platform_internal"
  );
}
