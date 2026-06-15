import { sanitizeRichTextLite } from "@/lib/storefront-builder/safe-content";

const BLOCKED_TAGS =
  /<\/?(?:script|style|iframe|object|embed|form|input|textarea|select|option|meta|link|base|svg)\b[^>]*>/gi;

/**
 * Stronger HTML sanitizer for legal/policy copy — defense in depth on save and render.
 * Not a full DOM tree sanitizer; blocks high-risk tags, inline handlers, and unsafe URLs.
 */
export function sanitizeRichHtmlForLegal(html: string): string {
  let s = sanitizeRichTextLite(html);
  s = s.replace(BLOCKED_TAGS, "");
  s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, "");
  s = s.replace(/\sstyle\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, "");
  s = s.replace(/href\s*=\s*(["'])\s*(javascript:|data:|vbscript:)/gi, 'href=$1#blocked');
  return s;
}
