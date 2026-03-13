"use client";

import { toast } from "@/hooks/use-toast";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, User, Mail, Calendar } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type Patient = {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending";
  email: string;
  lastVisit: string;
  avatar?: string;
};

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-black text-[10px] uppercase tracking-widest hover:bg-transparent p-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Subject
        <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />
      </Button>
    ),
    cell: ({ row }) => {
      const patient = row.original;
      const initials = patient.name.split(' ').map(n => n[0]).join('');
      return (
        <div className="flex items-center gap-3 py-1">
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-black text-sm text-foreground tracking-tight leading-none mb-1">{patient.name}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-50">ID: {patient.id.slice(0, 8)}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <span className="font-black text-[10px] uppercase tracking-widest">Protocol Status</span>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge className={cn(
          "border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg",
          status === "active" ? "bg-emerald-500/10 text-emerald-500" :
          status === "pending" ? "bg-amber-500/10 text-amber-500" :
          "bg-muted text-muted-foreground"
        )}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "email",
    header: () => <span className="font-black text-[10px] uppercase tracking-widest">Contact Information</span>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground tabular-nums">
        <Mail className="h-3 w-3 opacity-30" />
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "lastVisit",
    header: () => <span className="font-black text-[10px] uppercase tracking-widest text-right block">Recent Activity</span>,
    cell: ({ row }) => (
      <div className="text-right text-xs font-bold text-foreground/70 uppercase tracking-tighter tabular-nums flex items-center justify-end gap-2">
        <Calendar className="h-3 w-3 opacity-30" />
        {row.getValue("lastVisit")}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/50 rounded-lg">
                <MoreHorizontal className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border/50 p-1">
              <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest opacity-50 px-2 py-1.5">Administrative Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                className="rounded-lg font-bold text-xs"
                onClick={() => toast({ title: "Opening Record", description: `Viewing record for ${patient.name}` })}
              >View Patient Record</DropdownMenuItem>
              <DropdownMenuItem 
                className="rounded-lg font-bold text-xs text-primary"
                onClick={() => toast({ title: "Scheduling Session", description: `Initializing calendar for ${patient.name}` })}
              >Schedule Session</DropdownMenuItem>
              <DropdownMenuItem 
                className="rounded-lg font-bold text-xs"
                onClick={() => toast({ title: "Modifying Subject Data", description: `Opening edit form for ${patient.name}` })}
              >Modify Subject Data</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

