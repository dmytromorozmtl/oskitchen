# Vendor registration flow — design spec

**Date:** 2026-06-02  
**Scope:** B2B HoReCa marketplace vendor onboarding (registration → verification → cabinet → first sale)  
**Primary routes:** `/vendor/register`, `/vendor/register/status`, `/vendor/*` cabinet  
**Implementation refs:** `components/marketplace/vendor-registration-form.tsx`, `services/marketplace/vendor-registration-service.ts`  
**Related:** [`docs/stripe-connect-vendor-test-plan.md`](./stripe-connect-vendor-test-plan.md) · Task 32 `e2e/vendor-registration.spec.ts`

---

## Executive summary

| Metric | Design target |
|--------|---------------|
| **Time to submit application** | ≤ 5 minutes (company + 1 document) |
| **Layout width** | `max-w-3xl` centered — matches `app/vendor/register/layout.tsx` |
| **Status clarity** | Single badge + honest copy per `VendorStatus` |
| **Post-approval path** | Status → Finance (Connect) → Products → Orders |
| **Sales-safe claim** | “Platform verification required before listing” — not instant go-live |

The flow is **workspace-scoped**: one vendor application per workspace. Platform ops approves via `/platform/marketplace/vendor-verification`.

---

## Personas

| Persona | Goal | Entry |
|---------|------|-------|
| **Supplier owner** | Register company, upload compliance docs | `/vendor/register` |
| **Supplier ops** | Check review status, update rejected application | `/vendor/register/status` |
| **Platform reviewer** | Approve / reject / request review | `/platform/marketplace/vendor-verification` |
| **Buyer (restaurant)** | Discover vendor catalog after approval | `/dashboard/marketplace/catalog` |

---

## End-to-end flow

```mermaid
flowchart LR
  A[Workspace owner] --> B[/vendor/register]
  B --> C{Submit application}
  C --> D[PENDING]
  D --> E[Platform queue]
  E --> F{Review}
  F -->|Approve| G[APPROVED]
  F -->|Reject| H[REJECTED]
  H --> B
  G --> I[/vendor/finance Connect]
  I --> J[/vendor/products/new]
  J --> K[Product moderation]
  K --> L[ACTIVE catalog]
  L --> M[Buyer checkout]
  M --> N[/vendor/orders]
```

### Vendor status state machine

| Status | User-visible label | Primary CTA | Badge variant |
|--------|-------------------|-------------|---------------|
| `PENDING` | Pending | View status | `secondary` |
| `UNDER_REVIEW` | Under review | View status | `secondary` |
| `APPROVED` | Approved | Open vendor cabinet | `default` |
| `REJECTED` | Rejected | Update application | `destructive` |
| `SUSPENDED` / `DEACTIVATED` | Suspended / Deactivated | Contact support | `destructive` |

Source: `lib/marketplace/vendor-registration-types.ts` → `vendorStatusLabel`, `vendorStatusBadgeVariant`.

---

## Information architecture

### Public registration shell (`app/vendor/register/layout.tsx`)

```
┌─────────────────────────────────────────────────────────────┐
│ OS KITCHEN MARKETPLACE          Register │ Status │ Buyer hub│
│ Vendor onboarding                                           │
├─────────────────────────────────────────────────────────────┤
│                     max-w-3xl content                       │
└─────────────────────────────────────────────────────────────┘
```

- Sticky top nav on mobile: collapse “Buyer hub” behind menu in future (P2).
- No dashboard sidebar — isolated onboarding chrome reduces distraction.

### Vendor cabinet shell (`app/vendor/(cabinet)/layout.tsx`)

Separate layout with vendor nav: Dashboard · Products · Orders · Finance · Settings.

---

## Screen mockups

Wireframes reflect **shipped UI** as of June 2026. Use for design QA, sales demos, and E2E selectors.

### 1. Registration — empty state (`/vendor/register`)

**File:** `app/vendor/register/page.tsx` + `VendorRegistrationForm`

