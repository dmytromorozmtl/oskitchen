import {
  PUBLIC_ROADMAP_OUT_OF_SCOPE,
  PUBLIC_ROADMAP_QUARTERS,
  type PublicRoadmapItem,
} from "@/lib/marketing/public-roadmap-content";
import {
  PUBLIC_ROADMAP_P3_88_BANNED_UNDATED_PHRASES,
  PUBLIC_ROADMAP_P3_88_CONFIDENCE_LEVELS,
  PUBLIC_ROADMAP_P3_88_HARDWARE_KEYWORDS,
  PUBLIC_ROADMAP_P3_88_REQUIRED_QUARTER_PATTERN,
} from "@/lib/marketing/public-roadmap-honest-dates-p3-88-policy";

export type PublicRoadmapHonestDatesValidation = {
  passed: boolean;
  quarterLabelsHonest: boolean;
  allItemsHaveConfidence: boolean;
  noHardwareInQuarters: boolean;
  hardwareOnlyOutOfScope: boolean;
  noBannedUndatedPhrases: boolean;
  failures: string[];
};

function itemText(item: PublicRoadmapItem): string {
  return `${item.title} ${item.description}`.toLowerCase();
}

function containsHardwareKeyword(text: string): boolean {
  return PUBLIC_ROADMAP_P3_88_HARDWARE_KEYWORDS.some((keyword) =>
    text.includes(keyword.toLowerCase()),
  );
}

function containsBannedPhrase(text: string): string | null {
  const lower = text.toLowerCase();
  for (const phrase of PUBLIC_ROADMAP_P3_88_BANNED_UNDATED_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      return phrase;
    }
  }
  return null;
}

export function validatePublicRoadmapHonestDates(): PublicRoadmapHonestDatesValidation {
  const failures: string[] = [];

  let quarterLabelsHonest = true;
  for (const quarter of PUBLIC_ROADMAP_QUARTERS) {
    if (!PUBLIC_ROADMAP_P3_88_REQUIRED_QUARTER_PATTERN.test(quarter.label)) {
      quarterLabelsHonest = false;
      failures.push(`quarter label missing honest date: ${quarter.label}`);
    }
  }

  let allItemsHaveConfidence = true;
  for (const quarter of PUBLIC_ROADMAP_QUARTERS) {
    for (const item of quarter.items) {
      if (!item.confidence || !PUBLIC_ROADMAP_P3_88_CONFIDENCE_LEVELS.includes(item.confidence)) {
        allItemsHaveConfidence = false;
        failures.push(`missing confidence on quarter item: ${item.id}`);
      }
    }
  }
  for (const item of PUBLIC_ROADMAP_OUT_OF_SCOPE) {
    if (!item.confidence || !PUBLIC_ROADMAP_P3_88_CONFIDENCE_LEVELS.includes(item.confidence)) {
      allItemsHaveConfidence = false;
      failures.push(`missing confidence on out-of-scope item: ${item.id}`);
    }
  }

  let noHardwareInQuarters = true;
  for (const quarter of PUBLIC_ROADMAP_QUARTERS) {
    for (const item of quarter.items) {
      if (containsHardwareKeyword(itemText(item))) {
        noHardwareInQuarters = false;
        failures.push(`hardware keyword in dated quarter item: ${item.id} (${quarter.label})`);
      }
    }
  }

  let hardwareOnlyOutOfScope = true;
  const quarterHardwareIds = PUBLIC_ROADMAP_QUARTERS.flatMap((q) =>
    q.items.filter((item) => containsHardwareKeyword(itemText(item))).map((item) => item.id),
  );
  if (quarterHardwareIds.length > 0) {
    hardwareOnlyOutOfScope = false;
  }

  let noBannedUndatedPhrases = true;
  const allItems = [
    ...PUBLIC_ROADMAP_QUARTERS.flatMap((q) => q.items),
    ...PUBLIC_ROADMAP_OUT_OF_SCOPE,
  ];
  for (const item of allItems) {
    const banned = containsBannedPhrase(itemText(item));
    if (banned) {
      noBannedUndatedPhrases = false;
      failures.push(`banned undated phrase "${banned}" in item: ${item.id}`);
    }
  }

  const passed =
    failures.length === 0 &&
    quarterLabelsHonest &&
    allItemsHaveConfidence &&
    noHardwareInQuarters &&
    hardwareOnlyOutOfScope &&
    noBannedUndatedPhrases;

  return {
    passed,
    quarterLabelsHonest,
    allItemsHaveConfidence,
    noHardwareInQuarters,
    hardwareOnlyOutOfScope,
    noBannedUndatedPhrases,
    failures,
  };
}
