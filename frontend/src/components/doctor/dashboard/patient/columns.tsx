"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye, Pill, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import * as React from "react";
import { PatientProfileDialog } from "../../dialogs/patient-profile-dialog";
import { PrescriptionDialog } from "../../dialogs/prescription-dialog";

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  lastVisit: string;
  email: string;
  status: string;
};

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "age",
    header: "Age",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "condition",
    header: "Condition",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant="outline" className={
          status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
          status === "Recovering" ? "bg-primary/10 text-primary border-primary/20" :
          "bg-amber-500/10 text-amber-600 border-amber-500/20"
        }>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastVisit",
    header: "Last Visit",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original;
      const [isProfileOpen, setIsProfileOpen] = React.useState(false);
      const [isPrescriptionOpen, setIsPrescriptionOpen] = React.useState(false);

      return (
        <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
              <Eye className="h-4 w-4" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setIsPrescriptionOpen(true)}>
              <Pill className="h-4 w-4" /> New Prescription
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <MessageSquare className="h-4 w-4" /> Send Message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <PatientProfileDialog 
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          patient={patient}
        />

        <PrescriptionDialog 
          open={isPrescriptionOpen}
          onOpenChange={setIsPrescriptionOpen}
          patient={patient}
        />
        </>
      );
    },
  },
];
