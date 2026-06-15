import { Badge } from "@/components/ui/badge";

export function LocationBadge({ name }: { name: string | null | undefined }) {
  if (!name) return <Badge variant="outline" className="rounded-full">Unassigned</Badge>;
  return <Badge variant="secondary" className="rounded-full">{name}</Badge>;
}
