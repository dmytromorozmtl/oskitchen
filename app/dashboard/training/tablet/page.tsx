import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";

export default async function TabletKioskPage() {
  await getTenantActor();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Tablet kiosk</h1>
        <Badge className="bg-emerald-100 text-emerald-700">Gloves-on optimized</Badge>
      </div>
      <p className="text-base text-muted-foreground">
        Mounted-tablet view for line cooks and packers. Large tap targets, minimal clicks, fullscreen-friendly.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Production drill</CardTitle>
            <CardDescription className="text-base">Timed prep practice on the production board.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="h-14 w-full text-lg">
              <Link href="/dashboard/training/kitchen">Start</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Packing race</CardTitle>
            <CardDescription className="text-base">Scan training and label verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="h-14 w-full text-lg">
              <Link href="/dashboard/training/packing">Start</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Simulations</CardTitle>
            <CardDescription className="text-base">Lunch rush, allergy incident, POS outage, more.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="h-14 w-full text-lg">
              <Link href="/dashboard/training/simulations">Open simulations</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">SOP library</CardTitle>
            <CardDescription className="text-base">Quick reference SOPs with acknowledgements.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="h-14 w-full text-lg">
              <Link href="/dashboard/training/sops">Open SOPs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
