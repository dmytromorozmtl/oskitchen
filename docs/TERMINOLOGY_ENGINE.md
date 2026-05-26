# Terminology engine

**Source:** `lib/terminology.ts`  
**Consumers:** Navigation (`labelKey` resolution), page titles, empty states, onboarding, templates.

## Rules

- Never hardcode customer-facing “Order” vs “Preorder” in new UI — resolve via mode.  
- French strings follow the same keys in `lib/i18n.ts` where nav is translated.  
- Bar mode: surface responsible-service disclaimers in settings copy, not fake compliance badges.

## Extension

Add keys as needed per surface; keep keys stable for analytics event names.
