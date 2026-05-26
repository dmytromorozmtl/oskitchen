# Order import validation

Order CSV uploads create staged order rows under the import job.

Validation checks:
- missing customer email
- invalid fulfillment date
- missing product mapping
- duplicate order reference
- invalid or missing total
- pickup/delivery count and revenue preview

Staged statuses:
- `READY_TO_IMPORT`
- `NEEDS_MAPPING`
- `DUPLICATE`
- `ERROR`

Current implementation stages orders and reports impact. Final live insertion should be added only after product mappings, customer resolution, and fulfillment dates pass validation.
