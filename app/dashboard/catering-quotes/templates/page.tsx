import { createCateringTemplateFormAction } from "@/actions/catering-quotes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { BUILT_IN_CATERING_TEMPLATES } from "@/lib/catering/quote-templates";
import { CATERING_EVENT_TYPE_LABEL, CATERING_SERVICE_STYLE_LABEL } from "@/lib/catering/quote-types";
import { prisma } from "@/lib/prisma";

export default async function TemplatesPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const templates = await prisma.cateringQuoteTemplate.findMany({
    where: { userId: dataUserId, active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quote templates</h1>
        <p className="text-muted-foreground">
          Reuse built-in catering templates or save your own — applied during the new quote wizard.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Built-in templates</CardTitle>
          <CardDescription>Tap “Save to workspace” to keep a copy you can edit later.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {BUILT_IN_CATERING_TEMPLATES.map((t) => (
            <div key={t.key} className="rounded-xl border border-border/70 bg-background p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {CATERING_EVENT_TYPE_LABEL[t.eventType]}
                    </Badge>
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {CATERING_SERVICE_STYLE_LABEL[t.serviceStyle]}
                    </Badge>
                  </div>
                </div>
                <form action={createCateringTemplateFormAction}>
                  <input type="hidden" name="name" value={t.name} />
                  <input type="hidden" name="builtInKey" value={t.key} />
                  <input type="hidden" name="description" value={t.description} />
                  <Button type="submit" size="sm" variant="outline" className="rounded-full">
                    Save to workspace
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Saved templates ({templates.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved templates yet. Save a built-in or add your own below.
            </p>
          ) : null}
          {templates.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {CATERING_EVENT_TYPE_LABEL[t.eventType]} · {CATERING_SERVICE_STYLE_LABEL[t.serviceStyle]}
                </p>
              </div>
              {t.builtInKey ? (
                <Badge variant="outline" className="rounded-full text-[10px]">{t.builtInKey}</Badge>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Add a custom template</CardTitle>
          <CardDescription>Save your own catering proposal as a reusable template.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCateringTemplateFormAction} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" maxLength={4000} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="rounded-full">Save template</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
