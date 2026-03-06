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

const appointments = [
  {
    id: 1,
    patient: "Michael Johnson",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    initials: "MJ",
    time: "9:00 AM",
    type: "Check-up",
    status: "Confirmed",
  },
  {
    id: 2,
    patient: "Emily Davis",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    initials: "ED",
    time: "9:30 AM",
    type: "Follow-up",
    status: "In Progress",
  },
  {
    id: 3,
    patient: "James Wilson",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    initials: "JW",
    time: "10:15 AM",
    type: "Consultation",
    status: "Waiting",
  },
  {
    id: 4,
    patient: "Sarah Thompson",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    initials: "ST",
    time: "11:00 AM",
    type: "ECG Test",
    status: "Confirmed",
  },
  {
    id: 5,
    patient: "Robert Brown",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    initials: "RB",
    time: "11:45 AM",
    type: "Check-up",
    status: "Confirmed",
  },
];

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

export interface AppointmentsTableProps {
  onSelectAppointment?: (appointment: any) => void
}

export function AppointmentsTable({ onSelectAppointment }: AppointmentsTableProps) {
  return (
    <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Today&apos;s Appointments
          </CardTitle>
          <span className="text-sm text-muted-foreground">Feb 8, 2026</span>
        </div>
      </CardHeader>
      <CardContent>
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
                key={apt.id} 
                className="cursor-pointer hover:bg-primary/5 transition-colors group/row"
                onClick={() => onSelectAppointment?.(apt)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage
                        src={apt.avatar || "/placeholder.svg"}
                        alt={apt.patient}
                      />
                      <AvatarFallback className="bg-muted text-xs">
                        {apt.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{apt.patient}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {apt.time}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {apt.type}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-medium ${getStatusVariant(apt.status)}`}
                  >
                    {apt.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
