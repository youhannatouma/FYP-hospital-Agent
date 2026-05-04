"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pill,
  RefreshCw,
  Clock,
  AlertTriangle,
  Search,
  Upload,
  MapPin,
  Phone,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Package,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Info,
} from "lucide-react"

import { useToast } from "@/components/ui/use-toast"
import { RefillRequestDialog } from "@/components/patient/dialogs/refill-request-dialog"
import { PharmacyOrderDialog } from "@/components/patient/dialogs/pharmacy-order-dialog"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function MedicinesPage() {
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState("")
  
  const [selectedPrescription, setSelectedPrescription] = useState<unknown | null>(null)
  const [showRefill, setShowRefill] = useState(false)
  
  const [selectedPharmacy, setSelectedPharmacy] = useState<unknown | null>(null)
  const [showOrder, setShowOrder] = useState(false)

  const [activePrescriptions] = useState([
    {
      id: 1,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "1x Daily",
      purpose: "Hypertension Control",
      doctor: "Dr. Michael Chen",
      startDate: "Oct 15, 2023",
      endDate: "Apr 15, 2024",
      refillsLeft: 2,
      progress: 60,
      status: "Active",
      nextDose: "08:00 AM",
      accent: "primary",
    },
    {
      id: 2,
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "1x Daily",
      purpose: "Lipid Management",
      doctor: "Dr. Michael Chen",
      startDate: "Nov 1, 2023",
      endDate: "May 1, 2024",
      refillsLeft: 5,
      progress: 45,
      status: "Active",
      nextDose: "09:00 PM",
      accent: "emerald",
    },
    {
      id: 3,
      name: "Aspirin",
      dosage: "81mg",
      frequency: "1x Daily",
      purpose: "Cardiac Protection",
      doctor: "Dr. Emily Watson",
      startDate: "Sep 1, 2023",
      endDate: "Ongoing",
      refillsLeft: 8,
      progress: 100,
      status: "Controlled",
      nextDose: "08:00 AM",
      accent: "blue",
    },
  ])

  const [pastPrescriptions] = useState([
    {
      id: 4,
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "3x Daily",
      purpose: "Bacterial Infection",
      doctor: "Dr. Emily Watson",
      startDate: "Dec 1, 2023",
      endDate: "Dec 14, 2023",
      status: "Completed",
    },
  ])

  const [pharmacyResults] = useState([
    {
      id: 1,
      name: "CVS Specialty Pharmacy",
      distance: "0.5 mi",
      address: "123 Main St, Downtown",
      phone: "(555) 123-4567",
      price: "$12.99",
      inStock: true,
      deliveryAvailable: true,
    },
    {
      id: 2,
      name: "Walgreens Health",
      distance: "1.2 mi",
      address: "456 Oak Ave, Westside",
      phone: "(555) 234-5678",
      price: "$14.49",
      inStock: true,
      deliveryAvailable: false,
    },
  ])

  const handleRefill = (rx: unknown) => {
    setSelectedPrescription(rx)
    setShowRefill(true)
  }

  const handleOrder = (pharmacy: unknown) => {
    setSelectedPharmacy(pharmacy)
    setShowOrder(true)
  }

  const handleUpload = () => {
    toast({
      title: "Scanner Initialized",
      description: "Please capture a high-resolution image of your script.",
    })
  }

  return (
    <m.div 
      className="flex flex-col gap-10 max-w-[1200px] mx-auto pb-24"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between px-2 pt-4">
        <div className="space-y-4">
          <Badge variant="outline" className="border-blue-500/20 text-blue-500 bg-blue-500/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
            Pharmacotherapy Registry
          </Badge>
          <h1 className="text-4xl font-black text-foreground tracking-tight leading-none lg:text-5xl">
            My Medications
          </h1>
          <p className="text-muted-foreground mt-4 font-medium text-lg max-w-lg leading-relaxed">
            Curated medication protocols. Maintain strict adherence for optimal therapeutic outcomes.
          </p>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
           <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center border border-border/50 text-blue-500 shadow-sm">
             <Clock className="h-5 w-5" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Compliance</p>
              <p className="text-xs font-bold text-foreground">98.4% Adherence</p>
           </div>
        </div>
      </div>

      <Tabs defaultValue="prescriptions" className="w-full">
        <div className="px-2 mb-10">
          <TabsList className="bg-muted/50 p-1.5 rounded-2xl border border-border/50 max-w-fit h-auto flex flex-wrap">
            <TabsTrigger value="prescriptions" className="rounded-xl px-8 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              Active Protocol
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl px-8 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              Historical
            </TabsTrigger>
            <TabsTrigger value="finder" className="rounded-xl px-8 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              Pharmacy Hub
            </TabsTrigger>
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent value="prescriptions" className="flex flex-col gap-8 px-2 outline-none">
            {activePrescriptions.map((rx, idx) => (
              <m.div
                key={rx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="premium-card rounded-[2.5rem] border-none shadow-premium bg-card overflow-hidden group">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Left: Product Info */}
                      <div className="flex items-start gap-6 lg:w-1/3">
                        <div className={cn(
                          "flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] shadow-inner-glow group-hover:scale-110 transition-transform duration-500",
                          rx.accent === 'primary' ? 'bg-primary/10 text-primary' : 
                          rx.accent === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 
                          'bg-blue-500/10 text-blue-500'
                        )}>
                          <Pill className="h-8 w-8" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-xl font-black text-foreground tracking-tight underline decoration-primary/20 underline-offset-4 leading-none group-hover:text-primary transition-colors">
                               {rx.name}
                             </h3>
                             <Badge className={cn("border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg", 
                               rx.accent === 'primary' ? 'bg-primary/10 text-primary' : 
                               rx.accent === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 
                               'bg-blue-500/10 text-blue-500'
                             )}>
                               {rx.status}
                             </Badge>
                          </div>
                          <p className="text-sm font-bold text-muted-foreground">{rx.purpose}</p>
                        </div>
                      </div>

                      {/* Middle: Regimen */}
                      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 py-6 lg:py-0 border-y lg:border-y-0 lg:border-x border-border/30 lg:px-8">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Dosage</span>
                          <p className="text-sm font-black text-foreground">{rx.dosage}</p>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Frequency</span>
                          <p className="text-sm font-black text-foreground">{rx.frequency}</p>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Refills Left</span>
                          <p className={cn("text-sm font-black", rx.refillsLeft <= 2 ? "text-amber-500" : "text-foreground")}>{rx.refillsLeft}</p>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none flex items-center gap-1.5">
                             <Clock className="h-3 w-3" /> Next Dose
                          </span>
                          <p className="text-sm font-black text-foreground">{rx.nextDose}</p>
                        </div>
                      </div>

                      {/* Right: Action */}
                      <div className="lg:w-1/4 flex flex-col justify-center">
                         <Button 
                          className="w-full bg-slate-900 text-white hover:bg-amber-500 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-glow gap-2 active:scale-95 transition-all"
                          onClick={() => handleRefill(rx)}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Initialize Refill
                        </Button>
                        {rx.refillsLeft <= 2 && (
                          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                            <AlertTriangle className="h-3 w-3" />
                            Supply Depletion Warning
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-border/20">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">
                        <span>Therapeutic Timeline</span>
                        <span>{rx.progress}% Adherence</span>
                      </div>
                      <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-border/30">
                         <m.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${rx.progress}%` }}
                           transition={{ duration: 1.5, ease: "circOut" }}
                           className={cn("h-full", 
                             rx.accent === 'primary' ? 'bg-primary' : 
                             rx.accent === 'emerald' ? 'bg-emerald-500' : 
                             'bg-blue-500'
                           )} 
                         />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase mt-2 opacity-50">
                        <span>Initiated {rx.startDate}</span>
                        <span>Expires {rx.endDate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </m.div>
            ))}
          </TabsContent>

          <TabsContent value="history" className="flex flex-col gap-6 px-2 outline-none">
            {pastPrescriptions.map((rx) => (
              <Card key={rx.id} className="premium-card rounded-[2rem] border-none bg-card/50 p-6 flex items-center gap-6 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                   <Pill className="h-6 w-6" />
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-foreground uppercase tracking-tight">{rx.name}</h3>
                      <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest rounded-lg">{rx.status}</Badge>
                   </div>
                   <p className="text-xs font-bold text-muted-foreground mt-1 opacity-70">Completed Protocol • Prescribed by {rx.doctor}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{rx.startDate} – {rx.endDate}</p>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="finder" className="flex flex-col gap-8 px-2 outline-none">
            <Card className="premium-card rounded-[2.5rem] border-none bg-slate-900 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-transparent opacity-50" />
              <CardContent className="relative z-10 p-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="space-y-4 text-center md:text-left md:max-w-md">
                   <div className="h-14 w-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-glow shadow-blue-500/30 mx-auto md:mx-0">
                      <Upload className="h-7 w-7 text-white" />
                   </div>
                   <h2 className="text-2xl font-black text-white tracking-tight">Rapid Sourcing</h2>
                   <p className="text-slate-400 text-sm font-medium leading-relaxed">
                     Upload your physical prescription dossier. Our engine will OCR the data and source availability across regional pharmacy nodes.
                   </p>
                   <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95" onClick={handleUpload}>
                     Connect Local File
                   </Button>
                </div>
                
                <div className="hidden lg:block">
                   <div className="w-64 h-64 bg-slate-800/50 rounded-full border border-white/5 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
                      <Pill className="h-24 w-24 text-blue-500/20 rotate-12" />
                   </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
               <div className="relative max-w-xl mx-auto md:mx-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search regional pharmacy nodes by name or geolocation..." 
                    className="h-14 pl-12 rounded-2xl bg-card border-border/50 font-medium shadow-subtle focus:ring-primary/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {pharmacyResults.map((pharmacy) => (
                   <Card key={pharmacy.id} className="premium-card rounded-[2rem] border-none bg-card shadow-premium p-8 group">
                      <div className="flex items-start justify-between mb-8">
                         <div className="space-y-2">
                            <h4 className="text-xl font-black text-foreground tracking-tight underline-offset-8 decoration-primary/20 underline transition-colors group-hover:text-primary leading-tight">
                              {pharmacy.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">
                               <MapPin className="h-3 w-3" /> {pharmacy.address} • {pharmacy.distance}
                            </div>
                         </div>
                         <div className="text-2xl font-black text-primary leading-none">{pharmacy.price}</div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {pharmacy.inStock ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                            STOCK VERIFIED
                          </Badge>
                        ) : (
                          <Badge className="bg-destructive/10 text-destructive border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                            OUT OF STOCK
                          </Badge>
                        )}
                        {pharmacy.deliveryAvailable && (
                          <Badge className="bg-blue-500/10 text-blue-500 border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                             PRIORITY DELIVERY
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-3">
                         <Button 
                          className="flex-1 bg-slate-900 text-white hover:bg-primary h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-subtle transition-all active:scale-95 gap-2"
                          disabled={!pharmacy.inStock}
                          onClick={() => handleOrder(pharmacy)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Order
                        </Button>
                        <Button variant="outline" className="flex-1 h-12 rounded-xl border-border/50 font-black text-[10px] uppercase tracking-widest hover:bg-muted/50 transition-all">
                          Lock Price
                        </Button>
                      </div>
                   </Card>
                 ))}
               </div>
            </div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      <div className="mt-8 mx-2 bg-muted/20 p-6 rounded-3xl border border-dashed border-border/50 flex items-start gap-5">
         <Info className="h-6 w-6 text-primary shrink-0 mt-1" />
         <div className="space-y-1">
            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Protocol Intelligence</h4>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-3xl">
              Medication adherence is the primary factor in longitudinal health success. Use the specialized refill protocol 72 hours prior to supply depletion to ensure zero-latency therapy continuation.
            </p>
         </div>
      </div>

      <RefillRequestDialog 
        open={showRefill} 
        onOpenChange={setShowRefill}
        prescription={selectedPrescription}
      />
      <PharmacyOrderDialog 
        open={showOrder} 
        onOpenChange={setShowOrder}
        pharmacy={selectedPharmacy}
      />
    </m.div>
  )
}
