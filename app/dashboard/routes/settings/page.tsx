import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getServerEnv } from "@/lib/env";

export default async function RoutesSettingsPage() {
  await getTenantActor();
  const env = getServerEnv();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Routes settings</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Integration flags. Per-tenant defaults will land here as the module grows.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Integrations</CardTitle>
          <CardDescription>External services OS Kitchen can use for maps and dispatch.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium text-foreground">Google Maps API key:</span>{" "}
            {env.GOOGLE_MAPS_API_KEY ? "configured (embedded maps enabled)" : "not configured (external links only)"}
          </p>
          <p>
            <span className="font-medium text-foreground">Uber Direct credentials:</span>{" "}
            {env.UBER_DIRECT_CLIENT_ID && env.UBER_DIRECT_CLIENT_SECRET
              ? "client present (live dispatch still a placeholder)"
              : "not configured"}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Safety defaults</CardTitle>
          <CardDescription>Always on for this module.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Routes never claim optimization — stop order is whatever you set manually.</p>
          <p>Uber Direct dispatch buttons are placeholders until partner credentials and live implementation are wired.</p>
          <p>Missing GOOGLE_MAPS_API_KEY never breaks the page — external links remain available.</p>
        </CardContent>
      </Card>
    </div>
  );
}
