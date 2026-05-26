import { NewBrandWizard } from "@/components/brands/new-brand-wizard";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getBrandTemplateDefaults, parseBrandTemplateKey } from "@/lib/brands/brand-template-defaults";

export default async function NewBrandPage({
  searchParams,
}: {
  searchParams?: Promise<{ template?: string }>;
}) {
  await getTenantActor();
  const tpl = parseBrandTemplateKey((await searchParams)?.template);
  const templateHints = tpl ? getBrandTemplateDefaults(tpl) : null;

  return <NewBrandWizard templateHints={templateHints} />;
}
