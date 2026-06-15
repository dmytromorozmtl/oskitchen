/** Builder template strings — replaced with live storefront fields on the public site. */
export const HERO_TEMPLATE_HEADLINE = "Welcome";
export const HERO_TEMPLATE_SUBHEADLINE = "Tell guests what you offer.";
export const FOOTER_TEMPLATE_BODY = "Update this text in the storefront builder.";
export const TEXT_TEMPLATE_BODY = "Add your story, hours, or policies here.";

export function isTemplateHeroHeadline(v: string | undefined | null): boolean {
  const t = (v ?? "").trim();
  return !t || t === HERO_TEMPLATE_HEADLINE;
}

export function isTemplateHeroSubheadline(v: string | undefined | null): boolean {
  const t = (v ?? "").trim();
  return !t || t === HERO_TEMPLATE_SUBHEADLINE;
}

export function isTemplateFooterBody(v: string | undefined | null): boolean {
  return (v ?? "").includes(FOOTER_TEMPLATE_BODY);
}

export function isTemplateTextBody(v: string | undefined | null): boolean {
  return (v ?? "").trim() === TEXT_TEMPLATE_BODY;
}
