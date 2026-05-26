# Business mode alias safety

## Helpers

Located in `lib/business-mode/business-mode-normalization.ts`:

- `normalizeBusinessModeForPersistence` → delegates to `resolveStrategicBusinessMode` (`COMMISSARY`→`CLOUD_KITCHEN`, `MANUAL_ONLY`→`OTHER`).
- `getBusinessModeDisplayLabel(persisted, declaredStrategic?)` — UI can pass original onboarding string for Commissary / Manual-only labels.
- `getBusinessModeAlias`, `getBusinessModeWorkflowProfile`, `strategicAliasFromRawInput`.

## Tests

`tests/unit/business-mode-normalization.test.ts` covers persistence + labels + module plan presence.
