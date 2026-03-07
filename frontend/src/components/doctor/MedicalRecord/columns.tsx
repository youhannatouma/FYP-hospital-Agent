"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MedicalRecord = {
  id: string;
  name: string;
  patientId: string;
  lastVisit: string;
  diagnosis: string;
  status: "Active" | "Follow-up" | "Recovered" | "Inactive";
  // Optional detailed fields
  age?: number;
  gender?: string;
  bloodType?: string;
  phone?: string;
  email?: string;
  address?: string;
  height?: number; // in cm
  weight?: number; // in kg
  bloodPressure?: string;
  heartRate?: number; // bpm
  temperature?: number; // in °C
  medications?: string[];
  allergies?: string[];
  treatmentPlan?: string;
  notes?: string;
  nextAppointment?: string;
};

export const columns: ColumnDef<MedicalRecord>[] = [
  {
    accessorKey: "name",
    header: "Patient Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("");

      return (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <span className="font-semibold text-primary">{initials}</span>
          </div>
          <span className="font-medium text-foreground">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "patientId",
    header: "Patient ID",
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("patientId")}</div>
    ),
  },
  {
    accessorKey: "lastVisit",
    header: "Last Visit",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastVisit"));
      const formatted = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return <div className="text-muted-foreground">{formatted}</div>;
    },
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
    cell: ({ row }) => (
      <div className="text-foreground font-medium">
        {row.getValue("diagnosis")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      const statusConfig = {
        Active: {
          className:
            "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
        },
        "Follow-up": {
          className:
            "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
        },
        Recovered: {
          className: "bg-muted text-muted-foreground",
        },
        Inactive: {
          className:
            "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive-foreground",
        },
      };

      const config =
        statusConfig[status as keyof typeof statusConfig] ||
        statusConfig.Inactive;

      return (
        <div
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${config.className}`}
        >
          {status}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const record = row.original;

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent"
            title="View"
            onClick={() => console.log("View", record.id)}
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent"
            title="Edit"
            onClick={() => console.log("Edit", record.id)}
          >
            <Edit className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent"
            title="Download"
            onClick={() => console.log("Download", record.id)}
          >
            <Download className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      );
    },
  },
];
