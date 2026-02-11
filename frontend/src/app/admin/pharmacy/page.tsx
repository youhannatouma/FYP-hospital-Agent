"use client"

import * as React from "react"
import { 
  Pipette, 
  Warehouse, 
  AlertTriangle, 
  TrendingDown, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  Package, 
  DollarSign, 
  History,
  Building2,
  Table as TableIcon,
  Trash2,
  FileEdit,
  ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

const MOCK_PHARMACIES = [
  { id: "PH-001", name: "PharmaPlus Lagos", location: "Lagos, Nigeria", stockLevel: "85%", status: "Healthy", activeRefills: 450 },
  { id: "PH-002", name: "GreenCross Pharmacy", location: "Abuja, Nigeria", stockLevel: "32%", status: "Critical Stock", activeRefills: 120 },
  { id: "PH-003", name: "BioMed Pharmacy", location: "Port Harcourt, Nigeria", stockLevel: "92%", status: "Healthy", activeRefills: 380 },
]

const MOCK_MEDICINES = [
  { name: "Amoxicillin 500mg", category: "Antibiotic", price: "$12.50", stock: 1240, status: "Available" },
  { name: "Paracetamol 500mg", category: "Analgesic", price: "$4.20", stock: 5000, status: "Available" },
  { name: "Insulin Glargine", category: "Anti-diabetic", price: "$85.00", stock: 45, status: "Low Stock" },
  { name: "Sertraline 50mg", category: "Antidepressant", price: "$22.10", stock: 0, status: "Out of Stock" },
]

export default function PharmacyHubPage() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto min-h-screen bg-background text-foreground">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Pharmacy Hub</h1>
          <p className="text-muted-foreground mt-1">
            Oversee pharmacy inventories, monitor medicine availability, and manage pricing.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Warehouse className="mr-2 h-4 w-4" />
            Stock Reports
          </Button>
          <Button className="bg-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Add New Medicine
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">12 Medicines</p>
                <p className="text-xs text-muted-foreground">Below safety threshold</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Global Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">542,012</p>
                <p className="text-xs text-muted-foreground">Total items in stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Price Stability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">-2.4%</p>
                <p className="text-xs text-muted-foreground">Medicine price index (MoM)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pharmacies" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border border-border/50">
          <TabsTrigger value="pharmacies" className="gap-2"><Building2 className="h-4 w-4" />Pharmacies</TabsTrigger>
          <TabsTrigger value="catalog" className="gap-2"><TableIcon className="h-4 w-4" />Global Catalog</TabsTrigger>
          <TabsTrigger value="orders" className="gap-2"><History className="h-4 w-4" />Supply Chain</TabsTrigger>
        </TabsList>

        <TabsContent value="pharmacies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_PHARMACIES.map((pharmacy) => (
              <Card key={pharmacy.id} className="border-border/50 bg-card/50 hover:border-primary/30 transition-all group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">{pharmacy.id}</Badge>
                    <Badge className={
                      pharmacy.status === "Healthy" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }>
                      {pharmacy.status}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2 text-lg font-bold">{pharmacy.name}</CardTitle>
                  <CardDescription>{pharmacy.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                      <span>Stock Level</span>
                      <span>{pharmacy.stockLevel}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div 
                        className={`h-full rounded-full ${parseInt(pharmacy.stockLevel) < 40 ? "bg-rose-500" : "bg-primary"}`} 
                        style={{ width: pharmacy.stockLevel }} 
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs">
                      <p className="text-muted-foreground">Active Refills</p>
                      <p className="font-bold">{pharmacy.activeRefills}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">Medicine Database</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search medicine name..." className="pl-10 h-9 bg-muted/30" />
                  </div>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    Category
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {MOCK_MEDICINES.map((med, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/10 hover:border-primary/20 hover:bg-muted/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                        <Pipette className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm tracking-tight">{med.name}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">{med.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">In Stock</p>
                        <p className="text-xs font-bold">{med.stock} Units</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Market Price</p>
                        <p className="text-xs font-bold">{med.price}</p>
                      </div>
                      <Badge variant="outline" className={
                        med.status === "Available" ? "border-emerald-500/30 text-emerald-500" :
                        med.status === "Low Stock" ? "border-amber-500/30 text-amber-500" :
                        "border-rose-500/30 text-rose-500"
                      }>
                        {med.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground"><FileEdit className="h-3 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500"><Trash2 className="h-3 w-4" /></Button>
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
