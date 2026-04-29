"use client";

import { toast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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
  AlertTriangle,
  Plus,
  FlaskConical,
  CalendarPlus,
  MessageSquarePlus,
  CheckCircle2,
  Eye,
  Flag,
  ChevronDown,
  ChevronUp,
  Send,
  X,
  Loader2,
  Inbox,
} from "lucide-react";
import { useHospital } from "@/hooks/use-hospital";
import { useAuth, useUser } from "@clerk/nextjs";

import { AddRecordDialog } from "@/components/doctor/dialogs/add-record-dialog";
import { PrescriptionDialog } from "@/components/doctor/dialogs/prescription-dialog";
import { ScheduleAppointmentDialog } from "@/components/doctor/dialogs/schedule-appointment-dialog";

const filterTabs = ["All", "Visits", "Labs", "Medications", "Flagged"];

type TimelineItem = {
  id: string;
  type: string;
  title: string;
  date: string;
  description: string | null;
  status: string;
  statusColor: string;
  dotColor: string;
  icon: React.ComponentType<{ className?: string }>;
  labValues?: {
    label: string;
    value: string;
    flag?: "high" | "low" | "normal";
  }[];
  extra: { label: string; type: string }[];
  needsReview?: boolean;
  flagged?: boolean;
  annotations?: { author: string; text: string; time: string }[];
  patient?: { name: string; id: string };
};

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-lg border border-border px-4 py-3 ${accent}`}
    >
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function LabValuePill({
  label,
  value,
  flag,
}: {
  label: string;
  value: string;
  flag?: "high" | "low" | "normal";
}) {
  const flagStyles = {
    high: "border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10",
    low: "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10",
    normal: "border-border bg-muted/50",
  };
  const flagLabel = {
    high: "text-rose-600 dark:text-rose-400",
    low: "text-amber-600 dark:text-amber-400",
    normal: "text-muted-foreground",
  };

  return (
    <div className={`rounded-lg border p-3 ${flagStyles[flag || "normal"]}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        {flag && flag !== "normal" && (
          <span
            className={`text-[10px] font-semibold uppercase ${flagLabel[flag]}`}
          >
            {flag}
          </span>
        )}
      </div>
      <p
        className={`text-sm font-semibold ${flag && flag !== "normal" ? flagLabel[flag] : "text-card-foreground"}`}
      >
        {value}
      </p>
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
  onViewRecord?: (item: any) => void;
}) {
  const [expanded, setExpanded] = useState(item.needsReview || false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");

  const Icon = item.icon;

  function handleSubmitNote() {
    if (noteText.trim()) {
      onAddAnnotation(item.id, noteText.trim());
      setNoteText("");
      setShowNoteInput(false);
    }
  }

  return (
    <div className="relative mb-6 pl-10 last:mb-0 group">
      <div
        className={`absolute -left-[11px] top-1.5 h-[22px] w-[22px] rounded-full border-[3px] border-card ${item.dotColor} flex items-center justify-center`}
      >
        {item.needsReview && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
          </span>
        )}
      </div>

      <div
        className={`rounded-xl border transition-colors ${
          item.needsReview
            ? "border-amber-300 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-500/5"
            : "border-border bg-card"
        }`}
      >
        <button
          type="button"
          className="flex w-full items-start justify-between gap-3 p-4 text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                item.needsReview
                  ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold text-card-foreground">
                  {item.title}
                </h4>
                {item.flagged && (
                  <Flag className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                )}
                {item.patient && (
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold text-[10px]">
                    {item.patient.name}
                  </Badge>
                )}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {item.date}
                </span>
                {item.extra.map((e, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className={`text-[10px] leading-tight ${item.statusColor} border-0`}
                  >
                    {e.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {item.annotations && item.annotations.length > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] text-muted-foreground"
              >
                {item.annotations.length} note
                {item.annotations.length !== 1 ? "s" : ""}
              </Badge>
            )}
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {expanded && (
          <div className="border-t border-border px-4 pb-4 pt-3">
            {item.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            )}

            {item.labValues && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {item.labValues.map((lv) => (
                  <LabValuePill
                    key={lv.label}
                    label={lv.label}
                    value={lv.value}
                    flag={lv.flag}
                  />
                ))}
              </div>
            )}

            {item.annotations && item.annotations.length > 0 && (
              <div className="mt-4 space-y-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Clinical Notes
                </span>
                {item.annotations.map((note, i) => (
                  <div key={i} className="rounded-lg bg-muted/60 p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                          {note.author
                            ?.split(" ")
                            .map((w: string) => w[0])
                            .join("")
                            .slice(0, 2) || "Dr"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-card-foreground">
                        {note.author}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {note.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {note.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {showNoteInput && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Add a clinical note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-[72px] resize-none text-sm"
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-1"
                    onClick={() => {
                      setShowNoteInput(false);
                      setNoteText("");
                    }}
                  >
                    Cancel
                  </button>
                  <Button
                    size="sm"
                    onClick={handleSubmitNote}
                    disabled={!noteText.trim()}
                  >
                    <Send className="mr-1 h-3 w-3" />
                    Save Note
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              {item.needsReview && (
                <Button
                  size="sm"
                  onClick={() => onMarkReviewed(item.id)}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Mark as Reviewed
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNoteInput(!showNoteInput)}
              >
                <MessageSquarePlus className="mr-1.5 h-3.5 w-3.5" />
                Add Note
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleFlag(item.id)}
                className={
                  item.flagged
                    ? "border-rose-300 text-rose-600 hover:bg-rose-50"
                    : ""
                }
              >
                <Flag
                  className={`mr-1.5 h-3.5 w-3.5 ${item.flagged ? "fill-current" : ""}`}
                />
                {item.flagged ? "Unflag" : "Flag"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => onViewRecord?.(item)}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Full Record
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export interface DoctorMedicalTimelineProps {
  onViewPatient?: (patient: any) => void;
  onViewRecord?: (record: any) => void;
  selectedPatient?: any;
}

export function DoctorMedicalTimeline({ onViewPatient, onViewRecord, selectedPatient }: DoctorMedicalTimelineProps) {
  const { medicalRecords } = useHospital();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [activeFilter, setActiveFilter] = useState("All");
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isLabOrderOpen, setIsLabOrderOpen] = useState(false);
  const [isPrescribeOpen, setIsPrescribeOpen] = useState(false);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      
      // If a patient is selected, fetch their records. Otherwise, fetch all reviews needed for the doctor.
      const data = selectedPatient 
        ? await medicalRecords.getPatientRecords(selectedPatient.id, token || undefined)
        : await medicalRecords.getMyRecords(token || undefined);
      
      const mapped: TimelineItem[] = data.map((r: any) => {
        const isLab = r.record_type?.toLowerCase() === 'lab result';
        let resData = null;
        try {
          resData = isLab && r.results ? (typeof r.results === 'string' ? JSON.parse(r.results) : r.results) : null;
        } catch (e) {
          console.error("Failed to parse lab results", e);
        }
        
        let notes: any[] = [];
        try {
          notes = r.clinical_notes ? (typeof r.clinical_notes === 'string' && r.clinical_notes.startsWith('[') ? JSON.parse(r.clinical_notes) : []) : [];
        } catch (e) {
          console.error("Failed to parse clinical notes", e);
        }

        return {
          id: r.record_id,
          type: isLab ? 'lab' : r.record_type?.toLowerCase() === 'medication' ? 'medication' : 'visit',
          title: resData?.testName || r.diagnosis || "Consultation",
          date: r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--",
          description: r.clinical_notes && typeof r.clinical_notes === 'string' && !r.clinical_notes.startsWith('[') ? r.clinical_notes : r.treatment,
          status: r.is_reviewed ? "Reviewed" : "Needs Review",
          statusColor: r.is_reviewed ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700",
          dotColor: r.is_reviewed ? "bg-emerald-500" : "bg-amber-500",
          icon: isLab ? FlaskConical : r.record_type?.toLowerCase() === 'medication' ? Pill : Stethoscope,
          labValues: resData?.biomarkers?.map((b: any) => ({
            label: b.name,
            value: `${b.value} ${b.unit}`,
            flag: b.flag?.toLowerCase() || "normal"
          })),
          needsReview: !r.is_reviewed,
          flagged: r.is_flagged || false,
          extra: [{ label: r.record_type, type: "info" }],
          annotations: notes,
          patient: selectedPatient ? null : (r.patient ? { name: `${r.patient.first_name} ${r.patient.last_name}`, id: r.patient_id } : null)
        };
      });
      
      setItems(mapped);
    } catch (error) {
      console.error("Failed to fetch doctor timeline:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [medicalRecords, getToken, selectedPatient]);

  const needsReviewCount = items.filter((i) => i.needsReview).length;
  const flaggedCount = items.filter((i) => i.flagged).length;
  const totalVisits = items.filter((i) => i.type === "visit").length;

  const filtered = items.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Visits") return item.type === "visit";
    if (activeFilter === "Labs") return item.type === "lab";
    if (activeFilter === "Medications") return item.type === "medication";
    if (activeFilter === "Flagged") return item.flagged;
    return true;
  });

  async function handleMarkReviewed(id: string) {
    try {
      const token = await getToken();
      await medicalRecords.updateRecord(id, { is_reviewed: true }, token || undefined);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, needsReview: false, status: "Reviewed", statusColor: "bg-emerald-500/10 text-emerald-700", dotColor: "bg-emerald-500" } : item
        )
      );
      toast({ title: "Record Reviewed", description: "The clinical entry has been verified." });
    } catch (err) {
      toast({ title: "Review Failed", description: "Could not update the record status.", variant: "destructive" });
    }
  }

  async function handleToggleFlag(id: string) {
    try {
      const token = await getToken();
      const item = items.find(i => i.id === id);
      await medicalRecords.updateRecord(id, { is_flagged: !item?.flagged }, token || undefined);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, flagged: !item.flagged } : item
        )
      );
    } catch (err) {
      toast({ title: "Action Failed", description: "Could not toggle the record flag.", variant: "destructive" });
    }
  }

  async function handleAddAnnotation(id: string, text: string) {
    try {
      const token = await getToken();
      const item = items.find(i => i.id === id);
      const newNote = {
        author: `Dr. ${user?.lastName || "Physician"}`,
        text,
        time: new Date().toISOString()
      };
      
      const existingNotes = item?.annotations || [];
      await medicalRecords.updateRecord(id, { clinical_notes: JSON.stringify([...existingNotes, newNote]) }, token || undefined);

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                annotations: [
                  ...(item.annotations || []),
                  {
                    author: `Dr. ${user?.lastName || "You"}`,
                    text,
                    time: new Date().toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }),
                  },
                ],
              }
            : item
        )
      );
      toast({ title: "Note Added", description: "The clinical annotation has been saved." });
    } catch (err) {
      toast({ title: "Save Failed", description: "Could not persist the clinical note.", variant: "destructive" });
    }
  }

  return (
    <>
      <Card className="premium-card rounded-[2.5rem] border-none shadow-premium overflow-hidden">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {selectedPatient ? (
              <div 
                className="flex items-center gap-3 cursor-pointer group/patient active:scale-98 transition-all"
                onClick={() => onViewPatient?.(selectedPatient)}
              >
                <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-lg">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {selectedPatient.initials || selectedPatient.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl font-black text-card-foreground group-hover:text-primary transition-colors">
                    {selectedPatient.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-medium">
                    Patient ID: {selectedPatient.id} &middot; Last Active: {selectedPatient.lastVisit}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner-glow">
                  <Inbox className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-card-foreground">
                    Clinical Review Queue
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-medium">
                    Monitoring {items.length} clinical records across all assigned patients.
                  </p>
                </div>
              </div>
            )}
            
            {selectedPatient && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsScheduleOpen(true)}>
                  <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                  Schedule
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsLabOrderOpen(true)}>
                  <FlaskConical className="mr-1.5 h-3.5 w-3.5" />
                  Order Lab
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsPrescribeOpen(true)}>
                  <Pill className="mr-1.5 h-3.5 w-3.5" />
                  Prescribe
                </Button>
                <Button size="sm" onClick={() => setIsAddRecordOpen(true)}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  New Entry
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Pending Review"
              value={String(needsReviewCount)}
              accent={needsReviewCount > 0 ? "bg-amber-50 dark:bg-amber-500/5" : "bg-muted/50"}
            />
            <StatCard
              label="Flagged Items"
              value={String(flaggedCount)}
              accent={flaggedCount > 0 ? "bg-rose-50 dark:bg-rose-500/5" : "bg-muted/50"}
            />
            <StatCard
              label="Total Records"
              value={String(items.length)}
              accent="bg-muted/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {filterTabs.map((tab) => {
              const count =
                tab === "All"
                  ? items.length
                  : tab === "Visits"
                    ? items.filter((i) => i.type === "visit").length
                    : tab === "Labs"
                      ? items.filter((i) => i.type === "lab").length
                      : tab === "Medications"
                        ? items.filter((i) => i.type === "medication").length
                        : items.filter((i) => i.flagged).length;

              return (
                <Button
                  key={tab}
                  variant={activeFilter === tab ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveFilter(tab)}
                  className={activeFilter === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
                >
                  {tab}
                  <span className="ml-1.5 text-[10px] opacity-70">{count}</span>
                </Button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Synchronizing records...</p>
            </div>
          ) : (
            <div className="relative ml-3 border-l-2 border-border">
              {filtered.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-muted-foreground opacity-20" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">Queue Clear</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mt-1">No clinical items match the criteria</p>
                  </div>
                </div>
              ) : (
                filtered.map((item) => (
                  <TimelineEntry
                    key={item.id}
                    item={item}
                    onMarkReviewed={handleMarkReviewed}
                    onToggleFlag={handleToggleFlag}
                    onAddAnnotation={handleAddAnnotation}
                    onViewRecord={onViewRecord}
                  />
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPatient && (
        <>
          <ScheduleAppointmentDialog 
            open={isScheduleOpen} 
            onOpenChange={setIsScheduleOpen}
            preSelectedPatientId={selectedPatient.id}
            preSelectedPatientName={selectedPatient.name}
          />
          
          <AddRecordDialog 
            open={isLabOrderOpen} 
            onOpenChange={(open) => {
              setIsLabOrderOpen(open);
              if (!open) fetchItems();
            }}
            recordType="Lab Result"
            preSelectedPatientId={selectedPatient.id}
          />

          <PrescriptionDialog 
            open={isPrescribeOpen} 
            onOpenChange={setIsPrescribeOpen}
            patient={selectedPatient}
          />

          <AddRecordDialog 
            open={isAddRecordOpen} 
            onOpenChange={(open) => {
              setIsAddRecordOpen(open);
              if (!open) fetchItems();
            }}
            preSelectedPatientId={selectedPatient.id}
          />
        </>
      )}
    </>
  );
}
