import { columns, Payment } from "@/components/doctor/dashboard/patient/columns";
import { DataTable } from "@/components/doctor/dashboard/patient/table-patient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

const stat = {
    icon: User,
    value: "1,284 Patient",
    label: "Total Patients",
    status: "+12.5% vs last month",
    // Using CSS variables instead of hardcoded colors
    statusColor: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    iconBg: "bg-primary/10 dark:bg-primary/20",
    iconColor: "text-primary dark:text-primary/80",
    updated: "Last updated: 2 hours ago",
};

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    // ... your data
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ... rest of your data
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <div>
        <h1 className="text-2xl font-bold mb-4 text-card-foreground">Patients</h1>
      </div>
      <div>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <Badge
              >

                <div className={`text-xs font-medium ${stat.statusColor} border-0`}>
                  {stat.status}
                </div>
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-card-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{stat.updated}</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}