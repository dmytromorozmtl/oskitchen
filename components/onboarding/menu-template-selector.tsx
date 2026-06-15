"use client";

import * as React from "react";
import { Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { applyOnboardingMenuTemplateAction } from "@/actions/onboarding-menu-templates";
import { getActionError, isActionSuccess } from "@/lib/action-result";
import {
  ONBOARDING_MENU_TEMPLATE_OPTIONS,
  type OnboardingMenuTemplateId,
} from "@/lib/onboarding/quick-start-types";
import { getMenuTemplate, listMenuTemplates } from "@/services/onboarding/menu-templates";
import { invokeServerAction } from "@/lib/server-actions/invoke-server-action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MenuTemplateSelector({ className }: { className?: string }) {
  const router = useRouter();
  const [previewId, setPreviewId] = React.useState<OnboardingMenuTemplateId | null>(null);
  const [selectedId, setSelectedId] = React.useState<OnboardingMenuTemplateId | null>(null);
  const [pending, startTransition] = React.useTransition();

  const previewTemplate = previewId ? getMenuTemplate(previewId) : null;
  const itemCounts = React.useMemo(() => {
    const map = new Map<OnboardingMenuTemplateId, number>();
    for (const t of listMenuTemplates()) {
      map.set(t.id, t.items.length);
    }
    return map;
  }, []);

  function applyTemplate(id: OnboardingMenuTemplateId) {
    setSelectedId(id);
    startTransition(async () => {
      const res = await invokeServerAction(() => applyOnboardingMenuTemplateAction(id));
      if (
        !isActionSuccess<{ redirectTo: string; productCount: number; menuId: string }>(res)
      ) {
        toast.error(getActionError(res) ?? "Could not apply template");
        setSelectedId(null);
        return;
      }
      toast.success(
        `Applied ${getMenuTemplate(id).title} — ${res.data.productCount} items ready to edit`,
      );
      router.push(res.data.redirectTo);
      router.refresh();
      setSelectedId(null);
    });
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ONBOARDING_MENU_TEMPLATE_OPTIONS.map((opt) => {
          const count = itemCounts.get(opt.id) ?? 0;
          const busy = pending && selectedId === opt.id;
          return (
            <Card
              key={opt.id}
              className={cn(
                "border-border/80 shadow-sm transition-colors",
                selectedId === opt.id && "ring-2 ring-primary/40",
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl" aria-hidden>
                    {opt.icon}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {count} items
                  </span>
                </div>
                <CardTitle className="text-base">{opt.label}</CardTitle>
                <CardDescription>{opt.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setPreviewId(opt.id)}
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Preview
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="rounded-full"
                  disabled={pending}
                  onClick={() => applyTemplate(opt.id)}
                >
                  {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                  Select
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={previewId !== null} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          {previewTemplate ? (
            <>
              <DialogHeader>
                <DialogTitle>{previewTemplate.title}</DialogTitle>
                <DialogDescription>{previewTemplate.description}</DialogDescription>
              </DialogHeader>
              <ul className="space-y-2 text-sm">
                {previewTemplate.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0"
                  >
                    <span>
                      <span className="font-medium">{item.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{item.category}</span>
                    </span>
                    <span className="tabular-nums">${item.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setPreviewId(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  className="rounded-full"
                  disabled={pending}
                  onClick={() => {
                    const id = previewId!;
                    setPreviewId(null);
                    applyTemplate(id);
                  }}
                >
                  Select template
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
