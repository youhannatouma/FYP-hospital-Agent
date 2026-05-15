"use client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MedicalRecord } from "./columns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface MedicalRecordFormProps {
  readonly onAddRecord: (record: Omit<MedicalRecord, "id">) => void;
}

export function MedicalRecordForm({ onAddRecord }: MedicalRecordFormProps) {
  const [open, setOpen] = useState(false);
  const [lastVisitDate, setLastVisitDate] = useState<Date>();
  const [nextAppointmentDate, setNextAppointmentDate] = useState<Date>();
  const [medications, setMedications] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [currentMedication, setCurrentMedication] = useState("");
  const [currentAllergy, setCurrentAllergy] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    patientId: "",
    age: "",
    gender: "",
    bloodType: "",
    phone: "",
    email: "",
    address: "",
    height: "",
    weight: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    diagnosis: "",
    status: "Active" as "Active" | "Follow-up" | "Recovered" | "Inactive",
    treatmentPlan: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!lastVisitDate) {
      toast({ title: "Validation Error", description: "Please select a date for the last visit", variant: "destructive" });
      return;
    }

    const newRecord: Omit<MedicalRecord, "id"> = {
      patient_name: formData.name,
      patient_id: formData.patientId,
      date: format(lastVisitDate, "yyyy-MM-dd"),
      diagnosis: formData.diagnosis,
      title: `Consultation - ${formData.diagnosis}`,
      record_type: "Consultation",
      doctor_id: null, // Will be set by backend
      description: formData.notes || null,
      clinical_notes: formData.treatmentPlan || null,
      treatment: formData.treatmentPlan || null,
      file_url: null,
      vitals: {
        age: formData.age ? Number.parseInt(formData.age, 10) : undefined,
        gender: formData.gender || undefined,
        blood_type: formData.bloodType || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        height: formData.height ? Number.parseFloat(formData.height) : undefined,
        weight: formData.weight ? Number.parseFloat(formData.weight) : undefined,
        blood_pressure: formData.bloodPressure || undefined,
        heart_rate: formData.heartRate ? Number.parseInt(formData.heartRate, 10) : undefined,
        temperature: formData.temperature ? Number.parseFloat(formData.temperature) : undefined,
      },
      metadata: {
        status: formData.status,
        next_appointment: nextAppointmentDate ? format(nextAppointmentDate, "yyyy-MM-dd") : undefined,
        medications: medications.length > 0 ? medications : undefined,
        allergies: allergies.length > 0 ? allergies : undefined,
      },
      created_at: new Date().toISOString(),
    };

    onAddRecord(newRecord);
    toast({ title: "Record Added", description: "New medical record created successfully." });

    // Reset form
    setFormData({
      name: "",
      patientId: "",
      age: "",
      gender: "",
      bloodType: "",
      phone: "",
      email: "",
      address: "",
      height: "",
      weight: "",
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      diagnosis: "",
      status: "Active",
      treatmentPlan: "",
      notes: "",
    });
    setLastVisitDate(undefined);
    setNextAppointmentDate(undefined);
    setMedications([]);
    setAllergies([]);
    setOpen(false);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addMedication = () => {
    if (currentMedication.trim()) {
      setMedications([...medications, currentMedication.trim()]);
      setCurrentMedication("");
    }
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const addAllergy = () => {
    if (currentAllergy.trim()) {
      setAllergies([...allergies, currentAllergy.trim()]);
      setCurrentAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-card border-border max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add New Medical Record
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add comprehensive patient information to the system.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Details */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Patient Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Patient Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="bg-background border-input text-foreground"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientId" className="text-foreground">
                    Patient ID *
                  </Label>
                  <Input
                    id="patientId"
                    value={formData.patientId}
                    onChange={(e) => handleChange("patientId", e.target.value)}
                    className="bg-background border-input text-foreground"
                    placeholder="P-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-foreground">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className="bg-background border-input text-foreground"
                    placeholder="35"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-foreground">
                    Gender
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange("gender", value)}
                  >
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="bg-background border-input text-foreground"
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="bg-background border-input text-foreground"
                    placeholder="patient@example.com"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address" className="text-foreground">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="bg-background border-input text-foreground"
                    placeholder="123 Main Street, City, Country"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Vitals */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Vital Signs
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-foreground">
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    className="bg-background border-input text-foreground"
                    placeholder="175"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-foreground">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    className="bg-background border-input text-foreground"
                    placeholder="70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType" className="text-foreground">
                    Blood Type
                  </Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(value) => handleChange("bloodType", value)}
                  >
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
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
                <div className="space-y-2">
                  <Label htmlFor="bloodPressure" className="text-foreground">
                    Blood Pressure
                  </Label>
                  <Input
                    id="bloodPressure"
                    value={formData.bloodPressure}
                    onChange={(e) => handleChange("bloodPressure", e.target.value)}
                    className="bg-background border-input text-foreground"
                    placeholder="120/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heartRate" className="text-foreground">
                    Heart Rate (bpm)
                  </Label>
                  <Input
                    id="heartRate"
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) => handleChange("heartRate", e.target.value)}
                    className="bg-background border-input text-foreground"
                    placeholder="72"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="text-foreground">
                    Temperature (°C)
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => handleChange("temperature", e.target.value)}
                    className="bg-background border-input text-foreground"
                    placeholder="37.0"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Medical Information */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Medical Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis" className="text-foreground">
                      Diagnosis *
                    </Label>
                    <Input
                      id="diagnosis"
                      value={formData.diagnosis}
                      onChange={(e) => handleChange("diagnosis", e.target.value)}
                      className="bg-background border-input text-foreground"
                      placeholder="Hypertension"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-foreground">
                      Status *
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: string) => handleChange("status", value)}
                    >
                      <SelectTrigger className="bg-background border-input text-foreground">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Recovered">Recovered</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Medications */}
                <div className="space-y-2">
                  <Label className="text-foreground">Current Medications</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentMedication}
                      onChange={(e) => setCurrentMedication(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMedication();
                        }
                      }}
                      className="bg-background border-input text-foreground"
                      placeholder="Enter medication name"
                    />
                    <Button
                      type="button"
                      onClick={addMedication}
                      variant="outline"
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {medications.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {medications.map((med, index) => (
                        <div
                          key={med}
                          className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-1 rounded-md text-sm"
                        >
                          {med}
                          <button
                            type="button"
                            onClick={() => removeMedication(index)}
                            title={`Remove ${med}`}
                            className="hover:bg-blue-500/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Allergies */}
                <div className="space-y-2">
                  <Label className="text-foreground">Known Allergies</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentAllergy}
                      onChange={(e) => setCurrentAllergy(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAllergy();
                        }
                      }}
                      className="bg-background border-input text-foreground"
                      placeholder="Enter allergy"
                    />
                    <Button
                      type="button"
                      onClick={addAllergy}
                      variant="outline"
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {allergies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {allergies.map((allergy, index) => (
                        <div
                          key={allergy}
                          className="flex items-center gap-1 bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-2 py-1 rounded-md text-sm"
                        >
                          {allergy}
                          <button
                            type="button"
                            onClick={() => removeAllergy(index)}
                            title={`Remove ${allergy}`}
                            className="hover:bg-red-500/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatmentPlan" className="text-foreground">
                    Treatment Plan
                  </Label>
                  <Textarea
                    id="treatmentPlan"
                    value={formData.treatmentPlan}
                    onChange={(e) => handleChange("treatmentPlan", e.target.value)}
                    className="bg-background border-input text-foreground min-h-[80px]"
                    placeholder="Describe the treatment plan..."
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Appointments & Notes */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Appointments & Notes
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Last Visit *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background border-input text-foreground",
                            !lastVisitDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {lastVisitDate ? format(lastVisitDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover border-border">
                        <Calendar
                          mode="single"
                          selected={lastVisitDate}
                          onSelect={setLastVisitDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Next Appointment</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background border-input text-foreground",
                            !nextAppointmentDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {nextAppointmentDate ? format(nextAppointmentDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover border-border">
                        <Calendar
                          mode="single"
                          selected={nextAppointmentDate}
                          onSelect={setNextAppointmentDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-foreground">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    className="bg-background border-input text-foreground min-h-[100px]"
                    placeholder="Any additional notes about the patient..."
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Add Record
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
