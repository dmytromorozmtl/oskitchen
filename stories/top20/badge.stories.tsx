import { Badge } from "@/components/ui/badge";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("Badge", Badge);
export default meta;

export const Default = { args: { children: "Connected" } };
export const Secondary = { args: { children: "Demo workspace", variant: "secondary" } };
export const Destructive = { args: { children: "Sync failed", variant: "destructive" } };
