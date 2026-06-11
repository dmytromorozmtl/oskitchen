import type { CompetitorBattleCardP1_85Entry } from "@/lib/marketing/competitor-battle-cards-p1-85-content";
import {
  COMPETITOR_BATTLE_CARDS_P1_85_FRAMEWORK,
  COMPETITOR_BATTLE_CARDS_P1_85_POLICY_ID,
} from "@/lib/marketing/competitor-battle-cards-p1-85-policy";

export function renderCompetitorBattleCardMarkdown(
  entry: CompetitorBattleCardP1_85Entry,
): string {
  return `# Battle card — ${entry.displayName}

**Policy:** \`${COMPETITOR_BATTLE_CARDS_P1_85_POLICY_ID}\`  
**Card ID:** ${entry.cardId}  
**slug:** \`${entry.slug}\`  
**Framework:** ${COMPETITOR_BATTLE_CARDS_P1_85_FRAMEWORK}

One-page sales battle card. OS Kitchen is **not affiliated** with ${entry.displayName}. Verify Integration Health and smoke artifacts before LIVE integration claims.

---

## They win

${entry.theyWin}

## Trap (never say)

${entry.trap}

## Our redirect

${entry.redirect}

## ICP fit

${entry.icpFit}

## Talk track

> ${entry.talkTrack}

## Compare

[${entry.comparePath}](${entry.comparePath})

## Honesty

- Acknowledge where **${entry.displayName} wins** before redirecting — builds trust on competitive calls.
- **verify** \`npm run verify-claims\` and Integration Health PASS/SKIPPED rows before outbound decks.
- **BETA** / SKIPPED labels stay visible in demos — typical pilot requires staging proof.
- Run [\`forbidden-claims-training\`](/trust/forbidden-claims-training) quiz ≥8/10 before customer calls.

**Primary CTA:** [\`/book-demo?utm_source=battle-card&utm_medium=sales&utm_campaign=${entry.slug}\`](/book-demo?utm_source=battle-card&utm_medium=sales&utm_campaign=${entry.slug})
`;
}
