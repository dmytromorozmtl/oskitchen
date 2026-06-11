import Link from "next/link";
import { notFound } from "next/navigation";

import { upsertAllergenProfileFormAction } from "@/actions/allergen-profile";
import { upsertIngredientDeclarationFormAction } from "@/actions/ingredient-declaration";
import { createPrintedLabelJobFormAction } from "@/actions/label-print-queue";
import {
  setNutritionVerificationStatusFormAction,
  verifyAllergenProfileFormAction,
  verifyIngredientDeclarationFormAction,
  verifyNutritionProfileFormAction,
} from "@/actions/nutrition-label-verification";
import { upsertNutritionProfileFormAction } from "@/actions/nutrition-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { displayAllergenKey } from "@/lib/nutrition/allergen-registry";
import { LABEL_DATA_DISCLAIMER } from "@/lib/nutrition/label-disclaimers";
import { printedLabelListWhereForOwnerAnd } from "@/lib/scope/workspace-printed-label-scope";
import { productByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { LabelDataSourceType } from "@prisma/client";

function asStrArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

export default async function NutritionLabelItemPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const { dataUserId } = await getTenantActor();

  const product = await prisma.product.findFirst({
    where: await productByIdWhereForOwner(dataUserId, productId),
    include: {
      nutritionProfile: true,
      allergenProfile: true,
      ingredientDeclaration: true,
      menu: { select: { title: true } },
    },
  });
  if (!product) notFound();

  const templates = await prisma.labelTemplate.findMany({
    where: { userId: dataUserId, active: true },
    orderBy: { name: "asc" },
    take: 40,
  });

  const printed = await prisma.printedLabel.findMany({
    where: await printedLabelListWhereForOwnerAnd(dataUserId, { productId: product.id }),
    orderBy: { createdAt: "desc" },
    take: 15,
    include: { template: { select: { name: true } } },
  });

  const audit = await prisma.labelVerificationEvent.findMany({
    where: { userId: dataUserId, productId: product.id },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  const np = product.nutritionProfile;
  const ap = product.allergenProfile;
  const ing = product.ingredientDeclaration;

  const containsCsv = asStrArr(ap?.containsJson).join(", ");
  const mayCsv = asStrArr(ap?.mayContainJson).join(", ");
  const freeCsv = asStrArr(ap?.freeFromJson).join(", ");

  const sourceOptions = Object.values(LabelDataSourceType);

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <div>
        <Button asChild variant="ghost" className="mb-2 rounded-full px-0 text-muted-foreground">
          <Link href="/dashboard/nutrition-labels">← Label command center</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{product.title}</h1>
        <p className="text-sm text-muted-foreground">{product.menu.title}</p>
        <p className="mt-3 text-sm text-muted-foreground">{LABEL_DATA_DISCLAIMER}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nutrition</CardTitle>
          <CardDescription>Serving facts and macros — verification is a separate step.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {np ? (
            <Badge variant="outline" className="rounded-full">
              Status: {np.verificationStatus}
            </Badge>
          ) : (
            <Badge variant="secondary" className="rounded-full">
              No profile yet
            </Badge>
          )}
          <form action={upsertNutritionProfileFormAction} className="space-y-4">
            <input type="hidden" name="productId" value={product.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Calories</Label>
                <Input name="calories" type="number" min={0} defaultValue={np?.calories ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Serving size</Label>
                <Input name="servingSize" defaultValue={np?.servingSize ?? ""} placeholder="340 g tray" />
              </div>
              <div className="space-y-2">
                <Label>Serving unit</Label>
                <Input name="servingSizeUnit" defaultValue={np?.servingSizeUnit ?? ""} placeholder="g, ml, tray" />
              </div>
              <div className="space-y-2">
                <Label>Protein (g)</Label>
                <Input name="protein" type="number" step="0.1" defaultValue={np?.protein?.toString() ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Total carbohydrate (g)</Label>
                <Input
                  name="totalCarbohydrate"
                  type="number"
                  step="0.1"
                  defaultValue={np?.totalCarbohydrate?.toString() ?? np?.carbs?.toString() ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Total fat (g)</Label>
                <Input name="totalFat" type="number" step="0.1" defaultValue={np?.totalFat?.toString() ?? np?.fat?.toString() ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Sodium (mg)</Label>
                <Input name="sodium" type="number" step="0.1" defaultValue={np?.sodium?.toString() ?? ""} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Source type</Label>
                <select
                  name="sourceType"
                  defaultValue={np?.sourceType ?? "MANUAL"}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {sourceOptions.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Supplier document ref</Label>
                <Input name="supplierDocumentRef" defaultValue={np?.supplierDocumentRef ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Lab result ref</Label>
                <Input name="labResultRef" defaultValue={np?.labResultRef ?? ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Internal notes</Label>
              <Textarea name="notes" rows={2} defaultValue={np?.notes ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Ingredient declaration (legacy field on nutrition profile)</Label>
              <Textarea
                name="ingredientsText"
                rows={3}
                defaultValue={np?.ingredientsText ?? product.ingredients ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Allergens (legacy text; prefer structured allergen profile)</Label>
              <Textarea name="allergens" rows={2} defaultValue={np?.allergens ?? product.allergens ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Reheating instructions</Label>
              <Textarea name="reheatingInstructions" rows={2} defaultValue={product.reheatingInstructions ?? ""} />
            </div>
            <Button type="submit" className="rounded-full">
              Save nutrition draft
            </Button>
          </form>
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <form action={verifyNutritionProfileFormAction}>
              <input type="hidden" name="productId" value={product.id} />
              <Button type="submit" variant="secondary" className="rounded-full">
                Mark nutrition verified
              </Button>
            </form>
            <form action={setNutritionVerificationStatusFormAction}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="status" value="NEEDS_REVIEW" />
              <Button type="submit" variant="outline" className="rounded-full">
                Needs review
              </Button>
            </form>
            <form action={setNutritionVerificationStatusFormAction}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="status" value="BLOCKED" />
              <Button type="submit" variant="destructive" className="rounded-full">
                Block nutrition
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Structured allergens</CardTitle>
          <CardDescription>Comma-separated registry keys (e.g. milk, wheat, tree_nuts).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Reference: {["milk", "eggs", "peanuts"].map((k) => displayAllergenKey(k)).join(", ")}…
          </p>
          {ap ? (
            <Badge variant="outline" className="rounded-full">
              Status: {ap.verificationStatus}
            </Badge>
          ) : null}
          <form action={upsertAllergenProfileFormAction} className="space-y-3">
            <input type="hidden" name="productId" value={product.id} />
            <div className="space-y-2">
              <Label>Contains</Label>
              <Input name="containsCsv" defaultValue={containsCsv} placeholder="milk, wheat" />
            </div>
            <div className="space-y-2">
              <Label>May contain</Label>
              <Input name="mayContainCsv" defaultValue={mayCsv} />
            </div>
            <div className="space-y-2">
              <Label>Free from</Label>
              <Input name="freeFromCsv" defaultValue={freeCsv} />
            </div>
            <div className="space-y-2">
              <Label>Source type</Label>
              <select
                name="sourceType"
                defaultValue={ap?.sourceType ?? "MANUAL"}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {sourceOptions.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea name="notes" rows={2} defaultValue={ap?.notes ?? ""} />
            </div>
            <Button type="submit" className="rounded-full">
              Save allergen profile
            </Button>
          </form>
          <form action={verifyAllergenProfileFormAction}>
            <input type="hidden" name="productId" value={product.id} />
            <Button type="submit" variant="secondary" className="rounded-full">
              Mark allergen profile verified
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingredient declaration</CardTitle>
          <CardDescription>Guest-facing ingredient text after verification.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ing ? (
            <Badge variant="outline" className="rounded-full">
              Status: {ing.verificationStatus}
            </Badge>
          ) : null}
          <form action={upsertIngredientDeclarationFormAction} className="space-y-3">
            <input type="hidden" name="productId" value={product.id} />
            <Textarea
              name="ingredientsText"
              rows={4}
              required
              defaultValue={ing?.ingredientsText ?? product.ingredients ?? ""}
            />
            <select
              name="sourceType"
              defaultValue={ing?.sourceType ?? "MANUAL"}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {sourceOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <Button type="submit" className="rounded-full">
              Save ingredient declaration
            </Button>
          </form>
          <form action={verifyIngredientDeclarationFormAction}>
            <input type="hidden" name="productId" value={product.id} />
            <Button type="submit" variant="secondary" className="rounded-full">
              Mark ingredients verified
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Print queue (this item)</CardTitle>
          <CardDescription>Creates a queued label job for packing stations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">Create starter templates from the command center first.</p>
          ) : (
            <form action={createPrintedLabelJobFormAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="productId" value={product.id} />
              <div className="space-y-1">
                <Label>Template</Label>
                <select name="templateId" className="h-10 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm">
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.size})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Copies</Label>
                <Input name="copies" type="number" min={1} max={99} defaultValue={1} className="w-24" />
              </div>
              <Button type="submit" className="rounded-full">
                Queue print
              </Button>
            </form>
          )}
          <div className="space-y-2 border-t pt-4">
            <p className="text-sm font-medium">Recent jobs</p>
            {printed.length === 0 ? (
              <p className="text-xs text-muted-foreground">No print jobs yet.</p>
            ) : (
              <ul className="text-sm text-muted-foreground">
                {printed.map((j) => (
                  <li key={j.id}>
                    {j.template.name} · {j.status}
                    {j.printedAt ? ` · ${j.printedAt.toISOString()}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification log</CardTitle>
        </CardHeader>
        <CardContent>
          {audit.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {audit.map((e) => (
                <li key={e.id} className="flex flex-wrap justify-between gap-2 border-b border-border/60 py-2">
                  <span>
                    <Badge variant="outline" className="mr-2 rounded-full text-[10px]">
                      {e.profileType}
                    </Badge>
                    {e.action}
                  </span>
                  <span className="text-muted-foreground">{e.createdAt.toISOString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
