"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { toggleChannelRule } from "@/actions/channel-command-center";
import { Button } from "@/components/ui/button";

export function ChannelRuleToggleButton({ ruleId, active }: { ruleId: string; active: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="rounded-full"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await toggleChannelRule({ ruleId, active: !active });
          router.refresh();
        })
      }
    >
      {active ? "Deactivate" : "Activate"}
    </Button>
  );
}
