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
      case "accepted":
        return "Accepted";
      case "in_progress":
        return "In Progress";
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
      case "accepted":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      case "in_progress":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse";
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

  const handleAction = async (e: React.MouseEvent, appointmentId: string, action: 'accept' | 'start' | 'complete') => {
    e.stopPropagation();
    try {
      const token = await getToken();
      if (action === 'accept') await booking.acceptAppointment(appointmentId, token || undefined);
      else if (action === 'start') await booking.startAppointment(appointmentId, token || undefined);
      else if (action === 'complete') await booking.completeAppointment(appointmentId, token || undefined);
      
      toast({
        title: `Appointment ${action === 'complete' ? 'Completed' : action + 'ed'}`,
        description: `Successfully updated appointment status.`
      });
      fetchAppointments();
    } catch (err) {
      toast({
        title: "Action Failed",
        description: "Could not update appointment status. Please try again.",
        variant: "destructive"
      });
    }
  };

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
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">
                  Patient
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">
                  Time
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">
                  Type
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">
                  Status
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => {
                const statusLabel = normalizeAppointmentStatus(apt.status);
                const rawStatus = String(apt.status || "").toLowerCase();

                return (
                  <TableRow
                    key={apt.appointment_id}
                    className="cursor-pointer hover:bg-primary/5 border-border/30 transition-all group/row"
                    onClick={() => onSelectAppointment?.(apt)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 border border-primary/10">
                          <AvatarImage
                            src={apt.avatar || "/placeholder.svg"}
                            alt={apt.patient_name}
                          />
                          <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">
                            {apt.patient_name?.[0] || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                           <span className="font-bold text-sm">
                            {apt.patient_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">
                            {apt.patient_email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-black text-foreground">
                      {apt.time ||
                        (apt.created_at
                          ? format(new Date(apt.created_at), "h:mm a")
                          : "--:--")}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground">
                      {apt.appointment_type}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${getStatusVariant(apt.status)}`}
                      >
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rawStatus === 'scheduled' && (
                          <Button
                            size="sm"
                            className="h-8 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-[10px] uppercase tracking-wider"
                            onClick={(e) => handleAction(e, apt.appointment_id, 'accept')}
                          >
                            Accept
                          </Button>
                        )}
                        {rawStatus === 'accepted' && (
                          <Button
                            size="sm"
                            className="h-8 rounded-xl bg-amber-600 text-white hover:bg-amber-700 font-bold text-[10px] uppercase tracking-wider"
                            onClick={(e) => handleAction(e, apt.appointment_id, 'start')}
                          >
                            Start Session
                          </Button>
                        )}
                        {rawStatus === 'in_progress' && (
                          <Button
                            size="sm"
                            className="h-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-[10px] uppercase tracking-wider"
                            onClick={(e) => handleAction(e, apt.appointment_id, 'complete')}
                          >
                            Finalize
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Loader2 className="h-3 w-3 opacity-0 group-hover/row:opacity-100 animate-spin absolute" />
                          <span className="group-hover/row:opacity-0 transition-opacity">...</span>
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
