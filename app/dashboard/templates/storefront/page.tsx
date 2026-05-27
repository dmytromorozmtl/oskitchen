import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireTemplatesPageAccess } from "@/lib/templates/template-page-access";

export default async function StorefrontTemplatesPage() {
  const access = await requireTemplatesPageAccess("templates.view");
  if (!access.ok) return access.deny;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Storefront templates</h1>
        <p className="text-muted-foreground">
          Recommended storefront themes and layout defaults.
        </p>
      </div>
      <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Theme defaults ship with starters</CardTitle>
          <CardDescription>
            Apply a business starter to set recommended storefront defaults.
            Detailed theme management lives under Settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/dashboard/templates/starters">Browse starters</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/storefront">Open storefront settings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
