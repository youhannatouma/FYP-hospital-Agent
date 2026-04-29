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
import { Button } from "@/components/ui/button";
import * as React from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useHospital } from "@/hooks/use-hospital";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";

export interface AppointmentsTableProps {
  onSelectAppointment?: (appointment: any) => void;
}

export function AppointmentsTable({
  onSelectAppointment,
}: AppointmentsTableProps) {
  const { booking } = useHospital();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchAppointments = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const data = await booking.getDoctorAppointments(token || undefined);
      setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch doctor appointments", error);
    } finally {
      setIsLoading(false);
    }
  }, [booking, getToken]);

  React.useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  function normalizeAppointmentStatus(status: string) {
    const raw = String(status || "").toLowerCase();
    switch (raw) {
      case "scheduled":
        return "Scheduled";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "pending":
        return "Pending";
      case "verified":
        return "Verified";
      case "confirmed":
        return "Confirmed";
      case "rejected":
        return "Rejected";
      case "waiting":
        return "Waiting";
      default:
        return status || "Unknown";
    }
  }

  function getStatusVariant(status: string) {
    const raw = String(status || "").toLowerCase();
    switch (raw) {
      case "scheduled":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "verified":
      case "confirmed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "waiting":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  }

  return (
    <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Clinical Appointment Requests
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {format(new Date(), "MMM d, yyyy")}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
              Retrieving Schedules...
            </p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground font-bold italic">
              No active appointments identified.
            </p>
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
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => {
                const statusLabel = normalizeAppointmentStatus(apt.status);

                return (
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
                        <span className="font-medium text-sm">
                          {apt.patient_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {apt.time ||
                        (apt.created_at
                          ? format(new Date(apt.created_at), "h:mm a")
                          : "--:--")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {apt.appointment_type}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-medium capitalize ${getStatusVariant(apt.status)}`}
                      >
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-lg text-muted-foreground"
                        >
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
