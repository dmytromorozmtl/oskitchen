import { Button } from "@/components/ui/button";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("Button", Button);
export default meta;

export const Primary = { args: { children: "Save changes" } };
export const Destructive = { args: { children: "Void order", variant: "destructive" } };
export const Outline = { args: { children: "Cancel", variant: "outline" } };
