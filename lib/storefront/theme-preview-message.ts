import type { ThemeCustomizerState } from "@/lib/storefront/theme-draft";
import { customizerToCssVars } from "@/lib/storefront/theme-draft";
import { fontFamilyCss, getFontLink } from "@/services/storefront/font-service";

export const THEME_PREVIEW_MESSAGE = "THEME_UPDATE" as const;

export type ThemePreviewMessage = {
  type: typeof THEME_PREVIEW_MESSAGE;
  theme: ThemeCustomizerState;
};

export function isThemePreviewMessage(data: unknown): data is ThemePreviewMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as ThemePreviewMessage).type === THEME_PREVIEW_MESSAGE &&
    typeof (data as ThemePreviewMessage).theme === "object"
  );
}

/** Apply live customizer values to the public storefront root (preview iframe). */
export function applyThemePreviewToRoot(root: HTMLElement, theme: ThemeCustomizerState): void {
  const vars = customizerToCssVars(theme);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
  root.style.fontFamily = fontFamilyCss(theme.fontFamily);
  const fontHref = getFontLink(theme.fontFamily);
  let fontLink = document.querySelector<HTMLLinkElement>("link[data-kos-preview-font]");
  if (!fontLink) {
    fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.setAttribute("data-kos-preview-font", "1");
    document.head.appendChild(fontLink);
  }
  if (fontLink.href !== fontHref) fontLink.href = fontHref;
  root.dataset.heroLayout = theme.heroLayout;
  root.dataset.navStyle = theme.navStyle;
  root.dataset.cardStyle = theme.cardStyle;
}
