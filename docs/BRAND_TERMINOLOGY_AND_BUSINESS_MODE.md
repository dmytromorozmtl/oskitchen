# Brand terminology and business mode

## Layers

1. **Workspace business type** (`UserProfile.kitchenSettings.businessType`) — default nav focus and module visibility.  
2. **Brand default business mode** (`Brand.defaultBusinessMode`) — when a single brand is selected, microcopy can align to that mode (meal prep vs catering vs bakery).  
3. **Neutral copy** — when “All brands” is selected, avoid mode-specific jargon.

## Implementation status

- Brand context is available client-side via `BrandContextProvider` / storage.  
- Module pages still mostly use workspace-level terminology until each view reads brand context and `defaultBusinessMode`.

## Guidelines

- Prefer “Menu items” vs “SKUs” based on workspace mode (existing `menuCenterCopy` patterns).  
- Extend similarly with `brand.defaultBusinessMode` when brand-scoped routes ship.
