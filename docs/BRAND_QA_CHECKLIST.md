# Brand QA checklist

Manual regression after brand work:

- [ ] Create brand via hub quick form (name/slug/color/description).  
- [ ] Create brand via wizard; verify redirect to detail page.  
- [ ] Create from each template link; verify defaults pre-fill wizard.  
- [ ] Edit identity fields; reload detail → values persist.  
- [ ] Toggle lifecycle (draft/active/paused/archived).  
- [ ] Open brand reports with orders present + absent.  
- [ ] Assignment page counts match SQL expectations on sample data.  
- [ ] Brand switcher hidden with 0–1 brands; visible with 2+; persists refresh.  
- [ ] `workspace.moroz@gmail.com` still accesses all modules (platform bypass).  
- [ ] Legacy rows without `brandId` still load menus/products/orders/storefront.  
- [ ] No unexpected DB drops (migration is additive / enum swap only).

Automated:

- [ ] `npm run typecheck`  
- [ ] `npm run build`
