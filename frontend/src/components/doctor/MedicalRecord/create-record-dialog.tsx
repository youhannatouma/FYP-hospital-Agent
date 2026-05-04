// @ts-nocheck
"use client";
/* eslint-disable react-hooks/incompatible-library */

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MedicalRecord } from "./columns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreateRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: MedicalRecord | null;
  onSuccess?: (record: Partial<MedicalRecord>) => void;
}

export function CreateRecordDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
}: CreateRecordDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = !!record;

  const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<MedicalRecord>>({
    defaultValues: record || {
      status: "Active",
      gender: "Male",
      bloodType: "A+",
    },
  });

  useEffect(() => {
    if (open) {
      if (record) {
        reset(record);
      } else {
        reset({
          status: "Active",
          gender: "Male",
          bloodType: "A+",
          name: "",
          patientId: "",
          diagnosis: "",
          age: undefined,
          phone: "",
          email: "",
          address: "",
          height: undefined,
          weight: undefined,
          bloodPressure: "",
          heartRate: undefined,
          temperature: undefined,
          medications: [],
          allergies: [],
          treatmentPlan: "",
          notes: "",
        });
      }
    }
  }, [open, record, reset]);

  const onSubmit = (data: Partial<MedicalRecord>) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: isEditing ? "Record Updated" : "Record Created",
        description: `Medical record for ${data.name} has been ${isEditing ? "updated" : "created"} successfully.`,
      });
      onSuccess?.(data);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[100vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {isEditing ? "Edit Medical Record" : "Add New Medical Record"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[calc(90vh-180px)] pr-4 py-4">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Patient Name</Label>
                  <Input id="name" {...register("name", { required: true })} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input id="patientId" {...register("patientId", { required: true })} placeholder="P-2024-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" {...register("age")} placeholder="45" />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select 
                    defaultValue={watch("gender") || "Male"} 
                    onValueChange={(val) => setValue("gender", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Medical Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input id="diagnosis" {...register("diagnosis", { required: true })} placeholder="e.g. Hypertension" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      defaultValue={watch("status") || "Active"} 
                      onValueChange={(val: unknown) => setValue("status", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Recovered">Recovered</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Type</Label>
                    <Select 
                      defaultValue={watch("bloodType") || "A+"} 
                      onValueChange={(val) => setValue("bloodType", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Vitals */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodPressure">BP (mmHg)</Label>
                  <Input id="bloodPressure" {...register("bloodPressure")} placeholder="120/80" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heartRate">HR (bpm)</Label>
                  <Input id="heartRate" type="number" {...register("heartRate")} placeholder="72" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temp (°C)</Label>
                  <Input id="temperature" type="number" step="0.1" {...register("temperature")} placeholder="36.6" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentPlan">Treatment Plan</Label>
                <Textarea 
                  id="treatmentPlan" 
                  {...register("treatmentPlan")} 
                  placeholder="Describe the treatment plan..." 
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea 
                  id="notes" 
                  {...register("notes")} 
                  placeholder="Any additional observations..." 
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Record" : "Create Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
