import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readLocationContext } from "@/lib/locations/location-context";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export default async function LocationsSettingsPage() {
  const actor = await requireWorkspacePermissionActor();
  const ctx = await readLocationContext();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Locations settings</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Workspace-wide preferences for how the Location Management Center behaves.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Switcher</CardTitle>
          <CardDescription>The currently selected location, persisted in a cookie per user.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            Mode:{" "}
            <Badge variant="outline" className="rounded-full">
              {ctx.mode === "all" ? "All locations" : `Single (${ctx.locationId.slice(0, 8)}…)`}
            </Badge>
          </p>
          <p className="text-muted-foreground">
            Change the active location from the switcher in the locations sidebar; pages across Orders, Menus,
            Production, Packing, Routes, Tasks, Inventory, Purchasing, and Reports can read the same context via
            <code>readLocationContext()</code>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Signed in as <strong>{actor.email ?? "(no email)"}</strong></p>
          <p>
            Superadmin override:{" "}
            <Badge variant={actor.platformBypass ? "default" : "outline"} className="rounded-full">
              {actor.platformBypass ? "enabled" : "disabled"}
            </Badge>
          </p>
          <p className="text-muted-foreground">
            Owners see every location. Managers can edit assigned locations; staff and drivers read scoped data only.
            Per-user location scopes graduate when WorkspaceMember.role lands.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data safety</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc pl-5 text-muted-foreground">
            <li>Existing rows with <code>locationId = null</code> continue to work — assignment is opt-in.</li>
            <li>Archiving a location preserves its history; you can unarchive at any time.</li>
            <li>Every bulk assignment is recorded in <code>location_assignment_events</code> with the prior location.</li>
          </ul>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/locations/assignment">Open assignment tools</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
