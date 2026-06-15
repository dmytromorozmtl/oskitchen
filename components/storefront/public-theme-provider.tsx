"use client";

import * as React from "react";

import type { ThemeCustomizerState } from "@/lib/storefront/theme-draft";

const PublicThemeContext = React.createContext<ThemeCustomizerState | null>(null);

export function PublicThemeProvider({
  theme,
  children,
}: {
  theme: ThemeCustomizerState;
  children: React.ReactNode;
}) {
  return <PublicThemeContext.Provider value={theme}>{children}</PublicThemeContext.Provider>;
}

export function usePublicTheme(): ThemeCustomizerState | null {
  return React.useContext(PublicThemeContext);
}
