import type { ThemeSnapshotV1 } from "@/lib/storefront/theme-snapshot";

export type ThemePublishDiffLine = {
  area: "navigation" | "footer" | "colors";
  summary: string;
};

function countNavItems(raw: unknown): number {
  if (!raw || typeof raw !== "object") return 0;
  const items = Array.isArray(raw) ? raw : (raw as { items?: unknown }).items;
  if (!Array.isArray(items)) return 0;
  let n = 0;
  for (const it of items) {
    n += 1;
    if (it && typeof it === "object" && Array.isArray((it as { children?: unknown }).children)) {
      n += (it as { children: unknown[] }).children.length;
    }
  }
  return n;
}

function countFooterBlocks(raw: unknown): number {
  if (!raw || typeof raw !== "object") return 0;
  const blocks = Array.isArray(raw) ? raw : (raw as { blocks?: unknown }).blocks;
  return Array.isArray(blocks) ? blocks.length : 0;
}

export function buildThemePublishDiff(
  draft: {
    navigationItemsJson: unknown;
    footerBlocksJson: unknown;
    brandColor: string | null;
    secondaryColor: string | null;
    backgroundColor: string | null;
    textColor: string | null;
  },
  published: ThemeSnapshotV1 | null,
): ThemePublishDiffLine[] {
  const lines: ThemePublishDiffLine[] = [];
  const pubNav = published?.navigationItems;
  const pubFooter = published?.footerBlocks;
  const draftNavCount = countNavItems(draft.navigationItemsJson);
  const pubNavCount = countNavItems(pubNav ?? { items: [] });
  if (draftNavCount !== pubNavCount) {
    lines.push({
      area: "navigation",
      summary: `Navigation: ${pubNavCount} → ${draftNavCount} item(s)`,
    });
  }

  const draftFooterCount = countFooterBlocks(draft.footerBlocksJson);
  const pubFooterCount = countFooterBlocks(pubFooter ?? { blocks: [] });
  if (draftFooterCount !== pubFooterCount) {
    lines.push({
      area: "footer",
      summary: `Footer: ${pubFooterCount} → ${draftFooterCount} block(s)`,
    });
  }

  const pubTok = published?.tokens ?? {};
  const colorFields = ["brandColor", "secondaryColor", "backgroundColor", "textColor"] as const;
  const changes: string[] = [];
  for (const key of colorFields) {
    const d = draft[key];
    const p = pubTok[key];
    if ((d ?? null) !== (p ?? null)) changes.push(key);
  }
  if (changes.length > 0) {
    lines.push({ area: "colors", summary: `Palette: ${changes.join(", ")}` });
  }

  if (lines.length === 0) {
    lines.push({ area: "colors", summary: "No structural changes detected — publish will refresh snapshot timestamp." });
  }
  return lines;
}
