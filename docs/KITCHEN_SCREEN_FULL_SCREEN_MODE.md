# Kitchen Screen fullscreen mode

## Query

`/dashboard/kitchen?fullscreen=1`

## Shortcut route

`/dashboard/kitchen/fullscreen` → redirects to the query URL above (bookmark-friendly).

## Behavior

Client renders a **fixed full-viewport** layer (`z-[200]`) with dark background so line-of-sight is maximized on wall tablets.

**Exit** via button toggling query off.

## Not included yet

- Hiding dashboard layout at route level (would require parallel route group); overlay achieves similar UX.
