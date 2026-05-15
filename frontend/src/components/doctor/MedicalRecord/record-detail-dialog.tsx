"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MedicalRecord } from "./columns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, Edit, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecordDetailDialogProps {
  record: MedicalRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (record: MedicalRecord) => void;
  onDownload?: (record: MedicalRecord) => void;
}

export function RecordDetailDialog({
  record,
  open,
  onOpenChange,
  onEdit,
  onDownload,
}: RecordDetailDialogProps) {
  if (!record) return null;

  const statusConfig = {
    Active: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    "Follow-up": "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    Recovered: "bg-muted text-muted-foreground",
    Inactive: "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive-foreground",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card border-border max-h-[90vh]">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {record.patient_name || "Unknown Patient"}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Patient ID: {record.patient_id}
                </span>
                <Badge className="bg-primary/10 text-primary border-none">
                  {record.record_type}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(record)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload?.(record)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6">
            {/* Patient Information */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Patient Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Doctor" value={record.doctor_name || "Self-recorded"} />
                <InfoItem label="Type" value={record.record_type} />
                <InfoItem label="Created" value={record.created_at ? formatDate(record.created_at) : "N/A"} />
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Vitals */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Vital Signs
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <InfoItem label="Systolic" value={record.vitals?.systolic?.toString()} />
                <InfoItem label="Diastolic" value={record.vitals?.diastolic?.toString()} />
                <InfoItem
                  label="Heart Rate"
                  value={record.vitals?.heart_rate ? `${record.vitals.heart_rate} bpm` : undefined}
                />
                <InfoItem
                  label="Temperature"
                  value={record.vitals?.temperature ? `${record.vitals.temperature}°C` : undefined}
                />
                 <InfoItem
                  label="Oxygen"
                  value={record.vitals?.oxygen ? `${record.vitals.oxygen}%` : undefined}
                />
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Medical History */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Medical Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Diagnosis
                  </label>
                  <p className="text-foreground mt-1">{record.diagnosis || "No diagnosis provided"}</p>
                </div>

                {record.treatment && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Treatment Plan
                    </label>
                    <p className="text-foreground mt-1 whitespace-pre-line">
                      {record.treatment}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Clinical Notes
              </h3>
              <div className="space-y-4">
                {record.clinical_notes && (
                  <div>
                    <p className="text-foreground mt-1 whitespace-pre-line bg-muted/30 p-3 rounded-lg">
                      {record.clinical_notes}
                    </p>
                  </div>
                )}
                {!record.clinical_notes && <p className="text-muted-foreground italic">No clinical notes available.</p>}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface InfoItemProps {
  label: string;
  value?: string;
  fullWidth?: boolean;
}

function InfoItem({ label, value, fullWidth = false }: InfoItemProps) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <p className="text-foreground mt-1">
        {value || <span className="text-muted-foreground">Not provided</span>}
      </p>
    </div>
  );
}
