"use client";

import { STOREFRONT_SECTION_PACKS } from "@/lib/storefront/section-packs";
import {
  addStorefrontSectionPackFormAction,
  duplicateStorefrontSectionFormAction,
} from "@/actions/storefront-pages";
import { Button } from "@/components/ui/button";

export function SectionLibraryToolbar({ sectionId }: { sectionId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={duplicateStorefrontSectionFormAction}>
        <input type="hidden" name="sectionId" value={sectionId} />
        <Button type="submit" size="sm" variant="outline" className="rounded-full">
          Duplicate
        </Button>
      </form>
    </div>
  );
}

export function SectionPackInsertForm({ pageId }: { pageId: string }) {
  return (
    <form action={addStorefrontSectionPackFormAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="pageId" value={pageId} />
      <select name="packId" className="flex h-9 min-w-[180px] rounded-xl border border-input bg-background px-3 text-sm" defaultValue="hero_cta">
        {STOREFRONT_SECTION_PACKS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="secondary" className="rounded-full">
        Insert pack
      </Button>
    </form>
  );
}
