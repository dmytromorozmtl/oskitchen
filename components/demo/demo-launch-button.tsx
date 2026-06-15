"use client";

import * as React from "react";
import { Rocket } from "lucide-react";

import { launchGuestDemoAction } from "@/actions/demo-environment";
import type { DemoVerticalSlug } from "@/lib/demo-verticals";
import { Button } from "@/components/ui/button";

export function DemoLaunchButton({
  vertical = "restaurant",
  className,
}: {
  vertical?: DemoVerticalSlug;
  className?: string;
}) {
  const [pending, setPending] = React.useState(false);

  return (
    <form
      action={async (formData) => {
        setPending(true);
        try {
          await launchGuestDemoAction(formData);
        } finally {
          setPending(false);
        }
      }}
    >
      <input type="hidden" name="vertical" value={vertical} />
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className={className ?? "h-12 rounded-full px-8 text-base font-semibold shadow-md"}
      >
        <Rocket className="mr-2 h-5 w-5" aria-hidden />
        {pending ? "Launching demo…" : "Launch Demo"}
      </Button>
    </form>
  );
}
