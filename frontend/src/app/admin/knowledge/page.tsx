"use client"
import { toast } from "@/hooks/use-toast"

import * as React from "react"
import { 
  BookOpen, 
  Pipette, 
  Search, 
  Plus, 
  FileEdit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Brain,
  MessageSquare,
  History,
  Filter,
  MoreVertical,
  ChevronRight,
  Database,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

const MOCK_DISEASES = [
  { id: "1", name: "Influenza", category: "Respiratory", lastUpdated: "Jan 15, 2024", interactions: 12, severity: "Medium" },
  { id: "2", name: "Type 2 Diabetes", category: "Endocrine", lastUpdated: "Feb 02, 2024", interactions: 45, severity: "High" },
  { id: "3", name: "Hypertension", category: "Cardiovascular", lastUpdated: "Jan 28, 2024", interactions: 38, severity: "High" },
  { id: "4", name: "Atopic Dermatitis", category: "Dermatology", lastUpdated: "Dec 10, 2023", interactions: 5, severity: "Low" },
]

const MOCK_TRAINING_REVIEW = [
  { id: "T-104", user: "Sarah J.", query: "Severe chest pain spreading to arm", aiResponse: "Recommended seeing a cardiologist.", status: "Flagged", reason: "Potential heart attack not escalated to ER enough." },
  { id: "T-105", user: "Michael R.", query: "Interaction between Metformin and Alcohol", aiResponse: "Advised caution, risk of lactic acidosis.", status: "Verified", reason: "Correct and accurate medical advice." },
]

export default function KnowledgeBasePage() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto min-h-screen bg-background text-foreground">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Clinical Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Curate medical data, review AI training logs, and ensure clinical accuracy.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => toast({ title: "Syncing Database", description: "Pulling latest clinical protocols..." })}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Database
          </Button>
          <Button className="bg-primary text-primary-foreground" onClick={() => toast({ title: "New Entry", description: "Opening medical entry form..." })}>
            <Plus className="mr-2 h-4 w-4" />
            Add Medical Entry
          </Button>
        </div>
      </div>

      <Tabs defaultValue="diseases" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border border-border/50">
          <TabsTrigger value="diseases" className="gap-2"><Database className="h-4 w-4" />Diseases & Drugs</TabsTrigger>
          <TabsTrigger value="review" className="gap-2"><Brain className="h-4 w-4" />AI Training Review</TabsTrigger>
          <TabsTrigger value="guidelines" className="gap-2"><BookOpen className="h-4 w-4" />Protocols</TabsTrigger>
        </TabsList>

        <TabsContent value="diseases" className="space-y-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-xl font-bold">Medical Registry</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search diseases or drugs..." className="pl-10 h-9 bg-muted/30" />
                  </div>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Filter className="h-4 w-4" />
                    Category
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_DISEASES.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Pipette className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold flex items-center gap-2">
                          {item.name}
                          <Badge variant="secondary" className="text-[10px] h-4">
                            {item.severity}
                          </Badge>
                        </h4>
                        <p className="text-xs text-muted-foreground">{item.category} • Updated {item.lastUpdated}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Interactions</p>
                        <p className="text-xs font-bold">{item.interactions} Checked</p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FileEdit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <div className="space-y-4">
            {MOCK_TRAINING_REVIEW.map((log) => (
              <Card key={log.id} className="border-border/50 bg-card/50 overflow-hidden">
                <div className={`h-1.5 w-full ${log.status === "Flagged" ? "bg-rose-500" : "bg-emerald-500"}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider">Review Case #{log.id}</span>
                    </div>
                    <Badge className={log.status === "Flagged" ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}>
                      {log.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Patient Query</p>
                      <p className="text-sm font-medium italic border-l-2 border-primary/20 pl-3">"{log.query}"</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">AI Response</p>
                      <p className="text-sm font-medium italic border-l-2 border-primary/20 pl-3">"{log.aiResponse}"</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-xs flex gap-2 items-start">
                    <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${log.status === "Flagged" ? "text-rose-500" : "text-emerald-500"}`} />
                    <div>
                      <p className="font-bold">Evaluation Reason:</p>
                      <p className="text-muted-foreground">{log.reason}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => toast({ title: "Edit Logic", description: `Opening correction interface for Case #${log.id}` })}>Correct AI Logic</Button>
                    <Button size="sm" className="flex-1" onClick={() => toast({ title: "Retraining Initiated", description: `Model is integrating feedback for Case #${log.id}`, variant: "default" })}>Retrain with Correction</Button>
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
