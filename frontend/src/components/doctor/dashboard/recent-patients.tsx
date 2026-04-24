
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { apiClient } from "@/lib/api-client";

export interface RecentPatientsProps {
  onSelectPatient?: (patient: any) => void
}

export function RecentPatients({ onSelectPatient }: RecentPatientsProps) {
  const [patients, setPatients] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRecentPatients = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/doctors/recent-patients');
        // Map the backend User model to what the UI expects
        const mappedPatients = response.data.map((u: any) => ({
          id: u.user_id,
          name: `${u.first_name} ${u.last_name}`,
          avatar: u.avatar_url || null,
          initials: `${(u.first_name || "U")[0]}${(u.last_name || "P")[0]}`,
          condition: u.role === "patient" ? "Patient" : u.role,
          lastVisit: u.last_active ? new Date(u.last_active).toLocaleDateString() : "Recent",
        }));
        setPatients(mappedPatients);
      } catch (error) {
        console.error('Failed to fetch recent patients', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentPatients();
  }, []);
  return (
    <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Recent Patients</CardTitle>
      </CardHeader>
      <CardContent>
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
