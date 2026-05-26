# Accessibility review — KitchenOS

Practical improvements toward WCAG-aligned patterns. This document does **not** constitute a legal compliance certification.

## Strengths

- Semantic headings on auth and marketing pages.
- Dashboard navigation uses disclosure-friendly collapsible groups with visible labels.

## Gaps and recommendations

### Keyboard and focus

- Ensure all modals and drawers trap focus and restore focus on close (audit Radix/shadcn primitives).
- Verify skip links or landmark regions on dense dashboard layouts.

### Forms

- Associate every input with `<label>` or `aria-labelledby`.
- Surface validation errors with `aria-live="polite"` regions where inline messages appear.

### Tables

- Use `<th scope="col">` for data tables; provide captions or `aria-label` for complex grids.

### Color and contrast

- Audit `muted-foreground` on colored backgrounds (especially badges and KPI cards).
- Do not rely on color alone for status — pair with text or icons (`StatusBadge`).

### Touch targets

- Kitchen and packing flows should use **minimum 44×44px** interactive targets on tablet.

## Testing

- Manual: VoiceOver (macOS/iOS), NVDA spot checks on Windows.
- Automated: axe-core in Playwright (future enhancement).
