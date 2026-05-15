"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MedicalRecord } from "@/lib/services/repositories/medical-record-repository";

export type { MedicalRecord };

export const columns: ColumnDef<MedicalRecord>[] = [
  {
    accessorKey: "patient_name",
    header: "Patient Name",
    cell: ({ row }) => {
      const name = row.getValue("patient_name") as string || "Unknown Patient";
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
    accessorKey: "patient_id",
    header: "Patient ID",
    cell: ({ row }) => (
      <div className="text-muted-foreground font-mono text-xs">{row.getValue("patient_id")}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const dateVal = row.getValue("created_at") as string;
      if (!dateVal) return <div className="text-muted-foreground">N/A</div>;
      const date = new Date(dateVal);
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
        {row.getValue("diagnosis") || "Medical Consultation"}
      </div>
    ),
  },
  {
    accessorKey: "record_type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("record_type") as string;

      return (
        <div
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-primary/10 text-primary`}
        >
          {type}
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
