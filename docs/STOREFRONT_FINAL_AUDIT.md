# Storefront final system audit (KitchenOS)

**Scope:** Public storefront module (`/s/[storeSlug]…`), admin builder (`/dashboard/storefront…`), Prisma storefront models, middleware host resolution, checkout, SEO, analytics, forms, domains.  
**Method:** Code review + schema review (2026-02). Not a substitute for pen-test or load testing.

---

## 1. Admin settings & builder

| Area | Current state | Missing | Business risk | Customer impact | Priority | Recommended fix |
| --- | --- | --- | --- | --- | --- | --- |
| Tabbed console | Launch, Website, Pages, Theme, Menu, Products, Overview, Ordering, Fulfillment, Forms, Domains, SEO, Analytics, Notifications, Settings, Advanced, Preview | Some tabs are navigation/planning stubs (Forms, Advanced) | Medium — merchants may expect full builders | Low if copy is clear | **P1** | Ship progressive UI: builder for `StorefrontForm`, redirect runner, fulfillment visual editor |
| Overview form | Single large form for publishing core | Split “dangerous” actions; export JSON | Low | Low | **P2** | Wizard-style save sections + confirmation modals |
| Product merchandising | New **Products** tab: slug, visibility, max qty, featured flag | Bulk edit, drag sort, nutrition toggles per channel | Medium | Medium for large menus | **P1** | Extend `Product` + batch actions |
| Launch checklist | Server-driven checklist | Does not block publish | Low | Low | **P2** | Optional hard gates + override for super-admin |

---

## 2. Public routes

| Area | Current state | Missing | Risk | Impact | Priority | Fix |
| --- | --- | --- | --- | --- | --- | --- |
| Path URLs | `/s/[slug]`, menu, cart, checkout, order token, about, contact, faq, catering, custom `p/[pageSlug]`, policies | None critical | Low | — | **P2** | Add robots.txt per store when SEO matures |
| Product URLs | `[productRef]` resolves **UUID or `publicSlug`** | Slug uniqueness only per-menu in app | Medium — duplicate slug errors | 404/confusion | **P0** | Enforce DB partial unique index (migration) + admin validation (done in app) |
| Vanity / custom host | Middleware rewrite to `/s/...` | Redirect table not executed at edge | Low until merchants rely on redirects | Broken marketing links | **P1** | Read `StorefrontRedirect` in middleware or layout `redirect()` |

---

## 3. Database schema

| Area | Current state | Missing | Risk | Priority | Fix |
| --- | --- | --- | --- | --- | --- |
| Core models | Settings, pages, sections, themes, orders, items, domains, visits, events, contact submissions | — | Low | — | Maintain migrations |
| New layer (migration `20260207140000_storefront_production_layer`) | Blackouts, discounts, redirects, forms, menu publish snapshots, nav/footer JSON, fulfillment rules JSON, assets; `Product` storefront fields; `StorefrontOrder.isTestOrder` | Admin CRUD for new tables (except discounts via checkout) | Medium — dead schema surface | **P1** | CRUD UIs or prune unused models |
| Indexes | `storefront_orders(storefront_id,status)`, `products(menu_id,public_slug)`, `storefront_domains(domain,status)` | Funnel queries by `eventName` already indexed | Low | **P2** | Add covering indexes when slow queries appear |

---

## 4. Checkout & cart

| Area | Current state | Missing | Risk | Impact | Priority | Fix |
| --- | --- | --- | --- | --- | --- | --- |
| Server validation | Enabled/published/closure/cutoff/menu lines/min order/fulfillment toggles/**blackout dates**/**max storefront qty**/promo codes | Window-level max orders, strict delivery zone polygon | High if unchecked | Wrong fulfillment expectations | **P0** | Implement `StorefrontFulfillmentRule` interpreter + zone checks |
| Pay-later | Default; Stripe not required | Deposit / hosted checkout still placeholder | Low | — | **P2** | Document only until Stripe per-tenant |
| Cart | localStorage keyed by slug; client validation light | Item notes, abandoned cart server | Medium | Merchants want notes | **P1** | Extend cart JSON + optional sync |
| Duplicate submit | 45s dedupe by email + fingerprint | Idempotency-Key header | Low | Double charges perception | **P2** | Accept header in action |

---

## 5. Menu publishing & products

| Area | Current state | Missing | Risk | Priority | Fix |
| --- | --- | --- | --- | --- | --- |
| Active menu | `StorefrontSettings.activeMenuId` | Scheduled publish uses new `StorefrontMenuPublish` table but not wired | Medium | Stale menu at go-live | **P1** | Cron or manual “Publish snapshot” action |
| Visibility | `storefrontVisible` filters public menu | Admin must remember to toggle | Low | Hidden dishes accidentally | **P2** | Default-on + banner in menu board |
| Sold-out | Uses `ProductAvailability` in other channels; storefront menu may not surface sold-out consistently | Unified availability | Medium | Oversell | **P0** | Map availability into public menu payload + cart checks |

---

## 6. Fulfillment

