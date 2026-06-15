import { importDemoWorkspaceFromForm } from "@/actions/demo";
import { Button } from "@/components/ui/button";

export function DemoImportForm({
  vertical,
  label = "Launch demo dashboard",
}: {
  vertical: string;
  label?: string;
}) {
  return (
    <form action={importDemoWorkspaceFromForm} className="inline">
      <input type="hidden" name="vertical" value={vertical} />
      <Button type="submit" variant="premium" className="rounded-full shadow-sm">
        {label}
      </Button>
    </form>
  );
}
