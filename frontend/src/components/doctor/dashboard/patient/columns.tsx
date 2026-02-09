"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors: Record<string, string> = {
        pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
        processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
        success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        failed: "bg-red-500/10 text-red-700 dark:text-red-400",
      };
      
      return (
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || ''}`}>
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-foreground hover:text-foreground hover:bg-accent"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right text-foreground">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium text-foreground">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end"
            className="bg-popover text-popover-foreground border-border"
          >
            <DropdownMenuLabel className="text-foreground">Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
              className="text-foreground focus:bg-accent focus:text-accent-foreground"
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-foreground focus:bg-accent focus:text-accent-foreground">
              View customer
            </DropdownMenuItem>
            <DropdownMenuItem className="text-foreground focus:bg-accent focus:text-accent-foreground">
              View payment details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];