import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ReopenSetupButton } from "@/components/dashboard/reopen-setup-button";

export function GuidedSetupCard() {
  return (
    <Card className="border-border/80 bg-card/90 shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">Guided setup</CardTitle>
          <CardDescription>
            Reopen the onboarding wizard anytime to tune business profile, fulfillment,
            menus, and sales channels — progress is saved between steps.
          </CardDescription>
        </div>
        <ReopenSetupButton />
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        Demo datasets stay isolated until you explicitly import them from onboarding or the
        demo hub (your workspace is flagged while demo mode is on).
      </CardContent>
    </Card>
  );
}
