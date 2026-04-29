"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pill, Loader2, CheckCircle2, Search, User, CalendarDays } from "lucide-react"
import { useHospital } from "@/hooks/use-hospital"
import { useAuth } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"

export function PharmacyManagement() {
  const { pharmacy } = useHospital()
  const { getToken } = useAuth()
  const { toast } = useToast()
  
  const [prescriptions, setPrescriptions] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isFulfilling, setIsFulfilling] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")

  const fetchPrescriptions = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const token = await getToken()
      const data = await pharmacy.getPendingPrescriptions(token || undefined)
      setPrescriptions(data || [])
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err)
    } finally {
      setIsLoading(false)
    }
  }, [pharmacy, getToken])

  React.useEffect(() => {
    fetchPrescriptions()
  }, [fetchPrescriptions])

  const handleFulfill = async (id: string, patientName: string) => {
    setIsFulfilling(id)
    try {
      const token = await getToken()
      await pharmacy.fulfillPrescription(id, token || undefined)
      toast({
        title: "Medication Dispensed",
        description: `Prescription for ${patientName} has been marked as fulfilled.`,
      })
      fetchPrescriptions()
    } catch (err) {
      toast({
        title: "Dispensing Failed",
        description: "Could not update prescription status.",
        variant: "destructive"
      })
    } finally {
      setIsFulfilling(null)
    }
  }

  const filtered = prescriptions.filter(p => 
    p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.medications?.some((m: string) => m.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-6 border-b border-border/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner-glow">
                  <Pill className="h-6 w-6" />
                </div>
                Pharmacy Dispensary Queue
              </CardTitle>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1">
                Awaiting fulfillment • {prescriptions.length} Active Orders
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search patient or medicine..." 
                className="pl-10 rounded-xl bg-background/50 border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Scanning Digital Scripts...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
               <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 opacity-20" />
               </div>
               <p className="font-bold italic text-sm">No pending prescriptions found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-emerald-500/5">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest pl-8 py-4">Patient Information</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Prescribed Regimen</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Issuance Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-right pr-8">Fulfillment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="hover:bg-emerald-500/5 transition-all border-border/20 group">
                    <TableCell className="pl-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center text-xs font-black">
                            {p.patient_name?.[0] || "P"}
                         </div>
                         <div className="flex flex-col">
                            <span className="font-black text-foreground tracking-tight">{p.patient_name}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">ID: {p.patient_id?.slice(-6)}</span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        {p.medications?.map((m: string, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                             <span className="font-bold text-sm text-foreground tracking-tight">{m}</span>
                          </div>
                        ))}
                        <p className="text-[10px] text-muted-foreground italic mt-1 max-w-xs line-clamp-1">{p.instructions}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span className="text-xs font-bold">{p.created_at ? format(new Date(p.created_at), "MMM d, h:mm a") : "N/A"}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button 
                        disabled={isFulfilling === p.id}
                        onClick={() => handleFulfill(p.id, p.patient_name)}
                        className="rounded-2xl h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        {isFulfilling === p.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Pill className="h-3.5 w-3.5 mr-2" />
                        )}
                        Dispense Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
