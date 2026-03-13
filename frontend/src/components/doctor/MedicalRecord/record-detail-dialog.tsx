"use client";

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
                {record.name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Patient ID: {record.patientId}
                </span>
                <Badge className={statusConfig[record.status]}>
                  {record.status}
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
                <InfoItem label="Age" value={record.age?.toString()} />
                <InfoItem label="Gender" value={record.gender} />
                <InfoItem label="Blood Type" value={record.bloodType} />
                <InfoItem label="Phone" value={record.phone} />
                <InfoItem label="Email" value={record.email} />
                <InfoItem label="Address" value={record.address} fullWidth />
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Vitals */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Vital Signs
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <InfoItem
                  label="Height"
                  value={record.height ? `${record.height} cm` : undefined}
                />
                <InfoItem
                  label="Weight"
                  value={record.weight ? `${record.weight} kg` : undefined}
                />
                <InfoItem label="Blood Pressure" value={record.bloodPressure} />
                <InfoItem
                  label="Heart Rate"
                  value={record.heartRate ? `${record.heartRate} bpm` : undefined}
                />
                <InfoItem
                  label="Temperature"
                  value={record.temperature ? `${record.temperature}°C` : undefined}
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
                  <p className="text-foreground mt-1">{record.diagnosis}</p>
                </div>

                {record.medications && record.medications.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Current Medications
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {record.medications.map((med, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                        >
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {record.allergies && record.allergies.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Known Allergies
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {record.allergies.map((allergy, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                        >
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {record.treatmentPlan && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Treatment Plan
                    </label>
                    <p className="text-foreground mt-1 whitespace-pre-line">
                      {record.treatmentPlan}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Notes & Appointments */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Notes & Appointments
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    label="Last Visit"
                    value={formatDate(record.lastVisit)}
                  />
                  <InfoItem
                    label="Next Appointment"
                    value={record.nextAppointment ? formatDate(record.nextAppointment) : undefined}
                  />
                </div>

                {record.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Additional Notes
                    </label>
                    <p className="text-foreground mt-1 whitespace-pre-line bg-muted/30 p-3 rounded-lg">
                      {record.notes}
                    </p>
                  </div>
                )}
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
