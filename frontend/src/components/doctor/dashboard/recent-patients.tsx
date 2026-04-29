
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useHospital } from "@/hooks/use-hospital";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export interface RecentPatientsProps {
  onSelectPatient?: (patient: any) => void
}

export function RecentPatients({ onSelectPatient }: RecentPatientsProps) {
  const { doctor } = useHospital();
  const { getToken } = useAuth();
  const [patients, setPatients] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRecentPatients = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        const data = await doctor.getRecentPatients(token || undefined);
        
        // Map the backend User model to what the UI expects
        const mappedPatients = data.map((u: any) => ({
          id: u.user_id,
          name: `${u.first_name} ${u.last_name}`,
          avatar: u.avatar_url || null,
          initials: `${(u.first_name || "U")[0]}${(u.last_name || "P")[0]}`,
          condition: u.role === "patient" ? "Patient" : u.role,
          lastVisit: u.last_active ? new Date(u.last_active).toLocaleDateString() : "Recent",
          raw: u
        }));
        setPatients(mappedPatients);
      } catch (error) {
        console.error('Failed to fetch recent patients', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentPatients();
  }, [doctor, getToken]);
  return (
    <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Recent Patients</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest">Identifying Patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="py-10 text-center text-xs font-bold text-muted-foreground italic">
            No recent patient activity recorded.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-primary/5 cursor-pointer group/item active:scale-98"
              onClick={() => onSelectPatient?.(patient)}
            >
              <Avatar className="size-9">
                <AvatarImage
                  src={patient.avatar || "/placeholder.svg"}
                  alt={patient.name}
                />
                <AvatarFallback className="bg-muted text-xs">
                  {patient.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium truncate">
                  {patient.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {patient.condition}
                </span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {patient.lastVisit}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
