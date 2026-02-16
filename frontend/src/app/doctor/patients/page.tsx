"use client";

import { useDataStore } from "@/hooks/use-data-store";
import { columns, type Patient } from "@/components/doctor/dashboard/patient/columns";
import { DataTable } from "@/components/doctor/dashboard/patient/table-patient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Users } from "lucide-react";

export default function PatientsPage() {
  const { users, records, appointments } = useDataStore();
  
  const patients = users.filter(u => u.role === 'Patient');
  
  const mappedData: Patient[] = patients.map(p => {
    // Calculate age from dateOfBirth
    let age = 0;
    if (p.dateOfBirth) {
      const birthDate = new Date(p.dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Find latest medical record for condition
    const patientRecords = records
      .filter(r => r.patientId === p.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Find latest completed appointment for last visit
    const lastApt = appointments
      .filter(a => a.patientId === p.id && a.status === 'Completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return {
      id: p.id,
      name: p.name,
      age: age,
      gender: p.gender || "N/A",
      condition: patientRecords[0]?.diagnosis || "No Diagnosis",
      lastVisit: lastApt?.date || "Never",
      email: p.email,
      status: p.status === 'Active' ? 'Active' : p.status === 'Pending' ? 'Recovering' : 'Follow-up'
    };
  });

  const stat = {
    icon: Users,
    value: `${mappedData.length} Patients`,
    label: "Total Patients",
    status: "+0.0%\nthis month",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    iconBg: "bg-rose-50 dark:bg-rose-500/10",
    iconColor: "text-rose-500",
    updated: "Live data",
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Patients</h1>
        <p className="text-muted-foreground text-sm">Manage and view detailed profiles for all your patients.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 mb-8">
        <Card className="border border-border bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <Badge variant="secondary" className={`text-[10px] font-medium ${stat.statusColor} border-0`}>
                {stat.status}
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-card-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <DataTable columns={columns} data={mappedData} />
      </div>
    </div>
  );
}
