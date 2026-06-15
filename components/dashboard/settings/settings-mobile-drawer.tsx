"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { SettingsSidebar } from "./settings-sidebar";
import type { SettingsCapability } from "@/lib/settings/section-registry";

export function SettingsMobileDrawer({ capabilities }: { capabilities: SettingsCapability[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden" aria-label="Open settings menu">
          <Menu className="mr-1 h-4 w-4" aria-hidden />
          Sections
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-3">
        <div onClick={() => setOpen(false)}>
          <SettingsSidebar capabilities={capabilities} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
