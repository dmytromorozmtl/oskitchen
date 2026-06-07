import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("Table", Table);
export default meta;

export const Orders = {
  render: () => (
    <Table className="w-[420px]">
      <TableHeader>
        <TableRow>
          <TableHead>Ticket</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>#1042</TableCell>
          <TableCell>POS</TableCell>
          <TableCell className="text-right tabular-nums">$24.50</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>#1043</TableCell>
          <TableCell>Shopify</TableCell>
          <TableCell className="text-right tabular-nums">$18.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
