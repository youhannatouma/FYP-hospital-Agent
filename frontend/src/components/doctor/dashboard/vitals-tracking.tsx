"use client"
import { useEffect, useState } from "react"
import { useHospital } from "@/hooks/use-hospital"
import { useAuth } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Loader2, LineChart as ChartIcon } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface VitalsTrackingProps {
  selectedPatient?: any;
}

export function VitalsTracking({ selectedPatient }: VitalsTrackingProps) {
  const { medicalRecords } = useHospital();
  const { getToken } = useAuth();
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [period] = useState("7d")

  useEffect(() => {
    if (!selectedPatient) {
      setChartData([]);
      return;
    }

    const fetchVitals = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        const records = await medicalRecords.getPatientRecords(selectedPatient.id, token || undefined);
        
        const extracted = records
          .filter((r: any) => r.vitals && typeof r.vitals === 'object')
          .map((r: any) => ({
            date: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            systolic: r.vitals.systolic,
            diastolic: r.vitals.diastolic,
            heartRate: r.vitals.heart_rate || r.vitals.heartRate,
          }))
          .reverse();
        
        setChartData(extracted);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVitals();
  }, [medicalRecords, getToken, selectedPatient]);

  return (
    <Card className="premium-card rounded-[2.5rem] border-none shadow-premium overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <CardTitle className="flex items-center gap-2 text-xl font-black text-card-foreground">
          <Activity className="h-6 w-6 text-primary" />
          Vitals Tracking
          {selectedPatient && (
            <span className="text-xs font-bold text-muted-foreground ml-2">
              - {selectedPatient.name}
            </span>
          )}
        </CardTitle>
        <Select defaultValue={period}>
          <SelectTrigger className="w-36 h-10 rounded-xl bg-muted/50 border-border/50 font-bold text-xs uppercase tracking-widest">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/50">
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-80 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !selectedPatient ? (
          <div className="flex h-80 w-full flex-col items-center justify-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center opacity-20">
              <ChartIcon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">No Patient Selected</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mt-1">Select a patient from the list above to view trends</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-80 w-full flex-col items-center justify-center gap-4 text-center">
             <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center opacity-20">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">No Vitals Recorded</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mt-1">This patient has no clinical vitals history recorded.</p>
            </div>
          </div>
        ) : (
          <div className="h-80 w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/30" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "16px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "10px", fontWeight: "black", textTransform: "uppercase", letterSpacing: "0.05em" }} 
              />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="hsl(var(--primary))"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Systolic"
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="hsl(var(--accent))"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Diastolic"
              />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="hsl(var(--destructive))"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Heart Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        )}
      </CardContent>
    </Card>
  )
}
