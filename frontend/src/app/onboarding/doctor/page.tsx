"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Stethoscope,
  ShieldCheck,
  FileText,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Activity,
  Award,
  Calendar,
  Sparkles,
  ChevronRight,
  Building2,
  GraduationCap,
  Clock,
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from "framer-motion";
import apiClient from "@/lib/api-client";

// Steps:
// 1. Professional Info (specialty, license, experience)
// 2. Qualifications & Clinic
// 3. Success

const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Practice",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Surgery",
  "Urology",
];

export default function DoctorOnboarding() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [step, setStep] = React.useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = React.useState({
    specialty: "",
    license_number: "",
    years_of_experience: "",
    phone: "",
    qualifications: [] as string[],
    clinic_address: "",
    newQualification: "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const progress = (step / totalSteps) * 100;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const addQualification = () => {
    if (formData.newQualification.trim()) {
      setFormData({
        ...formData,
        qualifications: [
          ...formData.qualifications,
          formData.newQualification.trim(),
        ],
        newQualification: "",
      });
    }
  };

  const removeQualification = (index: number) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter((_, i) => i !== index),
    });
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // 1. Set role in Clerk metadata
      const roleRes = await fetch("/api/v1/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "doctor" }),
      });
      if (!roleRes.ok) {
        console.error("Failed to set role in Clerk");
      }

      // 2. Save doctor profile data to backend via apiClient
      const profileUpdate = {
        specialty: formData.specialty || null,
        license_number: formData.license_number || null,
        years_of_experience: formData.years_of_experience
          ? parseInt(formData.years_of_experience)
          : null,
        phone_number: formData.phone || null,
        qualifications: formData.qualifications,
        clinic_address: formData.clinic_address || null,
      };

      await apiClient.patch("/users/me", profileUpdate);

      toast({
        title: "Profile Saved",
        description: "Your doctor profile has been created successfully.",
      });

      // 3. Clear session storage and redirect
      sessionStorage.removeItem("onboarding_role");
      router.push("/doctor");
    } catch (e: any) {
      console.error("Error during doctor onboarding completion:", e);
      toast({
        title: "Error",
        description:
          "There was an issue saving your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6 md:p-12">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header & Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Stethoscope className="h-6 w-6" />
              <span className="font-black tracking-tighter text-xl">
                Physician Portal
              </span>
            </div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Step {step} of {totalSteps}
            </div>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-muted transition-all duration-500"
          />
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Professional Info */}
          {step === 1 && (
            <m.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Professional Information
                </h1>
                <p className="text-muted-foreground">
                  Enter your medical credentials and specialty.
                </p>
              </div>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" /> Medical
                        Specialty
                      </Label>
                      <Select
                        value={formData.specialty}
                        onValueChange={(val) =>
                          setFormData({ ...formData, specialty: val })
                        }
                      >
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="Select Specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALTIES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />{" "}
                        License Number
                      </Label>
                      <Input
                        placeholder="e.g. MD-2024-001"
                        value={formData.license_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            license_number: e.target.value,
                          })
                        }
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" /> Years of
                        Experience
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 10"
                        min="0"
                        max="60"
                        value={formData.years_of_experience}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            years_of_experience: e.target.value,
                          })
                        }
                        className="rounded-xl h-11"
                      />
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

          {/* STEP 2: Qualifications & Clinic */}
          {step === 2 && (
            <m.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Qualifications & Practice
                </h1>
                <p className="text-muted-foreground">
                  Add your qualifications and clinic information.
                </p>
              </div>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />{" "}
                    Qualifications
                  </CardTitle>
                  <CardDescription>
                    Add your degrees, certifications, and board certifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    {formData.qualifications.map((q, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-2 py-1.5 px-3">
                        {q}
                        <button
                          onClick={() => removeQualification(idx)}
                          className="hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. MBBS, MD Cardiology, FACC"
                      value={formData.newQualification}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newQualification: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addQualification();
                        }
                      }}
                      className="rounded-xl h-11 flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-xl"
                      onClick={addQualification}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" /> Clinic /
                    Practice Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter your clinic or hospital address..."
                    value={formData.clinic_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clinic_address: e.target.value,
                      })
                    }
                    className="rounded-xl min-h-[100px]"
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between pt-4">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  className="font-bold h-12 px-8"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button
                  onClick={nextStep}
                  className="bg-primary font-bold h-12 px-12 rounded-xl shadow-lg shadow-primary/20"
                >
                  Complete Profile <CheckCircle2 className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </m.div>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <m.div
              key="step-3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12 space-y-8"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative h-24 w-24 rounded-full bg-primary flex items-center justify-center mx-auto shadow-2xl shadow-primary/40">
                  <CheckCircle2 className="h-12 w-12 text-primary-foreground" />
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight">
                  Welcome, Dr. {user?.firstName || "Doctor"}!
                </h1>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                  Your physician profile is ready. You can now access your
                  clinical dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  {
                    icon: Stethoscope,
                    title: "View Patients",
                    desc: "Manage your patient list",
                  },
                  {
                    icon: Calendar,
                    title: "Appointments",
                    desc: "Manage your schedule",
                  },
                  {
                    icon: FileText,
                    title: "Medical Records",
                    desc: "Create and review records",
                  },
                ].map((item, i) => (
                  <Card
                    key={i}
                    className="bg-card/50 border-border/50 text-left p-4"
                  >
                    <item.icon className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.desc}
                    </p>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="w-full max-w-xs h-14 text-lg font-bold rounded-2xl bg-primary shadow-xl shadow-primary/30 group"
              >
                {isSubmitting ? "Setting up..." : "Go to Dashboard"}
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