| Area | Current state | Missing | Risk | Priority | Fix |
| --- | --- | --- | --- | --- | --- |
| Closures | Settings closure window + message | Blackout table now validated at checkout | Low | — | **P1** | Surface blackout list in admin calendar UI |
| Windows | Text instructions + kitchen settings overlap | Structured pickup/delivery windows | High | Wrong customer expectation | **P0** | Use `StorefrontFulfillmentRule.rulesJson` + UI |

---

## 7. Custom domains

| Area | Current state | Missing | Risk | Priority | Fix |
| --- | --- | --- | --- | --- | --- |
| Resolution | Middleware + `resolve-host` API with shared secret | Automated SSL/DNS | Low if honest UI | — | **P2** | Keep manual Vercel/hosting steps documented |
| Status | `StorefrontDomain` + settings fields | Recheck job | Medium | Stale status | **P1** | Background job + admin “Recheck” |

---

## 8. Page builder & CMS

| Area | Current state | Missing | Risk | Priority | Fix |
| --- | --- | --- | --- | --- | --- |
| Sections | Prisma models + `lib/storefront/sections.ts` | Full drag-drop in admin | Medium | Merchants use static pages only | **P1** | Builder on `StorefrontSection` |

---

## 9. SEO

| Area | Current state | Missing | Risk | Priority | Fix |
| --- | --- | --- | --- | --- | --- |
| Metadata | `buildStorefrontMetadata`, canonical base | Breadcrumb JSON-LD | Low | Rich results | **P2** | Add when IA stable |
| Sitemap | `/s/[slug]/sitemap.xml` includes core routes + products | Custom pages from CMS | Low | Indexing | **P1** | Merge `StorefrontPage` published slugs |
| Product JSON-LD | `Product` + `Offer` + PreOrder | Only when fields known | Low | Over-claiming | **P3** | Keep conservative |

---

## 10. Analytics

| Area | Current state | Missing | Risk | Priority | Fix |
| --- | --- | --- | --- | --- | --- |
| Events | `StorefrontConversionEvent` + beacon | `order_tracking_view` not yet fired on token page | Medium | Funnel gap | **P1** | Add lightweight client beacon on order page |
| Visits | `StorefrontVisit` hashed | Device breakdown | Low | Reporting | **P3** | Parse UA client-hints later |

---

## 11. Notifications

| Area | Current state | Missing | Risk | Priority | Fix |
| --- | --- | --- | --- | --- | --- |
| Resend | Order confirmation when kitchen toggle on + Resend configured | Pickup reminder, catering templates | Medium | **P1** | Template pack + queue |

---

## 12. Forms & spam

| Area | Current state | Missing | Risk | Priority | Fix |
| --- | --- | --- | --- | --- | --- |
| Contact/catering | `submitStorefrontContact` + honeypot field | Rate limit | High | Spam | **P0** | Edge rate limit + Turnstile optional |
| Structured forms | `StorefrontForm` model | Runtime binding | Medium | **P2** | Render dynamic forms from `fieldsJson` |

---

## 13. Preview & security

| Area | Current state | Missing | Risk | Priority | Fix |
| --- | --- | --- | --- | --- | --- |
| Draft access | Owner session sees unpublished | Token-based share preview | Low | Collaboration | **P2** | Signed preview token |
| Tenant isolation | Actions use `requireSessionUser` / slug lookup for public | Audit all storefront server actions | High | Data leak | **P0** | Quarterly security pass + automated tests |
| Secrets | Middleware uses `STOREFRONT_MIDDLEWARE_SECRET` | — | Low | — | **P0** | Keep documented in env checklist |

---

## 14. Mobile UX & performance

| Area | Current state | Missing | Risk | Priority | Fix |
| --- | --- | --- | --- | --- | --- |
| Mobile | Responsive layout, sticky checkout CTA partial | Sticky mini-cart | Low | Conversion | **P2** | Cart drawer |
| Performance | Mostly RSC | Image `next/image` on all storefront photos | Medium | LCP | **P1** | Replace raw `<img>` where remote patterns allow |

---

## 15. Accessibility

| Area | Current state | Missing | Risk | Priority | Fix |
| --- | --- | --- | --- | --- | --- |
| Forms | Labels on checkout | Inline error announcements | Medium | a11y | **P1** | `aria-live` regions |

---

## 16. Test coverage

| Area | Current state | Missing | Risk | Priority | Fix |
| --- | --- | --- | --- | --- | --- |
| Unit tests | Resolver, blackout, middleware path map | Checkout action tests (needs DB fixture) | Medium | Regression | **P1** | Prisma test DB + integration tests |
| E2E | Playwright script exists | Storefront smoke not in CI | Medium | Regressions | **P1** | Add smoke: home, menu, checkout |

---

## 17. Documentation

| Area | Current state | Missing | Risk | Priority | Fix |
| --- | --- | --- | --- | --- | --- |
| Operator docs | `STOREFRONT_*` set + FINAL supplements | Video walkthrough | Low | Onboarding | **P3** | Loom |

---

### Priority legend

- **P0** — fix before high-traffic customers (security, oversell, spam).
- **P1** — high value for revenue/ops within next sprint.
- **P2** — polish and scale.
- **P3** — later / nice-to-have.
