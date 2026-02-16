"use client"

import * as React from "react"
import { 
  Settings, 
  Brain, 
  FileText, 
  Flag, 
  Save, 
  ChevronRight, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Globe,
  Zap,
  Lock,
  Eye,
  Plus,
  Cpu,
  RefreshCw,
  LayoutDashboard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function SystemConfigurationPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
        setIsSaving(false)
        toast({ 
            title: "Settings Saved", 
            description: "Platform parameters have been updated successfully." 
        })
    }, 1000)
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
             System Configuration
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage platform settings, AI model parameters, and feature availability.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => {
                toast({ title: "Rollback", description: "Restoring last stable configuration." })
            }}>
                <RefreshCw className="h-4 w-4" /> Rollback
            </Button>
            <Button className="gap-2 min-w-[140px]" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                  <Save className="h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
        </div>
      </div>

      <Tabs defaultValue="platform" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-full max-w-md justify-start gap-1">
          <TabsTrigger value="platform" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">System</TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">AI Engines</TabsTrigger>
          <TabsTrigger value="flags" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-6 animate-in slide-in-from-left-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-sidebar-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Financial Controls
                </CardTitle>
                <CardDescription>Configure commission models and billing thresholds.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Platform Fee (%)</Label>
                  <div className="flex items-center gap-3">
                    <Input type="number" defaultValue="15" className="w-24 h-10" />
                    <span className="text-sm text-muted-foreground font-medium">Net system commission</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Consultation Fee Range ($)</Label>
                  <div className="flex items-center gap-3">
                    <Input type="number" defaultValue="20" className="h-10" />
                    <span className="text-muted-foreground px-1">—</span>
                    <Input type="number" defaultValue="500" className="h-10" />
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t flex items-center justify-between">
                  <div className="space-y-0.5">
                      <Label htmlFor="refund-auto" className="text-base font-semibold">Automatic Refunds</Label>
                      <p className="text-xs text-muted-foreground">Process refunds for cancellations {">"}24h.</p>
                  </div>
                  <Switch id="refund-auto" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="border-sidebar-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Operating Hours
                </CardTitle>
                <CardDescription>System-wide clinical availability and maintenance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Service Window</Label>
                  <div className="flex items-center gap-3">
                    <Select defaultValue="08:00">
                      <SelectTrigger className="h-10 px-4 font-medium"><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="08:00">08:00 AM</SelectItem>
                          <SelectItem value="09:00">09:00 AM</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground italic text-sm">to</span>
                    <Select defaultValue="22:00">
                      <SelectTrigger className="h-10 px-4 font-medium"><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="22:00">10:00 PM</SelectItem>
                          <SelectItem value="23:00">11:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-rose-600" />
                          <Label className="text-base font-bold text-rose-600">Emergency Freeze</Label>
                      </div>
                      <p className="text-xs text-rose-600/70">Suspend all bookings immediately during outages.</p>
                    </div>
                    <Switch className="data-[state=checked]:bg-rose-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <Card className="border-sidebar-border bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">Intelligence Orchestration</CardTitle>
                    <CardDescription>Configure heuristics and models for clinical routing.</CardDescription>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Cpu className="h-6 w-6 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <Brain className="h-3 w-3" /> Core Clinical Model
                  </Label>
                  <Select defaultValue="gpt-4">
                    <SelectTrigger className="h-11 px-4 text-base font-medium font-sans"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">Omni-G (Precision Engine)</SelectItem>
                      <SelectItem value="claude-3">C-Pulse (Optimized Clinical)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">High-fidelity model for complex symptom analysis.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <Zap className="h-3 w-3" /> Triage Sensitivity
                  </Label>
                  <Select defaultValue="high">
                    <SelectTrigger className="h-11 px-4 text-base font-medium font-sans"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Conservative (Safety First)</SelectItem>
                      <SelectItem value="balanced">Standard Matrix</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">Controls the threshold for emergency hospital escalations.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Global System Directive (Core Prompt)</Label>
                <Textarea 
                  className="min-h-[160px] bg-muted/20 p-4 font-mono text-xs leading-relaxed" 
                  defaultValue="ROLE: Clinical Triage Coordinator. DIRECTIVE: Analyze patient inputs for high-risk markers. ROUTE: Nearest specialty clinic based on severity. CONSTRAINT: Avoid diagnostic declarations."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Video Consultation", icon: Globe, status: "stable", color: "bg-emerald-500" },
              { title: "Sentiment Triage", icon: Brain, status: "beta", color: "bg-blue-500" },
              { title: "Pharmacy Bridge", icon: Zap, status: "stable", color: "bg-emerald-500" },
            ].map((feature, i) => (
              <Card key={i} className="border-sidebar-border bg-card/50 hover:border-primary/30 transition-all flex flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/5 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Toggle system-wide availability of this feature cluster.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-sidebar-border">
                   <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground opacity-50">Status</span>
                        <span className="text-xs font-semibold">Enabled</span>
                   </div>
                   <Switch defaultChecked={feature.status === "stable"} />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
