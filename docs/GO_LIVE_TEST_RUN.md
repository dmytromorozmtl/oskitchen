# Go-live test run

Route: `/dashboard/go-live/test-run`

The test run creates a report and does not mutate orders or inventory.

Checks:
- open/test order count
- product mappings needing review
- active staff count
- open implementation tasks
- warnings for weak simulation coverage

Outputs:
- status: `PASSED`, `NEEDS_REVIEW`, or `FAILED`
- blockers
- warnings
- summary JSON for implementation reports
