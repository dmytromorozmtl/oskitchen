# Rich HTML sanitizer (legal / policy)

## Modules

- `lib/storefront/rich-html-sanitizer.ts` — strips high-risk tags, inline handlers, inline `style`, blocks `javascript:` / `data:` hrefs (defense in depth).
- `lib/storefront/legal-content-validation.ts` — length cap + sanitizer on save.

## Usage

- Privacy field in business settings sanitized on save.
- Footer privacy snippet sanitized again at render (`StorefrontFooter`).

## Limitations

Not a full DOM-tree sanitizer; pair with strict allow-list renderer or move to `isomorphic-dompurify` if richer HTML is required.
