# Data migration checklist

Required before import:
- Product/menu CSV with title, SKU, price, prepared date.
- Customer CSV with email, name, phone.
- Order CSV with order number, customer email, total, fulfillment date.
- Ingredient CSV if costing/inventory is in scope.
- Staff list for training.

Validation:
- Confirm headers match templates.
- Remove duplicate customer rows where possible.
- Resolve missing prices and dates.
- Review product mapping queue.
- Stage orders before production import.

Launch rule: no live import with unresolved row errors.
