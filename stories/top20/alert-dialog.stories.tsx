import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("AlertDialog", AlertDialog);
export default meta;

export const CloseShift = {
  render: () => (
    <AlertDialog defaultOpen>
      <AlertDialogTrigger asChild>
        <Button>Close shift</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close POS shift?</AlertDialogTitle>
          <AlertDialogDescription>Unsynced offline sales will remain queued.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Close shift</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
