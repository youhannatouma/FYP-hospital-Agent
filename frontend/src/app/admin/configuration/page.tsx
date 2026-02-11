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
  Plus
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

export default function SystemConfigurationPage() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto min-h-screen bg-background text-foreground">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Fine-tune platform parameters, AI behaviors, and feature visibility.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Save className="mr-2 h-4 w-4" />
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="platform" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border border-border/50">
          <TabsTrigger value="platform" className="gap-2"><Settings className="h-4 w-4" />Platform</TabsTrigger>
          <TabsTrigger value="ai" className="gap-2"><Brain className="h-4 w-4" />AI Engines</TabsTrigger>
          <TabsTrigger value="content" className="gap-2"><FileText className="h-4 w-4" />Content</TabsTrigger>
          <TabsTrigger value="flags" className="gap-2"><Flag className="h-4 w-4" />Features</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Financial Policies</CardTitle>
                <CardDescription>Configure commission rates and fee structures.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Platform Commission (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="15" className="bg-muted/30" />
                    <span className="text-muted-foreground font-medium">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Min/Max Consultation Fee ($)</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="20" className="bg-muted/30" />
                    <span className="text-muted-foreground">-</span>
                    <Input type="number" defaultValue="500" className="bg-muted/30" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="refund-auto">Enable Automatic Refunds</Label>
                    <Switch id="refund-auto" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground italic">Refunds will be processed automatically for cancellations 24h prior.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Availability & Rules</CardTitle>
                <CardDescription>System-wide operational hours and limitations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Service Hours</Label>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="08:00">
                      <SelectTrigger className="bg-muted/30"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="08:00">08:00 AM</SelectItem></SelectContent>
                    </Select>
                    <span className="text-muted-foreground">to</span>
                    <Select defaultValue="22:00">
                      <SelectTrigger className="bg-muted/30"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="22:00">10:00 PM</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label>Emergency Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">Disables all new bookings immediately.</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Model Selection</CardTitle>
              <CardDescription>Primary and fallback models for AI services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Doctor Matching Engine</Label>
                  <Select defaultValue="gpt-4">
                    <SelectTrigger className="bg-muted/30"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 Turbo (Precise)</SelectItem>
                      <SelectItem value="claude-3">Claude 3 Opus (Fast)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Symptom Analysis Sensitivity</Label>
                  <Select defaultValue="high">
                    <SelectTrigger className="bg-muted/30"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High (Strict Flagging)</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>System Prompt Template (Assistant)</Label>
                <Textarea 
                  className="min-h-[150px] bg-muted/30 font-mono text-xs" 
                  placeholder="Enter system instructions for the AI..."
                  defaultValue="You are an expert medical triage assistant. Your goal is to gather information about the patient's symptoms and recommend the most appropriate specialist. Do not provide diagnosis, only guidance."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Video Consultation", icon: Globe, status: "stable", description: "Enable real-time video calls between doctors and patients." },
              { title: "Mental Health AI", icon: Brain, status: "beta", description: "Advanced emotional analysis in AI chat sessions." },
              { title: "Direct Pharmacy Chat", icon: Zap, status: "testing", description: "Allows patients to chat directly with pharmacists." },
            ].map((feature, i) => (
              <Card key={i} className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold mt-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold uppercase">Status</span>
                    <Switch defaultChecked={feature.status === "stable"} />
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
