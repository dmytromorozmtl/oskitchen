import { recordDeveloperPingAction, validateEnvironmentNowAction } from "@/actions/developer-platform";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireDeveloperCenterAccess } from "@/lib/developer/developer-permissions";

export default async function DeveloperToolsPage() {
  const ctx = await requireDeveloperCenterAccess();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Internal tools</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Audited utilities — each invocation writes to the developer audit channel. Dangerous production operations stay
          founder-gated elsewhere in the product.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Validate environment</CardTitle>
            <CardDescription>Runs production gap detection and records an audit event.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={validateEnvironmentNowAction}>
              <Button type="submit" variant="secondary" className="rounded-full">
                Run validation
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mark diagnostics ping</CardTitle>
            <CardDescription>Lightweight audit heartbeat for break-glass drills.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={recordDeveloperPingAction}>
              <Button type="submit" variant="outline" className="rounded-full">
                Record ping
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Signed-in as {ctx.email ?? ctx.userId}
        {ctx.platformSuper ? " · platform superadmin" : ""}.
      </p>
    </div>
  );
}
