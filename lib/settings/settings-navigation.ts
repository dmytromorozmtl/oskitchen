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
  const q = query.trim().toLowerCase();

  return SETTINGS_SECTIONS.filter((section) => capSet.has(section.capability)).filter((section) => {
    if (!q) return true;
    const haystack = [section.label, section.description, ...(section.keywords ?? [])]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function resolveVisibleSettingsShortcuts(
  keys: readonly string[],
  visibleSections: readonly SettingsSection[],
): SettingsSection[] {
  return keys
    .map((key) => visibleSections.find((section) => section.key === key))
    .filter(Boolean) as SettingsSection[];
}
