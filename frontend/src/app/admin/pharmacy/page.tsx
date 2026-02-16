"use client"

import * as React from "react"
import { 
  Warehouse, 
  AlertTriangle, 
  TrendingDown, 
  Search, 
  Filter, 
  Plus, 
  Package, 
  History,
  Building2,
  Table as TableIcon,
  Trash2,
  FileEdit,
  ArrowUpRight,
  TrendingUp,
  Truck,
  Zap,
  Box,
  BarChart3,
  Pipette
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

const MOCK_PHARMACIES = [
  { id: "PH-001", name: "PharmaPlus Lagos", location: "Lagos, Nigeria", stockLevel: "85%", status: "Healthy", activeRefills: 450, trend: "up" },
  { id: "PH-002", name: "GreenCross Pharmacy", location: "Abuja, Nigeria", stockLevel: "32%", status: "Low Stock", activeRefills: 120, trend: "down" },
  { id: "PH-003", name: "BioMed Pharmacy", location: "Port Harcourt, Nigeria", stockLevel: "92%", status: "Healthy", activeRefills: 380, trend: "up" },
  { id: "PH-004", name: "MediCloud North", location: "Kano, Nigeria", stockLevel: "58%", status: "Monitoring", activeRefills: 210, trend: "stable" },
]

const MOCK_MEDICINES = [
  { name: "Amoxicillin 500mg", category: "Antibiotic", price: "$12.50", stock: 1240, status: "Available" },
  { name: "Paracetamol 500mg", category: "Analgesic", price: "$4.20", stock: 5000, status: "Available" },
  { name: "Insulin Glargine", category: "Anti-diabetic", price: "$85.00", stock: 45, status: "Low Stock" },
  { name: "Sertraline 50mg", category: "Antidepressant", price: "$22.10", stock: 0, status: "Out of Stock" },
  { name: "Metformin 850mg", category: "Anti-diabetic", price: "$15.00", stock: 820, status: "Available" },
]

export default function PharmacyHubPage() {
  const { toast } = useToast()

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
             Supply Chain Hub
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Centralized orchestration of pharmaceutical inventory and distribution.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => {
            toast({ title: "Auto-Restock", description: " replenish orders sent to verified vendors." })
          }}>
            <Truck className="h-4 w-4" /> Auto-Restock
          </Button>
          <Button className="gap-2" onClick={() => {
            toast({ title: "New Inventory", description: "Opening the registration vault..." })
          }}>
            <Plus className="h-4 w-4" /> Register SKU
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-sidebar-border bg-card/50 shadow-sm p-6 group hover:border-primary/30 transition-all cursor-pointer">
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Urgent Depleting</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">12</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">SKUs Critical</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </Card>
        
        <Card className="border-sidebar-border bg-card/50 shadow-sm p-6 group hover:border-primary/30 transition-all cursor-pointer">
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Net Inventory</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">542k</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Volume Total</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </Card>

        <Card className="border-sidebar-border bg-card/50 shadow-sm p-6 group hover:border-primary/30 transition-all cursor-pointer">
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Market Index</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">-2.4%</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Delta (30d)</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </Card>

        <Card className="border-none bg-gradient-to-br from-primary to-indigo-600 p-6 text-white shadow-lg overflow-hidden relative">
            <Zap className="absolute bottom-0 right-0 h-16 w-16 opacity-10 -mr-2 -mb-2" />
            <div className="relative z-10 flex flex-col justify-between h-full">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Distribution Success</span>
                <div className="mt-4">
                    <p className="text-3xl font-bold tracking-tight">99.8%</p>
                    <p className="text-[10px] font-medium uppercase mt-0.5">Reliability Score</p>
                </div>
            </div>
        </Card>
      </div>

      <Tabs defaultValue="pharmacies" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-full max-w-md justify-start gap-1">
          <TabsTrigger value="pharmacies" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Endpoints</TabsTrigger>
          <TabsTrigger value="catalog" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Catalog</TabsTrigger>
        </TabsList>

        <TabsContent value="pharmacies" className="space-y-6 animate-in slide-in-from-left-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_PHARMACIES.map((pharmacy) => (
              <Card key={pharmacy.id} className="border-sidebar-border bg-card/50 hover:border-sidebar-border/80 transition-all group p-6 flex flex-col justify-between aspect-square relative overflow-hidden">
                <div className={`absolute top-0 right-0 h-1 w-full ${pharmacy.status === 'Healthy' ? 'bg-emerald-500' : pharmacy.status === 'Monitoring' ? 'bg-amber-400' : 'bg-rose-500'}`} />
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground/50 border-sidebar-border">ID: {pharmacy.id}</Badge>
                    <div className="flex items-center gap-1.5">
                         <Badge className={
                             pharmacy.status === "Healthy" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                             pharmacy.status === "Monitoring" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                             "bg-rose-500/10 text-rose-600 border-rose-500/20"
                         } variant="outline" size="sm">
                            {pharmacy.status}
                        </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors cursor-pointer" onClick={() => toast({ title: "Branch Details", description: "Opening audit for " + pharmacy.name })}>
                    {pharmacy.name}
                  </CardTitle>
                  <CardDescription className="text-[10px] mt-1">{pharmacy.location}</CardDescription>
                </div>
                <div className="space-y-4 pt-4 border-t border-sidebar-border">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                      <span>Inventory Level</span>
                      <span className={parseInt(pharmacy.stockLevel) < 40 ? "text-rose-600" : "text-foreground"}>{pharmacy.stockLevel}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${parseInt(pharmacy.stockLevel) < 40 ? "bg-rose-500" : "bg-primary"}`} 
                        style={{ width: pharmacy.stockLevel }} 
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground opacity-40">Refills/mo</p>
                      <p className="text-xl font-bold">{pharmacy.activeRefills}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            <Card className="border-2 border-dashed border-sidebar-border bg-transparent p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:border-primary/40 transition-all aspect-square">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary">
                    <Building2 className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Approve Vendor</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">Add a new licensed pharmacy point.</p>
                </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <Card className="border-sidebar-border bg-card/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Pharmaceutical Catalog</CardTitle>
                    <CardDescription>Global SKU Database for the Care platform.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search catalog..." className="pl-9 h-9" />
                  </div>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" /> Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-sidebar-border">
                {MOCK_MEDICINES.map((med, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-muted/10 transition-all group px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Pipette className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-base group-hover:text-primary transition-colors">{med.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[9px] h-4 py-0 font-mono border-sidebar-border">{med.category}</Badge>
                            <span className="text-[10px] text-muted-foreground">SKU: MED-{1000 + i}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 mt-4 md:mt-0">
                      <div className="text-right hidden xl:block">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-40">Stock</p>
                        <p className="text-sm font-semibold">{med.stock.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-40">Price</p>
                        <p className="text-sm font-bold text-emerald-600">{med.price}</p>
                      </div>
                      <Badge className={
                        med.status === "Available" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        med.status === "Low Stock" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                        "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      } variant="outline">
                        {med.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground"><FileEdit className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
