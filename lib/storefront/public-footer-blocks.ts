import { isTemplateFooterBody } from "@/lib/storefront/section-placeholders";
import type { ValidatedFooterBlock } from "@/lib/storefront/footer-validation";

export function resolvePublicFooterBlocks(
  blocks: ValidatedFooterBlock[],
  input: { description?: string | null; tagline?: string | null; publicName: string },
): ValidatedFooterBlock[] {
  const fallback =
    input.description?.trim() ||
    input.tagline?.trim() ||
    `${input.publicName} — preorder & catering online.`;

  return blocks.map((b) => {
    if (b.type !== "text" || !b.body) return b;
    if (isTemplateFooterBody(b.body)) {
      return { ...b, body: fallback };
    }
    return b;
  });
}
