"use client"

import * as React from "react"
import { 
  BookOpen, 
  Pipette, 
  Search, 
  Plus, 
  FileEdit, 
  CheckCircle2, 
  AlertCircle,
  Brain,
  MessageSquare,
  History,
  Filter,
  ChevronRight,
  Database,
  RefreshCw,
  FlaskConical,
  Stethoscope,
  Network,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

const MOCK_DISEASES = [
  { id: "1", name: "Influenza (Standard)", category: "Respiratory", lastUpdated: "Jan 15, 2024", interactions: 12, severity: "Medium" },
  { id: "2", name: "Type 2 Diabetes Mellitus", category: "Endocrine", lastUpdated: "Feb 02, 2024", interactions: 45, severity: "High" },
  { id: "3", name: "Secondary Hypertension", category: "Cardiovascular", lastUpdated: "Jan 28, 2024", interactions: 38, severity: "High" },
  { id: "4", name: "Atopic Dermatitis", category: "Dermatology", lastUpdated: "Dec 10, 2023", interactions: 5, severity: "Low" },
  { id: "5", name: "Migraine with Aura", category: "Neurology", lastUpdated: "Feb 08, 2024", interactions: 22, severity: "Medium" },
]

const MOCK_TRAINING_REVIEW = [
  { id: "T-104", user: "Sarah J.", query: "Severe chest pain spreading to left arm, sweating.", aiResponse: "I recommend seeing a cardiologist for these symptoms to rule out cardiac issues.", status: "Flagged", reason: "Critical omission: Immediate Emergency Services (ER/911) escalation required for symptoms." },
  { id: "T-105", user: "Michael R.", query: "Can I take Metformin after consuming 2 units of alcohol?", aiResponse: "Alcohol can increase the risk of lactic acidosis with Metformin. It's best to avoid alcohol.", status: "Verified", reason: "Accurately identifies contraindication risk while maintaining appropriate scope." },
]

export default function KnowledgeBasePage() {
  const { toast } = useToast()

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
             Clinical Intelligence
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
             Curate clinical ontologies, review heuristic training, and validate medical accuracy.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => {
            toast({ title: "Synchronizing", description: "Merging local schema with latest global updates..." })
          }}>
            <RefreshCw className="h-4 w-4" /> Sync Knowledge
          </Button>
          <Button className="gap-2" onClick={() => {
            toast({ title: "New Entity", description: "Initializing medical record creation environment..." })
          }}>
            <Plus className="h-4 w-4" /> Define Entity
          </Button>
        </div>
      </div>

      <Tabs defaultValue="diseases" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-full max-w-md justify-start gap-1">
          <TabsTrigger value="diseases" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Ontology</TabsTrigger>
          <TabsTrigger value="review" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Training Review</TabsTrigger>
        </TabsList>

        <TabsContent value="diseases" className="space-y-6 animate-in slide-in-from-left-4 duration-500">
          <Card className="border-sidebar-border bg-card/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Medical Entity Database</CardTitle>
                    <CardDescription>Verified clinical definitions and pharmacological interactions.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search ICD-11..." className="pl-9 h-9" />
                  </div>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" /> Clusters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_DISEASES.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-sidebar-border hover:border-primary/30 hover:bg-muted/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Pipette className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-semibold flex items-center gap-2">
                          {item.name}
                          <Badge className={`h-5 border-none font-black text-[9px] px-2 rounded-full tracking-tighter ${
                              item.severity === 'High' ? 'bg-rose-500/10 text-rose-500' :
                              item.severity === 'Medium' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-emerald-500/10 text-emerald-500'
                          }`} variant="outline">
                            {item.severity} Risk
                          </Badge>
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-medium">{item.category} Domain • Updated {item.lastUpdated}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => {
                        toast({ title: `Audit: ${item.name}`, description: `Accessing full interaction matrix.` })
                    }}>
                        <FileEdit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="grid grid-cols-1 gap-6">
            {MOCK_TRAINING_REVIEW.map((log) => (
              <Card key={log.id} className="border-sidebar-border bg-card/50 overflow-hidden hover:border-sidebar-border/80 transition-all">
                <div className={`h-1.5 w-full ${log.status === "Flagged" ? "bg-rose-500" : "bg-emerald-500"}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <Network className="h-4 w-4" />
                      Inference Session #{log.id}
                    </div>
                    <Badge className={
                        log.status === "Flagged" ? "bg-rose-500 text-white" : "bg-emerald-500/10 text-emerald-600"
                    } variant="outline">
                      {log.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">User Query</p>
                      <div className="p-3 rounded-xl bg-muted/40 text-sm font-medium italic">
                          "{log.query}"
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Response</p>
                      <div className="p-3 rounded-xl bg-muted/20 text-sm font-medium italic">
                          "{log.aiResponse}"
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl border flex gap-4 items-center ${
                      log.status === "Flagged" ? "bg-rose-500/5 border-rose-100" : "bg-muted/10 border-sidebar-border"
                  }`}>
                    <AlertCircle className={`h-5 w-5 ${log.status === "Flagged" ? "text-rose-500" : "text-emerald-500"}`} />
                    <p className="text-xs font-medium text-foreground">{log.reason}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 text-xs" onClick={() => {
                        toast({ title: "Guidance Logged", description: `Correction for session ${log.id} recorded.` })
                    }}>Modify Reward Policy</Button>
                    <Button className="flex-1 text-xs" onClick={() => {
                        toast({ title: "Retraining Queued", description: `Session ${log.id} added for fine-tuning.` })
                    }}>Verify & Retrain</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
