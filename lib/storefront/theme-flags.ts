/**
 * Feature flag: apply structured design tokens as CSS variables on the public storefront wrapper only.
 * Set `NEXT_PUBLIC_STOREFRONT_DESIGN_TOKENS_CSS_VARS=true` to enable for all visitors (still scoped to storefront root).
 */
export function storefrontDesignTokensCssVarsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_STOREFRONT_DESIGN_TOKENS_CSS_VARS === "true";
}
