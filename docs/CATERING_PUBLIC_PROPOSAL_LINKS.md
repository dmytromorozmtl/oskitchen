# Catering Public Proposal Links

## Route

`GET /quote/[token]`

Anonymous, read-only access to a quote, scoped by an opaque token. The
URL is shareable; no login is required.

## Security guarantees

The public page **never** exposes:

- internal notes
- cost estimates
- margin estimates
- internal `notes` field
- customer phone, customer list, or other CRM identifiers besides what's
  required to address the proposal (name, optional company)

It exposes only the fields listed in `PublicProposalPayload`
(`lib/catering/proposal-public-links.ts`).

## Token rotation & revocation

- **Rotate**: server action `rotateCateringPublicLinkAction` generates
  a new token (`randomBytes(24).toString("hex")`) and writes it to
  `CateringQuote.publicToken`. Old token immediately stops working.
- **Revoke**: server action `revokeCateringPublicLinkAction` rotates to
  a `revoked-<id>-<ts>` placeholder. The public page detects this
  prefix and shows a "this link has been revoked" message.

## Expiration

- `validUntil` is a date; when set and in the past, the public page
  renders the proposal but marks the badge as `Expired`. Status is also
  surfaced as `EXPIRED` in the payload regardless of the underlying
  enum value.

## View auditing

Each visit creates a `CateringProposalView` row with `viewedAt`,
sha256-hashed IP (`x-forwarded-for` / `x-real-ip`) and user agent. The
first visit also flips the quote status from `SENT` to `VIEWED` (if
applicable) and writes a `QUOTE_PROPOSAL_VIEWED` audit event.

## No fake integrations

There is no accept button, no e-signature, and no payment flow.
The proposal footer states: *"To accept or request changes, reply to
the caterer directly."* This will be replaced when real integrations
ship.
