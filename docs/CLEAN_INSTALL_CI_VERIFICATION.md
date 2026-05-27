# Clean install / CI verification

## Script

`npm run verify:install-chain` → `scripts/verify-clean-install-chain.ts`

## Checks (non-destructive)

- `package.json` `postinstall` references `ensure-object-inspect-shim.cjs`.
- Shim script file exists.
- `node_modules/object-inspect/util.inspect.js` exists after install (WARN if `node_modules` missing).
- `require.resolve("qs")` and `require.resolve("stripe")` from project root.
- `require.resolve` for `date-fns`, `zustand`, `next`, and `typescript` package manifests (catches corrupt/partial `node_modules` before typecheck).
- Vitest/Vite runner manifests (`suppress-warnings.cjs`, `chai`, nested `picomatch`, etc.).

## Recommended CI / clean machine flow

```bash
rm -rf node_modules
npm ci   # or npm install
npm run verify:install-chain
npm run build
```

## Notes

- Script does **not** run `npm install` or mutate lockfiles.
- Node may print `DEP0205` deprecation from loader — not hidden; investigate separately if noisy in CI logs.
