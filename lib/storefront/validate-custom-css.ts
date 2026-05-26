const MAX_CSS_LENGTH = 32_000;

const FORBIDDEN_PATTERNS: { pattern: RegExp; message: string }[] = [
  { pattern: /<\s*script/i, message: "Script tags are not allowed" },
  { pattern: /<\s*\/\s*style/i, message: "Closing style tags are not allowed" },
  { pattern: /javascript\s*:/i, message: "javascript: URLs are not allowed" },
  { pattern: /expression\s*\(/i, message: "CSS expressions are not allowed" },
  { pattern: /@import/i, message: "@import is not allowed (use plain rules only)" },
];

/** Server-safe CSS validation before persisting custom storefront CSS. */
export function validateCustomCss(css: string): { valid: boolean; error?: string } {
  const trimmed = css.trim();
  if (trimmed.length > MAX_CSS_LENGTH) {
    return { valid: false, error: `CSS must be under ${MAX_CSS_LENGTH} characters` };
  }
  for (const { pattern, message } of FORBIDDEN_PATTERNS) {
    if (pattern.test(trimmed)) return { valid: false, error: message };
  }
  return { valid: true };
}

/** Browser validation — uses constructable stylesheets when available. */
export function validateCustomCssInBrowser(css: string): { valid: boolean; error?: string } {
  const base = validateCustomCss(css);
  if (!base.valid) return base;
  if (typeof document === "undefined") return base;

  try {
    if (typeof CSSStyleSheet !== "undefined" && "replaceSync" in CSSStyleSheet.prototype) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css || "/* */");
      return { valid: true };
    }
    const style = document.createElement("style");
    style.textContent = css || "/* */";
    document.head.appendChild(style);
    document.head.removeChild(style);
    return { valid: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "CSS syntax error";
    return { valid: false, error: msg };
  }
}
