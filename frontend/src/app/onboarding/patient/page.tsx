"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  User,
  MapPin,
  Phone,
  Droplet,
  Stethoscope,
  AlertCircle,
  Pill,
  History,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Plus,
  Trash2,
  ShieldCheck,
  Languages,
  Bell,
  Sparkles,
  Calendar,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from "framer-motion";
import { useHospital } from "@/hooks/use-hospital";

// Steps:
// 1. Account (Completed via Clerk)
// 2. Verification (Completed via Clerk)
// 3. Personal Info
// 4. Medical History + Submit

export default function PatientOnboarding() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { admin } = useHospital();
  const { toast } = useToast();
  const [step, setStep] = React.useState(3);
  const [progress, setProgress] = React.useState(25);

  // Form State
  const [formData, setFormData] = React.useState({
    dob: "",
    gender: "",
    bloodType: "",
    phone: "",
    address: { street: "", city: "", state: "", zip: "" },
    emergencyContact: { name: "", phone: "" },
    chronicDiseases: [] as string[],
    allergies: {
      drug: [] as string[],
      food: [] as string[],
      env: [] as string[],
    },
    medications: [] as { name: string; dosage: string; freq: string }[],
    insurance: { provider: "", policy: "" },
    language: "English",
    notifications: ["Email"],
    doctorGender: "No Preference",
  });

  // Display step: internal 3-4 → user sees 1-2
  const displayStep = step - 2;
  const totalDisplaySteps = 2;

  // Helper to update progress using display step
  React.useEffect(() => {
    setProgress((displayStep / totalDisplaySteps) * 100);
  }, [step, displayStep]);

  // Restore form data from sessionStorage on mount
  React.useEffect(() => {
    const saved = sessionStorage.getItem("patient_onboarding_form");
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Restore step from sessionStorage on mount
  React.useEffect(() => {
    const savedStep = sessionStorage.getItem("patient_onboarding_step");
    if (savedStep) {
      const n = parseInt(savedStep);
      if (n >= 3 && n <= 4) setStep(n);
    }
  }, []);

  // Save form data to sessionStorage on every change
  React.useEffect(() => {
    sessionStorage.setItem("patient_onboarding_form", JSON.stringify(formData));
  }, [formData]);

  // Save current step to sessionStorage
  React.useEffect(() => {
    sessionStorage.setItem("patient_onboarding_step", String(step));
  }, [step]);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 3));

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6 md:p-12">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header & Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Activity className="h-6 w-6" />
              <span className="font-black tracking-tighter text-xl">Care</span>
            </div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Step {displayStep} of {totalDisplaySteps}
            </div>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-muted transition-all duration-500"
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 3 && (
            <m.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Personal Details
                </h1>
                <p className="text-muted-foreground">
                  This information helps us tailor your health dashboard.
                </p>
              </div>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" /> Date of
                        Birth
                      </Label>
                      <Input
                        type="date"
                        value={formData.dob}
                        onChange={(e) =>
                          setFormData({ ...formData, dob: e.target.value })
                        }
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(val) =>
                          setFormData({ ...formData, gender: val })
                        }
                      >
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="private">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-destructive" /> Blood
                        Type
                      </Label>
                      <Select
                        value={formData.bloodType}
                        onValueChange={(val) =>
                          setFormData({ ...formData, bloodType: val })
                        }
                      >
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "A+",
                            "A-",
                            "B+",
                            "B-",
                            "AB+",
                            "AB-",
                            "O+",
                            "O-",
                            "Unknown",
                          ].map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" /> Phone Number
                      </Label>
                      <Input
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <Label className="text-lg font-bold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" /> Residential
                      Address
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Street Address"
                        className="rounded-xl h-11"
                        value={formData.address.street}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              street: e.target.value,
                            },
                          })
                        }
                      />
                      <Input
                        placeholder="City"
                        className="rounded-xl h-11"
                        value={formData.address.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              city: e.target.value,
                            },
                          })
                        }
                      />
                      <Input
                        placeholder="State / Province"
                        className="rounded-xl h-11"
                        value={formData.address.state}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              state: e.target.value,
                            },
                          })
                        }
                      />
                      <Input
                        placeholder="Postal Code"
                        className="rounded-xl h-11"
                        value={formData.address.zip}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              zip: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <Label className="text-lg font-bold">
                      Emergency Contact
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Full Name"
                        className="rounded-xl h-11"
                        value={formData.emergencyContact.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: {
                              ...formData.emergencyContact,
                              name: e.target.value,
                            },
                          })
                        }
                      />
                      <Input
                        placeholder="Phone Number"
                        className="rounded-xl h-11"
                        value={formData.emergencyContact.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: {
                              ...formData.emergencyContact,
                              phone: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-4">
                <Button
                  variant="ghost"
                  className="font-bold h-12 px-8"
                  onClick={() => router.push("/onboarding")}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button
                  onClick={nextStep}
                  className="bg-primary font-bold h-12 px-12 rounded-xl shadow-lg shadow-primary/20"
                >
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </m.div>
          )}

          {step === 4 && (
            <m.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Medical History
                </h1>
                <p className="text-muted-foreground">
                  This helps doctors provide accurate and personalized care.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" /> Chronic
                      Conditions
                    </CardTitle>
                    <CardDescription>
                      Check any that apply to you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      "Diabetes",
                      "Hypertension",
                      "Asthma",
                      "Heart Disease",
                      "Thyroid",
                      "Arthritis",
                    ].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={item}
                          checked={formData.chronicDiseases.includes(item)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                chronicDiseases: [
                                  ...formData.chronicDiseases,
                                  item,
                                ],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                chronicDiseases:
                                  formData.chronicDiseases.filter(
                                    (c) => c !== item,
                                  ),
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={item}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2 col-span-full">
                      <Input
                        placeholder="Other conditions..."
                        className="h-9 rounded-lg"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value) {
                            const value = e.currentTarget.value;
                            setFormData({
                              ...formData,
                              chronicDiseases: [
                                ...formData.chronicDiseases,
                                value,
                              ],
                            });
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />{" "}
                      Allergies
                    </CardTitle>
                    <CardDescription>
                      Medications, food, or environmental
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                        Drug Allergies
                      </Label>
                      <div className="flex gap-2 flex-wrap mb-2">
                        {formData.allergies?.drug?.map((allergy, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="gap-2"
                          >
                            {allergy}
                            <button
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  allergies: {
                                    ...formData.allergies,
                                    drug: formData.allergies.drug.filter(
                                      (_, i) => i !== idx,
                                    ),
                                  },
                                });
                              }}
                            >
                              ✕
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="e.g. Penicillin, Aspirin"
                        className="rounded-xl h-11"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value) {
                            const value = e.currentTarget.value;
                            setFormData({
                              ...formData,
                              allergies: {
                                ...formData.allergies,
                                drug: [
                                  ...(formData.allergies?.drug || []),
                                  value,
                                ],
                              },
                            });
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                        Food Allergies
                      </Label>
                      <div className="flex gap-2 flex-wrap mb-2">
                        {formData.allergies?.food?.map((allergy, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="gap-2"
                          >
                            {allergy}
                            <button
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  allergies: {
                                    ...formData.allergies,
                                    food: formData.allergies.food.filter(
                                      (_, i) => i !== idx,
                                    ),
                                  },
                                });
                              }}
                            >
                              ✕
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="e.g. Peanuts, Shellfish"
                        className="rounded-xl h-11"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value) {
                            const value = e.currentTarget.value;
                            setFormData({
                              ...formData,
                              allergies: {
                                ...formData.allergies,
                                food: [
                                  ...(formData.allergies?.food || []),
                                  value,
                                ],
                              },
                            });
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5 text-teal-500" /> Current
                        Medications
                      </CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full h-8 px-4 gap-1"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          medications: [
                            ...formData.medications,
                            { name: "", dosage: "", freq: "" },
                          ],
                        });
                      }}
                    >
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {formData.medications.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
                        <p className="text-sm text-muted-foreground">
                          No medications added yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.medications.map((med, idx) => (
                          <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                            <Input 
                              placeholder="Name" 
                              value={med.name} 
                              onChange={(e) => {
                                const newMeds = [...formData.medications];
                                newMeds[idx].name = e.target.value;
                                setFormData({ ...formData, medications: newMeds });
                              }}
                              className="h-9 rounded-lg"
                            />
                            <Input 
                              placeholder="Dosage" 
                              value={med.dosage} 
                              onChange={(e) => {
                                const newMeds = [...formData.medications];
                                newMeds[idx].dosage = e.target.value;
                                setFormData({ ...formData, medications: newMeds });
                              }}
                              className="h-9 rounded-lg"
                            />
                            <div className="flex gap-1">
                              <Input 
                                placeholder="Freq" 
                                value={med.freq} 
                                onChange={(e) => {
                                  const newMeds = [...formData.medications];
                                  newMeds[idx].freq = e.target.value;
                                  setFormData({ ...formData, medications: newMeds });
                                }}
                                className="h-9 rounded-lg flex-1"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 text-destructive"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    medications: formData.medications.filter((_, i) => i !== idx)
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  className="font-bold h-12 px-8"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      // 1. Save profile data to backend (Match UserProfileUpdate schema)
                      const profileUpdate = {
                        date_of_birth: formData.dob || null,
                        gender: formData.gender || null,
                        blood_type: formData.bloodType || null,
                        phone_number: formData.phone || null,
                        address: `${formData.address.street}, ${formData.address.city}, ${formData.address.state} ${formData.address.zip}`.trim() || null,
                        emergency_contact: `${formData.emergencyContact.name} - ${formData.emergencyContact.phone}`.trim() || null,
                        chronic_conditions: formData.chronicDiseases || [],
                        allergies: [
                          ...(formData.allergies?.drug || []),
                          ...(formData.allergies?.food || []),
                          ...(formData.allergies?.env || []),
                        ],
                      };

                      const token = await getToken();
                      await admin.updateMe(profileUpdate, token || undefined);

                      // 2. Set role in Clerk metadata
                      const roleRes = await fetch("/api/v1/set-role", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ role: "patient" }),
                      });

                      if (!roleRes.ok) {
                        throw new Error("Failed to set user role");
                      }

                      toast({
                        title: "Profile Complete",
                        description: "Your health journey begins now.",
                      });

                      // 3. Cleanup and Redirect
                      sessionStorage.removeItem("patient_onboarding_form");
                      sessionStorage.removeItem("patient_onboarding_step");
                      router.push("/patient");
                    } catch (error) {
                      console.error("Onboarding failed:", error);
                      toast({
                        title: "Update Failed",
                        description: "We couldn't save your profile details. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="bg-primary font-bold h-12 px-12 rounded-xl shadow-xl shadow-primary/20"
                >
                  Complete Profile <CheckCircle2 className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </m.div>
          )}

          {/* Steps 5 & 6 removed — submit is now at end of Step 4 */}
        </AnimatePresence>
      </div>
    </div>
  );
}
