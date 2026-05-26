# Navigation Cleanup

## Changes in this pass

- Added **Error recovery** + **Data integrity** links to the Admin nav group (`lib/nav-config.ts`).
- Added i18n labels (`nav.errorRecovery`, `nav.dataIntegrity`).
- Expanded **STAFF** allow prefixes for operational reality (orders + recovery surfaces).

## Still recommended

- Business-mode hiding already exists via `KitchenModulePreference` + registry — extend with “recommended pack” toggles.
- Favorites / recents require client prefs (localStorage) + server sync — not implemented here.
