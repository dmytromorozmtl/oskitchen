# Storefront HTTP smoke report

| Field | Value |
|-------|-------|
| Date (UTC) | 2026-05-17T14:09:18.109Z |
| Environment | production |
| Base URL | https://xn---production-xijza32a.vercel.app |
| Slug | hello |
| Result | 0/10 passed |

## Automated checks

| ID | Check | Pass | Detail |
|----|-------|------|--------|
| home | Published storefront home | ✗ | GET /s/hello → 404 |
| menu | Menu page | ✗ | GET /s/hello/menu → 404 |
| cart | Cart page | ✗ | GET /s/hello/cart → 404 |
| checkout | Checkout page | ✗ | GET /s/hello/checkout → 404 |
| contact | Contact page | ✗ | GET /s/hello/contact → 404 |
| catering | Catering page | ✗ | GET /s/hello/catering → 404 |
| faq | FAQ page | ✗ | GET /s/hello/faq → 404 |
| policies_privacy | Privacy policy | ✗ | GET /s/hello/policies/privacy → 404 |
| policies_terms | Terms policy | ✗ | GET /s/hello/policies/terms → 404 |
| sitemap | Sitemap XML 200 | ✗ | GET /s/hello/sitemap.xml → 404 |
