# Menu QA checklist

- [ ] Existing weekly menu: create, edit dates, drag reorder, duplicate, delete (non-prod).  
- [ ] Active toggle still exclusive; error when end date in past.  
- [ ] Meal prep: page title “Weekly menus”; empty state meal-prep copy.  
- [ ] Bar: page title “Drinks & events menu”; empty state bar copy.  
- [ ] Wizard: each strategy selectable; creates menu with correct `strategy` column.  
- [ ] Templates: each template applies; Starter plan limit redirects with `?error=limit`.  
- [ ] Detail page loads for owned menu; 404 for other user.  
- [ ] Storefront link label changes when `activeMenuId` matches.  
- [ ] `npm run typecheck` / `npm run build` green.
