"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { reopenOnboardingWizard } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";

export function ReopenSetupButton() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-full"
      disabled={pending}
      onClick={() =>
        void (async () => {
          setPending(true);
          try {
            const r = await reopenOnboardingWizard();
            const _err = getActionError(r); if (_err) toast.error(_err);
            else {
              toast.success("Opening guided setup");
              router.push("/onboarding");
            }
          } finally {
            setPending(false);
          }
        })()
      }
    >
      {pending ? "Opening…" : "Guided setup"}
    </Button>
  );
}
