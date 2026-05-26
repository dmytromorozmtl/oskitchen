# Catering Quote — Data Model

## Migration

`prisma/migrations/20260511235000_catering_quotes_command_center/migration.sql`

The migration is **additive**:

- Extends `CateringQuoteStatus` enum (Postgres `ALTER TYPE … ADD VALUE`).
- Adds new enums: `CateringEventType`, `CateringServiceStyle`,
  `CateringPricingMode`, `CateringQuoteLineType`,
  `CateringQuoteAuditEventType`, `CateringQuoteFollowUpStatus`.
- Adds many optional columns to `catering_quotes` and
  `catering_quote_items`; every new column either has a safe default or
  is nullable.
- Adds five new tables: `catering_quote_packages`,
  `catering_quote_events`, `catering_quote_versions`,
  `catering_proposal_views`, `catering_quote_followups`,
  `catering_quote_templates`.
- All migrations use `IF NOT EXISTS` / `EXCEPTION WHEN duplicate_object`
  guards so re-running the file is safe.

## Models (additive fields shown in bold)

### `CateringQuote` (`catering_quotes`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | unchanged |
| `userId` | uuid | unchanged — workspace scope |
| `customerName` / `customerEmail` / `companyName` | string | unchanged |
| `eventDate` | Date | unchanged |
| `guestCount` | int? | unchanged |
| `budget`, `notes` | Decimal / text | unchanged |
| `status` | `CateringQuoteStatus` | enum extended |
| `subtotal`, `tax`, `total` | Decimal | unchanged defaults |
| `publicToken` | string unique | unchanged |
| `createdAt`, `updatedAt` | Date | unchanged |
| **`customerId`** | uuid? FK `kitchen_customers` | CRM link |
| **`companyAccountId`** | uuid? FK `company_accounts` | |
| **`brandId`**, **`locationId`** | uuid? FK | multi-brand/location |
| **`quoteNumber`** | varchar(40) | unique with `userId` — `Q-YYYY-NNNN` |
| **`customerPhone`** | varchar(64) | |
| **`eventName`** | varchar(255) | |
| **`eventType`** | enum `CateringEventType` | default `CUSTOM` |
| **`serviceStyle`** | enum `CateringServiceStyle` | default `DROP_OFF` |
| **`pricingMode`** | enum `CateringPricingMode` | default `FIXED` |
| **`eventStartTime`**, **`eventEndTime`** | DateTime? | |
| **`eventAddressJson`** | JSON? | |
| **`deliveryRequired`**, **`setupRequired`**, **`staffingRequired`** | bool | |
| **`dietaryNotes`**, **`allergyNotes`** | text | surfaced everywhere |
| **`internalNotes`**, **`clientNotes`** | text | internal vs public |
| **`serviceFee/deliveryFee/setupFee/staffingFee/discount`** | Decimal | |
| **`estimatedCost`**, **`estimatedMargin`** | Decimal? | never public |
| **`validUntil`** | Date? | drives expiration |
| **`publicViewedAt`** | DateTime? | bumped on first view |
| **`acceptedAt`**, **`rejectedAt`** | DateTime? | |
| **`convertedOrderId`** | uuid? unique FK `orders` | duplicate conversion impossible |
| **`createdBy`** | varchar(255) | email of creator |

Indexes: `(userId)`, `(userId, status)`, `(customerId)`,
`(companyAccountId)`, `(brandId)`, `(locationId)`, `(eventDate)`,
`(customerEmail)`, unique `(userId, quoteNumber)`, unique
`(convertedOrderId)`.

### `CateringQuoteItem` (`catering_quote_items`)

| Field | Type | Notes |
|-------|------|-------|
| `id` / `quoteId` / `productId` / `title` / `description` / `quantity` / `unitPrice` / `total` / `createdAt` | unchanged |
| **`menuId`** | uuid? FK `menus` | |
| **`lineType`** | enum `CateringQuoteLineType` | default `FOOD` |
| **`unit`** | varchar(40) | e.g. `pp`, `ea`, `hr` |
| **`costEstimate`**, **`marginEstimate`** | Decimal? | private |
| **`sortOrder`** | int default 0 | drives display order |
| **`notes`** | text | |
| **`updatedAt`** | DateTime | `@updatedAt` |

Indexes: `(quoteId)`, `(quoteId, sortOrder)`, `(productId)`.

### New tables

- `catering_quote_packages` — optional bundles when pricing per-package.
- `catering_quote_events` — append-only audit log.
- `catering_quote_versions` — JSON snapshots with `versionNumber`.
- `catering_proposal_views` — public view audit (IP / UA hashed).
- `catering_quote_followups` — task-style follow-ups.
- `catering_quote_templates` — workspace templates.

## Back-relations added

- `UserProfile.cateringQuoteTemplates`
- `KitchenCustomer.cateringQuotes` (`CateringQuoteCustomer` relation)
- `KitchenCustomer.cateringQuoteFollowUps` (`CateringQuoteFollowUpCustomer`)
- `CompanyAccount.cateringQuotes`
- `Brand.cateringQuotes`
- `Location.cateringQuotes`
- `Order.cateringQuote` (`CateringQuoteConvertedOrder`)
- `Menu.cateringQuoteItems` (`CateringQuoteItemMenu`)
