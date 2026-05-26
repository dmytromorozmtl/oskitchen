# Kitchen Screen QA checklist

- [ ] `/dashboard/kitchen` loads with OWNER and STAFF accounts.
- [ ] Empty state: no work items → CTA to Production; STAFF copy mentions manager.
- [ ] Station tabs update URL and filter cards.
- [ ] Mode `rush` / `packing` / `my_tasks` (with staff email match) filter correctly.
- [ ] Fullscreen toggles overlay; `/dashboard/kitchen/fullscreen` redirects.
- [ ] Start → Ready → Pack handoff → Complete flow works; audit rows appear.
- [ ] Hold appends `[Hold] …` to notes and sets status HOLD; Resume clears to TO_PREP.
- [ ] Assign + assign-to-me updates assignee; REASSIGNED event created.
- [ ] Legacy cook/pack/label buttons still update tasks.
- [ ] Auto-refresh does not duplicate events on idle.
- [ ] `npm run typecheck` && `npm run build` pass.
