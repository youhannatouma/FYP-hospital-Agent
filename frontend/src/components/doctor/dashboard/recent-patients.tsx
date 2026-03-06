
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface RecentPatientsProps {
  onSelectPatient?: (patient: any) => void
}

export function RecentPatients({ onSelectPatient }: RecentPatientsProps) {
  const [patients, setPatients] = React.useState([
    {
      id: 1,
      name: "Anna Martinez",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
      initials: "AM",
      condition: "Hypertension",
      lastVisit: "Today",
    },
    {
      id: 2,
      name: "David Lee",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
      initials: "DL",
      condition: "Arrhythmia",
      lastVisit: "Yesterday",
    },
    {
      id: 3,
      name: "Lisa Wang",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
      initials: "LW",
      condition: "Post-surgery",
      lastVisit: "2 days ago",
    },
    {
      id: 4,
      name: "Thomas Clark",
      avatar:
        "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop&crop=face",
      initials: "TC",
      condition: "Chest Pain",
      lastVisit: "3 days ago",
    },
    {
      id: 5,
      name: "Maria Garcia",
      avatar:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face",
      initials: "MG",
      condition: "Heart Murmur",
      lastVisit: "4 days ago",
    },
  ]);

  // API Endpoints Suggestion:
  // GET: /doctor/patients/recent -> Fetch recently visited patients for the doctor
  /*
    React.useEffect(() => {
      const fetchRecentPatients = async () => {
        try {
          // const response = await apiClient.get('/doctor/patients/recent');
          // setPatients(response.data);
        } catch (error) {
          console.error('Failed to fetch recent patients', error);
        }
      };
      fetchRecentPatients();
    }, []);
  */
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
