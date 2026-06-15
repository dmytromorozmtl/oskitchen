"use client";

import { CAFE_MODE_P3_143_MAX_SCREENS } from "@/lib/pos/cafe-mode-p3-143-policy";
import { CAFE_MODE_P3_143_SCREENS } from "@/lib/pos/cafe-mode-p3-143-content";
import type { CafeModeP3_143ScreenId } from "@/lib/pos/cafe-mode-p3-143-policy";
import { posTouchCompactClass } from "@/lib/pos/touch-targets";
import { cn } from "@/lib/utils";

/** Café screen ids (5-screen max): menu · cart · modifiers · payment · receipt */

export function CafeModeScreenNav({
  activeScreen,
  onSelect,
}: {
  activeScreen: CafeModeP3_143ScreenId;
  onSelect: (screenId: CafeModeP3_143ScreenId) => void;
}) {
  return (
    <nav
      className="flex flex-wrap gap-1 rounded-xl border bg-muted/40 p-1"
      aria-label="Café mode navigation — 5 screens max"
      data-testid="cafe-mode-screen-nav"
    >
      {CAFE_MODE_P3_143_SCREENS.map((screen) => (
        <button
          key={screen.id}
          type="button"
          data-screen-id={screen.id}
          onClick={() => onSelect(screen.id)}
          className={cn(
            posTouchCompactClass,
            "flex-1 min-w-[4.5rem] rounded-lg px-2 py-2 text-xs font-medium transition-colors",
            activeScreen === screen.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background hover:text-foreground",
          )}
        >
          {screen.label}
        </button>
      ))}
    </nav>
  );
}
