import { sanitizeRichHtmlForLegal } from "@/lib/storefront/rich-html-sanitizer";
import { STOREFRONT_PERF } from "@/lib/storefront/performance-limits";

export function validateAndSanitizeLegalHtml(input: string): { ok: true; html: string } | { ok: false; error: string } {
  if (input.length > STOREFRONT_PERF.maxRichTextChars) {
    return { ok: false, error: `Legal copy is too long (max ${STOREFRONT_PERF.maxRichTextChars} characters).` };
  }
  return { ok: true, html: sanitizeRichHtmlForLegal(input) };
}
