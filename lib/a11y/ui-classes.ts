/** Shared Tailwind classes for keyboard focus rings on native controls. */
export const A11Y_FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Inline links inside body copy — underline so they are not color-only. */
export const A11Y_INLINE_LINK =
  "font-medium text-primary underline underline-offset-4 decoration-primary/70 hover:decoration-primary";

/** Segmented toggle button base — pair with aria-pressed. */
export const A11Y_SEGMENT_BUTTON =
  `${A11Y_FOCUS_RING} rounded-full px-4 py-2 transition-colors`;
