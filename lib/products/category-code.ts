/** Normalize a display name to a stable category code (e.g. "Cocktails" → "COCKTAILS"). */
export function normalizeCategoryCode(name: string): string {
  const code = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
  return code.length > 0 ? code : "CUSTOM";
}

export function formatCategoryCodeLabel(code: string): string {
  return code
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
