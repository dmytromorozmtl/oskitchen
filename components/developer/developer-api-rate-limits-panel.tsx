import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEVELOPER_API_OPENAPI_PATH,
  DEVELOPER_API_RATE_LIMITS_P2_75_POLICY_ID,
  DEVELOPER_API_SANDBOX_KEY_PREFIX,
} from "@/lib/developer/developer-api-rate-limits-p2-75-policy";
import { PUBLIC_API_RATE_LIMIT_DOC } from "@/lib/api-public/public-api-rate-limit";
import { DEVELOPER_API_SANDBOX_OPENAPI_URL } from "@/lib/developer/developer-api-sandbox-p2-75";

export function DeveloperApiRateLimitsPanel() {
  return (
    <Card
      data-testid="developer-api-rate-limits-panel"
      className="border-violet-500/30 bg-violet-500/5"
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Developer API — rate limits + OpenAPI + sandbox</CardTitle>
          <Badge className="rounded-full bg-violet-600 hover:bg-violet-600">LIVE</Badge>
        </div>
        <CardDescription>
          Per-API-key burst limiting, OpenAPI 3.0 spec, and sandbox keys for safe integration testing.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3 text-sm">
        <div
          className="rounded-lg border border-border/80 bg-background/80 p-3"
          data-testid="developer-api-rate-limits-per-key"
        >
          <p className="font-medium">Per-key limiting</p>
          <ul className="mt-2 list-inside list-disc text-muted-foreground">
            <li>Production burst: {PUBLIC_API_RATE_LIMIT_DOC.burstMax}/min</li>
            <li>Sandbox burst: 120/min (`kos_test_` keys)</li>
            <li>Headers: {PUBLIC_API_RATE_LIMIT_DOC.headers.join(", ")}</li>
          </ul>
        </div>
        <div
          className="rounded-lg border border-border/80 bg-background/80 p-3"
          data-testid="developer-api-rate-limits-openapi"
        >
          <p className="font-medium">OpenAPI spec</p>
          <ul className="mt-2 list-inside list-disc text-muted-foreground">
            <li>
              <a href={DEVELOPER_API_OPENAPI_PATH} className="text-primary hover:underline">
                {DEVELOPER_API_OPENAPI_PATH}
              </a>
            </li>
            <li>Public v1 routes with 429 responses</li>
            <li>Bearer API key security scheme</li>
          </ul>
        </div>
        <div
          className="rounded-lg border border-border/80 bg-background/80 p-3"
          data-testid="developer-api-rate-limits-sandbox"
        >
          <p className="font-medium">Sandbox</p>
          <ul className="mt-2 list-inside list-disc text-muted-foreground">
            <li>Prefix: `{DEVELOPER_API_SANDBOX_KEY_PREFIX}…`</li>
            <li>Create via API keys panel checkbox</li>
            <li>OpenAPI: {DEVELOPER_API_SANDBOX_OPENAPI_URL}</li>
          </ul>
        </div>
        <p className="sm:col-span-3 text-xs text-muted-foreground">
          Policy {DEVELOPER_API_RATE_LIMITS_P2_75_POLICY_ID} · Dual-bucket: key burst + per-route
          user+IP windows on `/api/public/v1/*`.
        </p>
      </CardContent>
    </Card>
  );
}
