# Platform QA checklist

Manual verification (automate in E2E later):

- [ ] Non-platform user hitting `/platform/dashboard` → redirected to `/dashboard`.
- [ ] `STANDARD_USER` platform row sees only read nav items.
- [ ] Founder email receives full nav and permissions.
- [ ] Support: customer reply creates `CUSTOMER` visibility comment and audit row.
- [ ] Support: internal note stays `INTERNAL`.
- [ ] Support: status change writes `STATUS_CHANGED` event + audit.
- [ ] Assignment validates UUID or clears assignee.
- [ ] Workspace detail loads for valid id; 404 for invalid.
- [ ] Global search requires 2+ chars; returns bounded results.
- [ ] `/platform/audit` shows only platform-scoped rows.
- [ ] Tools pages forbidden without `platform:tools:run`.
- [ ] Cmd/Ctrl+K navigates to `/platform/search`.

Build: `npm run typecheck` && `npm run build` (must pass in CI).
