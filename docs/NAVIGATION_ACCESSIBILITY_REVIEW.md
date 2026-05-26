# Navigation accessibility review

## Implemented (2026-05)

- **Sidebar groups:** `aria-expanded`, `aria-controls`, labeled `role="region"` for link lists.  
- **Nav filter:** `aria-label="Filter navigation"`.  
- **Pin control:** `aria-label` / `title` distinguish pin vs unpin; visible on hover and when pinned.  
- **Command palette:** Search input with dialog titling (`sr-only` header); list items are plain `li` + `button` (avoid incorrect `option` without `aria-selected`).  
- **Breadcrumbs:** `nav` + `aria-label="Breadcrumb"`.  
- **Role denial:** `ModuleRouteGate` provides readable heading + description + actions.

## Recommended next

| Item | Priority |
|------|----------|
| **Focus trap** in ⌘K dialog — verify Radix `Dialog` focus scope (should be OK); add arrow-key navigation between results if product wants IDE-like UX. | P2 |
| **Skip link** “Skip to main content” on dashboard layout. | P2 |
| **Contrast** on `text-muted-foreground` pins — audit against WCAG AA on `bg-muted`. | P2 |
| **Mobile:** ensure `Sheet` title + focus return to menu trigger on close. | P2 |

## Keyboard

- ⌘/Ctrl+K toggles palette.  
- **Tab** through sidebar pins without activating parent group toggle (Clear recent uses `stopPropagation`).

## Testing

- VoiceOver (macOS): navigate Today → collapse Orders & Sales → expand.  
- Keyboard only: reach pin button via `Tab` inside group.
