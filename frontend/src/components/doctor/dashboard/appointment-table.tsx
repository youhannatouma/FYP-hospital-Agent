import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getServiceContainer } from "@/lib/services/service-container";
import * as React from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export interface AppointmentsTableProps {
  onSelectAppointment?: (appointment: unknown) => void
}

type DoctorAppointment = {
  appointment_id: string
  patient_name?: string
  appointment_type?: string
  status?: string
  time?: string
  created_at?: string
  avatar?: string
}

export function AppointmentsTable({ onSelectAppointment }: AppointmentsTableProps) {
  const [appointments, setAppointments] = React.useState<DoctorAppointment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const container = getServiceContainer();
        const data = await container.appointment.getDoctorAppointments();
        setAppointments((Array.isArray(data) ? data : []) as unknown as DoctorAppointment[]);
      } catch (error) {
        console.error('[AppointmentsTable] Failed to fetch doctor appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  function getStatusVariant(status: string) {
    switch (status) {
      case "Confirmed":
        return "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))] border-[hsl(var(--chart-4))]/20";
      case "In Progress":
        return "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/20";
      case "Waiting":
        return "bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] border-[hsl(var(--accent))]/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  }

  return (
    <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Today&apos;s Appointments
          </CardTitle>
          <span className="text-sm text-muted-foreground">{format(new Date(), "MMM d, yyyy")}</span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Retrieving Schedules...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground font-bold italic">No active appointments identified for today.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Patient
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Time
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Type
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => (
                <TableRow 
                  key={apt.appointment_id} 
                  className="cursor-pointer hover:bg-primary/5 transition-colors group/row"
                  onClick={() => onSelectAppointment?.(apt)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage
                          src={apt.avatar || "/placeholder.svg"}
                          alt={apt.patient_name}
                        />
                        <AvatarFallback className="bg-muted text-xs">
                          {apt.patient_name?.[0] || "P"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{apt.patient_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {apt.time || (apt.created_at ? format(new Date(apt.created_at), "h:mm a") : "--:--")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {apt.appointment_type}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-medium capitalize ${getStatusVariant(apt.status || "")}`}
                    >
                      {apt.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
