"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Stethoscope,
  FileText,
  Pill,
  CalendarPlus,
  Plus,
  FlaskConical,
  Eye,
  Flag,
  ChevronDown,
  ChevronUp,
  Send,
  X,
  Loader2,
} from "lucide-react";
import { getServiceContainer } from "@/lib/services/service-container";

const filterTabs = ["All", "Visits", "Labs", "Medications", "Flagged"];

type TimelineItem = {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  title: string;
  date: string;
  description: string | null;
  status: string;
  statusColor: string;
  dotColor: string;
  icon: React.ComponentType<{ className?: string }>;
  extra: { label: string; type: string }[];
  needsReview?: boolean;
  flagged?: boolean;
  annotations?: { author: string; text: string; time: string }[];
};

type TimelineApiRecord = {
  record_id: string;
  patient_id?: string;
  patient_name?: string;
  record_type?: string;
  diagnosis?: string;
  created_at?: string;
  treatment?: string;
  clinical_notes?: string;
  is_reviewed?: boolean;
};

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className={`flex flex-col items-center rounded-lg border border-border px-4 py-3 ${accent}`}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function TimelineEntry({
  item,
  onMarkReviewed,
  onToggleFlag,
  onAddAnnotation,
  onViewRecord,
}: {
  item: TimelineItem;
  onMarkReviewed: (id: string) => void;
  onToggleFlag: (id: string) => void;
  onAddAnnotation: (id: string, text: string) => void;
  onViewRecord?: (item: unknown) => void;
}) {
  const [expanded, setExpanded] = useState(item.needsReview || false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");
  const Icon = item.icon;

  return (
    <div className="relative mb-6 pl-10 last:mb-0 group">
      <div className={`absolute -left-[11px] top-1.5 h-[22px] w-[22px] rounded-full border-[3px] border-card ${item.dotColor} flex items-center justify-center`} />
      <div className="rounded-xl border border-border bg-card">
        <button
          type="button"
          className="flex w-full items-start justify-between gap-3 p-4 text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-card-foreground">{item.title}</h4>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">{item.date}</span>
                {item.extra.map((e, i) => (
                  <Badge key={i} variant="secondary" className={`text-[10px] leading-tight ${item.statusColor} border-0`}>
                    {e.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {expanded && (
          <div className="border-t border-border px-4 pb-4 pt-3">
            {item.description && <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>}

            {showNoteInput ? (
              <div className="mt-3 space-y-2">
                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add note..." />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (noteText.trim()) {
                        onAddAnnotation(item.id, noteText.trim());
                        setNoteText("");
                        setShowNoteInput(false);
                      }
                    }}
                  >
                    <Send className="mr-1.5 h-3.5 w-3.5" /> Save Note
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowNoteInput(false)}>
                    <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => onMarkReviewed(item.id)}>Mark Reviewed</Button>
              <Button size="sm" variant="outline" onClick={() => setShowNoteInput(true)}>Add Note</Button>
              <Button size="sm" variant="outline" onClick={() => onToggleFlag(item.id)}>
                <Flag className={`mr-1.5 h-3.5 w-3.5 ${item.flagged ? "fill-current" : ""}`} />
                {item.flagged ? "Unflag" : "Flag"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onViewRecord?.(item)}>
                <Eye className="mr-1.5 h-3.5 w-3.5" /> Full Record
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export interface DoctorMedicalTimelineProps {
  onViewPatient?: (patient: unknown) => void;
  onViewRecord?: (record: unknown) => void;
}

export function DoctorMedicalTimeline({ onViewPatient, onViewRecord }: DoctorMedicalTimelineProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isPrescribeOpen, setIsPrescribeOpen] = useState(false);
  const [isOrderLabOpen, setIsOrderLabOpen] = useState(false);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleType, setScheduleType] = useState("Consultation");

  const [prescribeMedication, setPrescribeMedication] = useState("");
  const [prescribeDosage, setPrescribeDosage] = useState("");
  const [prescribeFrequency, setPrescribeFrequency] = useState("");
  const [prescribeDuration, setPrescribeDuration] = useState("");
  const [prescribeInstructions, setPrescribeInstructions] = useState("");

  const [labPanel, setLabPanel] = useState("");
  const [labNotes, setLabNotes] = useState("");

  const [entryDiagnosis, setEntryDiagnosis] = useState("");
  const [entryDetails, setEntryDetails] = useState("");

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const container = getServiceContainer();
      const data = await container.medicalRecord.getMyRecords();
      const mapped: TimelineItem[] = (data as TimelineApiRecord[]).map((r) => {
        const type =
          r.record_type?.toLowerCase() === "lab result"
            ? "lab"
            : r.record_type?.toLowerCase() === "medication"
              ? "medication"
              : "visit";

        return {
          id: r.record_id,
          patientId: r.patient_id || "",
          patientName: r.patient_name || "Patient",
          type,
          title: r.diagnosis || "Consultation",
          date: r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--",
          description: r.treatment || r.clinical_notes || null,
          status: r.is_reviewed ? "Reviewed" : "Needs Review",
          statusColor: r.is_reviewed ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700",
          dotColor: r.is_reviewed ? "bg-emerald-500" : "bg-amber-500",
          icon: r.record_type?.toLowerCase() === "lab result" ? FileText : r.record_type?.toLowerCase() === "medication" ? Pill : Stethoscope,
          needsReview: !r.is_reviewed,
          flagged: false,
          extra: [{ label: r.record_type || "General", type: "info" }],
          annotations: [],
        };
      });
      setItems(mapped);
    } catch (error) {
      console.error("Failed to fetch doctor timeline:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const selectedPatient = useMemo(() => {
    const first = items.find((i) => i.patientId);
    if (!first) return { id: "", name: "Patient", initials: "P" };
    const name = first.patientName || "Patient";
    const initials = name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase() || "").join("") || "P";
    return { id: first.patientId || "", name, initials };
  }, [items]);

  const showActionError = (error: unknown) => {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 401) return toast({ title: "Session Expired", description: "Please sign in again.", variant: "destructive" });
    if (status === 403) return toast({ title: "Not Authorized", description: "Your account cannot perform this doctor action.", variant: "destructive" });
    if (status === 422) return toast({ title: "Invalid Input", description: "Please review the data and try again.", variant: "destructive" });
    toast({ title: "Request Failed", description: "Please try again in a moment.", variant: "destructive" });
  };

  const handleSchedule = async () => {
    if (!selectedPatient.id || !scheduleDate || !scheduleTime) {
      toast({ title: "Missing Information", description: "Select date and time to schedule.", variant: "destructive" });
      return;
    }
    setIsSubmittingAction(true);
    try {
      const container = getServiceContainer();
      await container.appointment.doctorBookAppointment({
        patient_id: selectedPatient.id,
        date: scheduleDate,
        time: scheduleTime,
        appointment_type: scheduleType,
      });
      toast({ title: "Appointment Scheduled", description: `Scheduled for ${selectedPatient.name}.` });
      setIsScheduleOpen(false);
      setScheduleDate("");
      setScheduleTime("");
    } catch (error) {
      showActionError(error);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handlePrescribe = async () => {
    if (!selectedPatient.id || !prescribeMedication.trim()) {
      toast({ title: "Missing Information", description: "Medication name is required.", variant: "destructive" });
      return;
    }
    setIsSubmittingAction(true);
    try {
      const container = getServiceContainer();
      await container.prescription.createPrescription({
        patient_id: selectedPatient.id,
        medications: [prescribeMedication.trim()],
        instructions:
          prescribeInstructions ||
          [prescribeDosage, prescribeFrequency, prescribeDuration].filter(Boolean).join(" | ") ||
          "Take as directed",
      });
      toast({ title: "Prescription Created", description: `Prescription issued for ${selectedPatient.name}.` });
      setIsPrescribeOpen(false);
      setPrescribeMedication("");
      setPrescribeDosage("");
      setPrescribeFrequency("");
      setPrescribeDuration("");
      setPrescribeInstructions("");
    } catch (error) {
      showActionError(error);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOrderLab = async () => {
    if (!selectedPatient.id || !labPanel.trim()) {
      toast({ title: "Missing Information", description: "Lab panel/test name is required.", variant: "destructive" });
      return;
    }
    setIsSubmittingAction(true);
    try {
      const container = getServiceContainer();
      const appts = await container.appointment.getDoctorAppointments();
      const latestForPatient = (Array.isArray(appts) ? appts : [])
        .filter((a: unknown) => String((a as { patient_id?: string }).patient_id || "") === selectedPatient.id)
        .sort((a: unknown, b: unknown) => {
          const av = new Date(String((a as { created_at?: string }).created_at || 0)).getTime();
          const bv = new Date(String((b as { created_at?: string }).created_at || 0)).getTime();
          return bv - av;
        })[0] as { appointment_id?: string } | undefined;
      await container.medicalRecord.createRecord({
        patient_id: selectedPatient.id,
        record_type: "Lab Result",
        title: `Lab Order: ${labPanel.trim()}`,
        description: labNotes || "Lab order requested by treating doctor.",
        date: new Date().toISOString().split("T")[0],
        appointment_id: latestForPatient?.appointment_id,
      });
      await fetchItems();
      toast({ title: "Lab Ordered", description: `Lab order saved for ${selectedPatient.name}.` });
      setIsOrderLabOpen(false);
      setLabPanel("");
      setLabNotes("");
    } catch (error) {
      showActionError(error);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleNewEntry = async () => {
    if (!selectedPatient.id || !entryDiagnosis.trim() || !entryDetails.trim()) {
      toast({ title: "Missing Information", description: "Diagnosis and details are required.", variant: "destructive" });
      return;
    }
    setIsSubmittingAction(true);
    try {
      const container = getServiceContainer();
      const appts = await container.appointment.getDoctorAppointments();
      const latestForPatient = (Array.isArray(appts) ? appts : [])
        .filter((a: unknown) => String((a as { patient_id?: string }).patient_id || "") === selectedPatient.id)
        .sort((a: unknown, b: unknown) => {
          const av = new Date(String((a as { created_at?: string }).created_at || 0)).getTime();
          const bv = new Date(String((b as { created_at?: string }).created_at || 0)).getTime();
          return bv - av;
        })[0] as { appointment_id?: string } | undefined;
      await container.medicalRecord.createRecord({
        patient_id: selectedPatient.id,
        record_type: "General Entry",
        title: entryDiagnosis.trim(),
        description: entryDetails.trim(),
        date: new Date().toISOString().split("T")[0],
        appointment_id: latestForPatient?.appointment_id,
      });
      await fetchItems();
      toast({ title: "Timeline Updated", description: "New entry has been added." });
      setIsNewEntryOpen(false);
      setEntryDiagnosis("");
      setEntryDetails("");
    } catch (error) {
      showActionError(error);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const filtered = items.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Visits") return item.type === "visit";
    if (activeFilter === "Labs") return item.type === "lab";
    if (activeFilter === "Medications") return item.type === "medication";
    if (activeFilter === "Flagged") return item.flagged;
    return true;
  });

  const needsReviewCount = items.filter((i) => i.needsReview).length;
  const flaggedCount = items.filter((i) => i.flagged).length;
  const totalVisits = items.filter((i) => i.type === "visit").length;

  return (
    <Card className="premium-card rounded-[2.5rem] border-none shadow-premium overflow-hidden">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 cursor-pointer group/patient active:scale-98 transition-all" onClick={() => onViewPatient?.({ name: selectedPatient.name, id: selectedPatient.id })}>
            <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-lg">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">{selectedPatient.initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-black text-card-foreground group-hover:text-primary transition-colors">{selectedPatient.name}</CardTitle>
              <p className="text-xs text-muted-foreground font-medium">Clinical timeline and review actions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider><Tooltip><TooltipTrigger asChild><Button size="sm" variant="outline" onClick={() => setIsScheduleOpen(true)}><CalendarPlus className="mr-1.5 h-3.5 w-3.5" />Schedule</Button></TooltipTrigger><TooltipContent>Schedule a new visit</TooltipContent></Tooltip></TooltipProvider>
            <TooltipProvider><Tooltip><TooltipTrigger asChild><Button size="sm" variant="outline" onClick={() => setIsOrderLabOpen(true)}><FlaskConical className="mr-1.5 h-3.5 w-3.5" />Order Lab</Button></TooltipTrigger><TooltipContent>Order a lab test</TooltipContent></Tooltip></TooltipProvider>
            <TooltipProvider><Tooltip><TooltipTrigger asChild><Button size="sm" variant="outline" onClick={() => setIsPrescribeOpen(true)}><Pill className="mr-1.5 h-3.5 w-3.5" />Prescribe</Button></TooltipTrigger><TooltipContent>Write a prescription</TooltipContent></Tooltip></TooltipProvider>
            <TooltipProvider><Tooltip><TooltipTrigger asChild><Button size="sm" onClick={() => setIsNewEntryOpen(true)}><Plus className="mr-1.5 h-3.5 w-3.5" />New Entry</Button></TooltipTrigger><TooltipContent>Add a timeline entry</TooltipContent></Tooltip></TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Pending Review" value={String(needsReviewCount)} accent={needsReviewCount > 0 ? "bg-amber-50 dark:bg-amber-500/5" : "bg-muted/50"} />
          <StatCard label="Flagged Items" value={String(flaggedCount)} accent={flaggedCount > 0 ? "bg-rose-50 dark:bg-rose-500/5" : "bg-muted/50"} />
          <StatCard label="Total Visits" value={String(totalVisits)} accent="bg-muted/50" />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {filterTabs.map((tab) => {
            const count = tab === "All" ? items.length : tab === "Visits" ? items.filter((i) => i.type === "visit").length : tab === "Labs" ? items.filter((i) => i.type === "lab").length : tab === "Medications" ? items.filter((i) => i.type === "medication").length : items.filter((i) => i.flagged).length;
            return (
              <Button key={tab} variant={activeFilter === tab ? "default" : "ghost"} size="sm" onClick={() => setActiveFilter(tab)} className={activeFilter === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground"}>
                {tab}<span className="ml-1.5 text-[10px] opacity-70">{count}</span>
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="h-8 w-8 text-primary animate-spin" /><p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Synchronizing records...</p></div>
        ) : (
          <div className="relative ml-3 border-l-2 border-border">
            {filtered.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No items match the current filter.</div> : filtered.map((item) => (
              <TimelineEntry
                key={item.id}
                item={item}
                onMarkReviewed={(id) => setItems((prev) => prev.map((it) => it.id === id ? { ...it, needsReview: false, status: "Reviewed", statusColor: "bg-emerald-500/10 text-emerald-700", dotColor: "bg-emerald-500" } : it))}
                onToggleFlag={(id) => setItems((prev) => prev.map((it) => it.id === id ? { ...it, flagged: !it.flagged } : it))}
                onAddAnnotation={(id, text) => setItems((prev) => prev.map((it) => it.id === id ? { ...it, annotations: [...(it.annotations || []), { author: "Dr. Chen (You)", text, time: new Date().toLocaleString() }] } : it))}
                onViewRecord={onViewRecord}
              />
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Appointment</DialogTitle><DialogDescription>Schedule a new visit for {selectedPatient.name}.</DialogDescription></DialogHeader>
          <div className="grid gap-3"><Label>Date</Label><Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} /><Label>Time</Label><Input placeholder="09:00 AM" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} /><Label>Type</Label><Input value={scheduleType} onChange={(e) => setScheduleType(e.target.value)} /></div>
          <DialogFooter><Button variant="outline" onClick={() => setIsScheduleOpen(false)}>Cancel</Button><Button onClick={handleSchedule} disabled={isSubmittingAction}>{isSubmittingAction ? "Scheduling..." : "Schedule"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPrescribeOpen} onOpenChange={setIsPrescribeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Prescribe Medication</DialogTitle><DialogDescription>Create prescription for {selectedPatient.name}.</DialogDescription></DialogHeader>
          <div className="grid gap-3"><Label>Medication</Label><Input value={prescribeMedication} onChange={(e) => setPrescribeMedication(e.target.value)} /><Label>Dosage</Label><Input value={prescribeDosage} onChange={(e) => setPrescribeDosage(e.target.value)} /><Label>Frequency</Label><Input value={prescribeFrequency} onChange={(e) => setPrescribeFrequency(e.target.value)} /><Label>Duration</Label><Input value={prescribeDuration} onChange={(e) => setPrescribeDuration(e.target.value)} /><Label>Instructions</Label><Textarea value={prescribeInstructions} onChange={(e) => setPrescribeInstructions(e.target.value)} /></div>
          <DialogFooter><Button variant="outline" onClick={() => setIsPrescribeOpen(false)}>Cancel</Button><Button onClick={handlePrescribe} disabled={isSubmittingAction}>{isSubmittingAction ? "Creating..." : "Create Prescription"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOrderLabOpen} onOpenChange={setIsOrderLabOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Order Lab</DialogTitle><DialogDescription>Create a lab order entry for {selectedPatient.name}.</DialogDescription></DialogHeader>
          <div className="grid gap-3"><Label>Lab Panel / Test</Label><Input value={labPanel} onChange={(e) => setLabPanel(e.target.value)} /><Label>Notes</Label><Textarea value={labNotes} onChange={(e) => setLabNotes(e.target.value)} /></div>
          <DialogFooter><Button variant="outline" onClick={() => setIsOrderLabOpen(false)}>Cancel</Button><Button onClick={handleOrderLab} disabled={isSubmittingAction}>{isSubmittingAction ? "Saving..." : "Order Lab"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Timeline Entry</DialogTitle><DialogDescription>Add a clinical timeline note for {selectedPatient.name}.</DialogDescription></DialogHeader>
          <div className="grid gap-3"><Label>Diagnosis / Title</Label><Input value={entryDiagnosis} onChange={(e) => setEntryDiagnosis(e.target.value)} /><Label>Clinical Details</Label><Textarea value={entryDetails} onChange={(e) => setEntryDetails(e.target.value)} /></div>
          <DialogFooter><Button variant="outline" onClick={() => setIsNewEntryOpen(false)}>Cancel</Button><Button onClick={handleNewEntry} disabled={isSubmittingAction}>{isSubmittingAction ? "Saving..." : "Add Entry"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
