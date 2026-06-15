import {
  SETTINGS_SECTIONS,
  type SettingsCapability,
  type SettingsSection,
} from "./section-registry";

export function filterVisibleSettingsSections(
  capabilities: readonly SettingsCapability[],
  query: string,
): SettingsSection[] {
  const capSet = new Set(capabilities);
  const visible = SETTINGS_SECTIONS.filter((section) => capSet.has(section.capability));
  return searchSettingsSections(query, visible);
}

export function searchSettingsSections(
  query: string,
  sections: readonly SettingsSection[] = SETTINGS_SECTIONS,
): SettingsSection[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...sections];

  return sections
    .map((section) => {
      const haystack = [section.label, section.description, ...(section.keywords ?? [])]
        .join(" ")
        .toLowerCase();
      let score = 0;
      if (section.label.toLowerCase() === q) score += 100;
      else if (section.label.toLowerCase().startsWith(q)) score += 50;
      else if (haystack.includes(q)) score += 10;
      return { section, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) => b.score - a.score || a.section.label.localeCompare(b.section.label),
    )
    .map(({ section }) => section);
}

export function resolveVisibleSettingsShortcuts(
  keys: readonly string[],
  visibleSections: readonly SettingsSection[],
): SettingsSection[] {
  return keys
    .map((key) => visibleSections.find((section) => section.key === key))
    .filter(Boolean) as SettingsSection[];
}
