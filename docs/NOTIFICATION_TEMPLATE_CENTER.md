# Template Center

## System templates

All templates ship in `lib/notifications/template-registry.ts`. There
are currently 22 system templates across the categories:

- `GUEST_TRANSACTIONAL` — order_confirmation, order_updated,
  order_cancelled, order_ready, pickup_reminder, delivery_reminder,
  payment_request, catering_quote_sent.
- `GUEST_REMINDER` — preorder_deadline_reminder, weekly_menu_reminder,
  catering_quote_followup, meal_plan_cycle_reminder.
- `INTERNAL_ALERT` — new_order, failed_webhook, unmapped_product,
  production_blocker, packing_issue, failed_delivery, ingredient_shortage,
  purchase_order_overdue.
- `GO_LIVE` — go_live_blocker.
- `STAFF_TASK` — task_overdue.
- `BILLING` — billing_issue.

## Variables

Templates declare their variables with examples and a `required` flag.
The renderer fills missing values with empty strings and reports them
in `missingVariables`. Required variables surface as a warning.

Standard variable keys: `customer_name`, `order_number`, `pickup_date`,
`pickup_window`, `delivery_window`, `business_name`, `storefront_url`,
`support_email`, `menu_name`, `deadline`, `quote_number`, `event_date`,
`total`, `reason`, `link`.

## Per-workspace overrides

`NotificationTemplate` stores per-workspace overrides keyed by
`(user_id, template_key, brand_id, location_id)`. When an override
exists, the renderer uses its subject / bodyHtml / bodyText.

## Preview

`previewTemplate(key)` returns rendered subject, HTML, and text using
each variable's `example`. The Template tab renders the HTML preview
inline in a sandboxed `<details>` block.

## Test send

`sendTestEmailAction` renders the template with example values and
sends a single email to the operator's chosen recipient. The send is
gated by `canSendEmails()` *and* the `send_test_email` capability. The
log row is tagged `triggerType = TEST_EMAIL`.