```
┌─────────────────────────────────────────────────────────────┐
│ Become a marketplace vendor              [ View status ]    │
│ Submit company profile, compliance documents…               │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Company name          │ Legal name                      │ │
│ │ [ FreshPack Supply ]  │ [ FreshPack Supply LLC ]        │ │
│ ├───────────────────────┴─────────────────────────────────┤ │
│ │ Vendor type ▼         │ Country                         │ │
│ │ [ Distributor     ]   │ [ United States ]               │ │
│ ├───────────────────────┴─────────────────────────────────┤ │
│ │ Contact email         │ Contact phone                   │ │
│ │ [ ops@…           ]   │ [ +1 … ]                        │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Website  [ https://… ]                                  │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Compliance documents              [ + Add document ]    │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ [ w9.pdf        ] [ https://vault/… ]  [ 🗑 ]       │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ Upload to your storage and paste secure URLs…           │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │              ( Submit for verification )                │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Design notes**

- 2-column grid collapses to 1 col below `sm` (`sm:grid-cols-2`).
- Document rows: `sm:grid-cols-[1fr_1fr_auto]` — trash disabled when only one row.
- Required fields: company, legal, country, contact email.
- Honest copy: no fake “upload to OS Kitchen” — URL paste only until file upload ships.

### 2. Registration — success (`VendorRegistrationForm` post-submit)

```
┌─────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░  Application submitted                              ░░░░░ │
│ ░  Pending verification. Platform ops typically       ░░░░░ │
│ ░  reviews within 2–3 business days.                ░░░░░ │
│ ░                                                     ░░░░░ │
│ ░        ( View verification status )                 ░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────────────────────────┘
```

- Emerald border/fill: `border-emerald-500/30 bg-emerald-500/5`.
- Single primary CTA → `/vendor/register/status`.

### 3. Registration — duplicate application banner

When `PENDING` | `UNDER_REVIEW` | `APPROVED` already exists:

```
┌─────────────────────────────────────────────────────────────┐
│ Application already on file                                 │
│ Status: pending. View verification timeline →               │
└─────────────────────────────────────────────────────────────┘
```

Form hidden; prevents duplicate submissions (`vendor-registration-service.ts`).

### 4. Verification status (`/vendor/register/status`)

**File:** `app/vendor/register/status/page.tsx`

#### 4a. No application

```
┌─────────────────────────────────────────────────────────────┐
│         No vendor application                               │
│   Register your company to sell on the B2B marketplace      │
│              ( Start registration )                         │
└─────────────────────────────────────────────────────────────┘
```

Uses `EmptyState` — same pattern as marketplace empty states (Task 43).

#### 4b. Pending / under review

```
┌─────────────────────────────────────────────────────────────┐
│ Verification status              ( Update application )     │
│ FreshPack Supply Co. · submitted 6/2/2026                     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🕐  FreshPack Supply Co.              [ Pending ]       │ │
│ │     FreshPack Supply LLC                                │ │
│ │     Country: United States                              │ │
│ │     Contact: ops@freshpack.com                          │ │
│ │     Platform ops is reviewing your documents…           │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 4c. Approved

