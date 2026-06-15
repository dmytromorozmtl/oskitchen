import Link from "next/link";

import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Shown when dashboard layout loaders fail — avoids root global-error 500 for all tabs. */
export function DashboardLayoutFallback({ detail }: { detail?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="max-w-md shadow-sm">
        <CardHeader>
          <CardTitle>Dashboard temporarily unavailable</CardTitle>
          <CardDescription>
            We could not load your workspace shell. Your account may still be signed in — try again
            or sign out and back in.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {detail ? (
            <p className="rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
              {detail.slice(0, 280)}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full">
              <Link href="/dashboard/today">Try again</Link>
            </Button>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" className="rounded-full">
                Sign out
              </Button>
            </form>
          </div>
          <Button asChild variant="link" className="h-auto p-0 text-sm">
            <Link href="/help/getting-started">Help center</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
