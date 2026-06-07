import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("Sheet", Sheet);
export default meta;

export const NavDrawer = {
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>FOH · BOH · Finance shortcuts</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};