```
┌─────────────────────────────────────────────────────────────┐
│ Verification status              ( Open vendor cabinet )    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✓  FreshPack Supply Co.              [ Approved ]       │ │
│ │     Verified 6/4/2026, 2:30 PM                          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 4d. Rejected

- Destructive message: “Application was not approved. Update documents…”
- CTA: Update application → `/vendor/register` (resubmit resets to `PENDING`).

### 5. Platform verification queue (ops)

**Route:** `/platform/marketplace/vendor-verification`  
**File:** `MarketplaceVendorVerificationQueue`

```
┌─────────────────────────────────────────────────────────────┐
│ B2B MARKETPLACE · VENDOR ONBOARDING                          │
│ Vendor verification queue                                   │
├─────────────────────────────────────────────────────────────┤
│ Company          │ Type        │ Status   │ Actions          │
│ FreshPack Supply │ Distributor │ PENDING  │ [Review][Approve]│
│ Metro Foods      │ Manufacturer│ UNDER…   │ [Approve][Reject]│
└─────────────────────────────────────────────────────────────┘
```

Dark platform chrome (`text-zinc-200`). Requires `platform:organizations:write` to approve/reject.

### 6. Vendor cabinet gate (not approved)

**File:** `lib/marketplace/vendor-page-access.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│ Vendor not verified                                         │
│ Complete registration and wait for platform approval.       │
│   ( Verification status )    ( Register )                   │
└─────────────────────────────────────────────────────────────┘
```

Shown when accessing `/vendor/dashboard`, `/vendor/products`, etc. without `APPROVED` vendor row.

### 7. Post-approval — finance (Stripe Connect)

**Route:** `/vendor/finance`  
**Next step after approval** in E2E and [`stripe-connect-vendor-test-plan.md`](./stripe-connect-vendor-test-plan.md).

```
┌─────────────────────────────────────────────────────────────┐
│ Finance                                                     │
│ Available balance · pending · commission · payouts          │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│ │ Available    │ │ Pending      │ │ Connect      │          │
│ │ $0.00        │ │ $0.00        │ │ Not connected│          │
│ └──────────────┘ └──────────────┘ └──────────────┘          │
│              ( Connect payout account )                     │
└─────────────────────────────────────────────────────────────┘
```

**Honesty:** Connect disabled unless `MARKETPLACE_VENDOR_STRIPE_CONNECT=1`.

### 8. Post-approval — first product

**Route:** `/vendor/products/new`

```
┌─────────────────────────────────────────────────────────────┐
│ New product                                                 │
│ Name · SKU · Category · Base price · Images                 │
│              ( Save draft )  ( Submit for review )          │
└─────────────────────────────────────────────────────────────┘
```

Product must pass moderation before appearing in buyer catalog (`ACTIVE` status).

### 9. Buyer order loop (closure)

```
Buyer: /dashboard/marketplace/catalog → cart → checkout → PO
Vendor: /vendor/orders → View → fulfill
```

Documented for flow completeness; buyer UX is marketplace catalog design (Task 47+).

---

## Component & route map

| Step | Route | Component / service |
|------|-------|---------------------|
| Register form | `/vendor/register` | `VendorRegistrationForm` |
| Submit action | — | `submitMarketplaceVendorRegistrationAction` |
| Persist | — | `submitVendorRegistration` |
| Status | `/vendor/register/status` | Server page + status card |
| Platform review | `/platform/marketplace/vendor-verification` | `MarketplaceVendorVerificationQueue` |
| Cabinet access | `/vendor/*` | `resolveVendorCabinetAccess` |
| Finance | `/vendor/finance` | `VendorFinanceClient` |
| Products | `/vendor/products/new` | Vendor product form |
| Orders | `/vendor/orders` | `VendorDashboardClient` / orders list |

---

## Responsive behavior

| Breakpoint | Registration form | Status page |
|------------|-------------------|-------------|
| `< 640px` | Single-column fields; document row stacks | Full-width card |
| `≥ 640px` | 2-col company/legal, contact grid | Header actions wrap |
| `≥ 768px` | Same; nav links inline in header | Badge right-aligned |

**Mobile gap (P2):** Registration header nav (`Register | Status | Buyer hub`) can wrap on 320 px — consider hamburger in `register/layout.tsx`.

---

## Copy & tone guidelines

| Context | Do | Don’t |
|---------|----|-------|
| Review timeline | “Typically 2–3 business days” | “Instant approval” |
| Documents | “Paste secure URLs from your vault” | “We store all files securely” (until upload ships) |
| Rejection | “Update documents and contact support” | Blame or vague “denied” |
| Connect | “Connect payout account (Stripe Express)” | “Get paid instantly” (Task 116 roadmap) |

Align with sales-safe registry (Task 53) and [`docs/ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md) honesty rules.

---

## Accessibility checklist

| Element | Requirement | Status |
|---------|-------------|--------|
| Form labels | `<Label htmlFor>` on all inputs | ✅ Shipped |
| Submit button | Loading state + disabled when pending | ✅ |
| Status icon | Decorative; status in text + badge | ✅ |
| Badge | Color + text label (not color-only) | ✅ |
| Document delete | Icon button needs `aria-label` | ⚠️ P2 — add “Remove document” |

---

## E2E & QA alignment

| Check | Spec |
|-------|------|
| Submit application | `e2e/vendor-registration.spec.ts` — fills form, expects success banner |
| Approval gate | Skips Connect/products if not `APPROVED` (honest) |
| Finance smoke | Mocks Connect API; verifies “Available balance” copy |
| Migration gate | Skips if “Marketplace temporarily unavailable” |

---

## Design backlog (post-MVP)

| Priority | Item | Rationale |
|----------|------|-----------|
| P1 | **OnboardingStepper** on registration (reuse Task 45 component) | Steps: Profile → Documents → Review |
| P1 | Native file upload to S3/vault | Replace URL paste |
| P2 | Email notifications on status change | `contactEmail` already captured |
| P2 | Public `/vendor` recruitment landing (Task 65) | Funnel into `/vendor/register` |
| P2 | Timeline UI on status page (submitted → review → approved) | Replace single card |
| P3 | In-app document preview | Platform queue + vendor status |

---

## Related artifacts

| Doc / test | Purpose |
|------------|---------|
| `docs/stripe-connect-vendor-test-plan.md` | Post-approval payouts |
| `e2e/vendor-registration.spec.ts` | Full lifecycle E2E |
| `docs/vendor-seeding-strategy.md` | Task 55 — seed 3–5 vendors |
| `components/onboarding/onboarding-stepper.tsx` | Reusable progress UI (Task 45) |

---

## Changelog

| Date | Author | Notes |
|------|--------|-------|
| 2026-06-02 | 122-task executor (Task 46) | Initial flow design + ASCII mockups aligned to shipped UI |
