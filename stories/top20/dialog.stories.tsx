import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("Dialog", Dialog);
export default meta;

export const ConfirmVoid = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button variant="destructive">Void ticket</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Void this order?</DialogTitle>
          <DialogDescription>KDS and reporting will mark the ticket voided.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};
