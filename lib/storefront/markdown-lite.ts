import { sanitizeRichTextLite } from "@/lib/storefront-builder/safe-content";

/**
 * Minimal markdown → safe HTML (bold, italic, links, lists, paragraphs).
 * No arbitrary HTML input — operators use markdown syntax only.
 */
export function markdownLiteToHtml(input: string): string {
  const safe = sanitizeRichTextLite(input);
  const blocks = safe.split(/\n\n+/);
  const htmlBlocks = blocks.map((block) => {
    const lines = block.split("\n");
    const listMatch = lines.every((l) => /^[-*]\s+/.test(l.trim()) || l.trim() === "");
    if (listMatch && lines.some((l) => /^[-*]\s+/.test(l.trim()))) {
      const items = lines
        .filter((l) => /^[-*]\s+/.test(l.trim()))
        .map((l) => `<li>${inlineFormat(l.replace(/^[-*]\s+/, "").trim())}</li>`)
        .join("");
      return `<ul class="list-disc pl-5 space-y-1">${items}</ul>`;
    }
    return `<p>${lines.map((l) => inlineFormat(l)).join("<br />")}</p>`;
  });
  return htmlBlocks.join("");
}

function inlineFormat(line: string): string {
  let s = escapeHtml(line);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" class="text-primary underline-offset-4 hover:underline" rel="noopener noreferrer">$1</a>');
  return s;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function isMarkdownBody(content: { bodyFormat?: unknown } | null | undefined): boolean {
  return content?.bodyFormat === "markdown";
}
