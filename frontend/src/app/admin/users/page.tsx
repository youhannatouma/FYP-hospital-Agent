"use client"

import * as React from "react"
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  UserX, 
  Key, 
  Trash2, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Plus,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useDataStore, type User as HospitalUser } from "@/hooks/use-data-store"
import { useToast } from "@/hooks/use-toast"
import { DoctorDetailDialog } from "@/components/shared/dialogs/doctor-detail-dialog"
import { PatientDetailDialog } from "@/components/shared/dialogs/patient-detail-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UserManagementPage() {
  const { getUsers, addUser, deleteUser, updateUserStatus } = useDataStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filterRole, setFilterRole] = React.useState<"All" | "Patient" | "Doctor" | "Admin">("All")
  const [isAddDoctorOpen, setIsAddDoctorOpen] = React.useState(false)
  
  // Selected Profile State
  const [selectedUser, setSelectedUser] = React.useState<any>(null)
  const [isDoctorDialogOpen, setIsDoctorDialogOpen] = React.useState(false)
  const [isPatientDialogOpen, setIsPatientDialogOpen] = React.useState(false)

  const [newDoctor, setNewDoctor] = React.useState({
    name: "",
    email: "",
    specialty: "",
    password: ""
  })

  // Static disputes for UI demonstration (could be moved to store later)
  const [disputes] = React.useState([
    { id: "D-101", reporter: "Sarah Johnson", subject: "Overcharged for consultation", against: "Dr. Michael Smith", date: "Feb 09, 2024", status: "Open", urgency: "High" },
    { id: "D-102", reporter: "Robert Wilson", subject: "Rude behavior", against: "PharmaPlus North", date: "Feb 07, 2024", status: "Resolved", urgency: "Low" },
  ])

  const users = getUsers()

  const handleUpdateStatus = (userId: string, status: 'Active' | 'Suspended' | 'Pending') => {
    updateUserStatus(userId, status)
    toast({ 
      title: "Status Updated", 
      description: `User status changed to ${status}.` 
    })
  }

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId)
    toast({ 
      title: "Account Terminated", 
      description: "User has been removed from the registry." 
    })
  }

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault()
    addUser({
      name: newDoctor.name,
      email: newDoctor.email,
      role: 'Doctor',
      status: 'Active',
      specialty: newDoctor.specialty,
      verified: true
    })
    
    toast({ 
      title: "Provider Created", 
      description: `Account initialized for ${newDoctor.name}.` 
    })
    setIsAddDoctorOpen(false)
    setNewDoctor({ name: "", email: "", specialty: "", password: "" })
  }

  const openProfileDetail = (user: HospitalUser) => {
    setSelectedUser(user)
    if (user.role === "Doctor") {
      setIsDoctorDialogOpen(true)
    } else if (user.role === "Patient") {
      setIsPatientDialogOpen(true)
    } else {
      toast({ 
        title: "Access Restricted", 
        description: "Standard profile views are only available for Doctors and Patients." 
      })
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterRole === "All" || user.role === filterRole
    return matchesSearch && matchesFilter
  })

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
             User Registry
          </h1>
          <p className="text-muted-foreground mt-1">
            Global governance of clinical providers, staff, and patients.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
              <DialogTrigger asChild>
                <Button className="h-11 px-6 font-semibold gap-2">
                  <Plus className="h-4 w-4" /> Provision Provider
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Provision New Provider</DialogTitle>
                  <DialogDescription>
                    Register a new healthcare professional to the Care platform.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDoctor} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Dr. John Doe" 
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="j.doe@care.com" 
                      value={newDoctor.email}
                      onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input 
                      id="specialty" 
                      placeholder="Cardiology" 
                      value={newDoctor.specialty}
                      onChange={(e) => setNewDoctor({...newDoctor, specialty: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Initial Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={newDoctor.password}
                      onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                      required 
                    />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" className="w-full">Create Account</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-full max-w-md justify-start gap-1">
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">All Entities</TabsTrigger>
          <TabsTrigger value="disputes" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Resolution Center</TabsTrigger>
          <TabsTrigger value="verification" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6 animate-in fade-in duration-500">
          <Card className="border-sidebar-border bg-card/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search users..." 
                    className="pl-9 h-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 gap-2 font-medium">
                        <Filter className="h-4 w-4" />
                        Role: {filterRole}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setFilterRole("All")}>All Roles</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterRole("Patient")}>Patients</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterRole("Doctor")}>Doctors</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterRole("Admin")}>Admins</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[300px]">User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registry Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/20 transition-all group">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10 border border-sidebar-border">
                             <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                             <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
                               {getInitials(user.name)}
                             </AvatarFallback>
                           </Avatar>
                           <div className="flex flex-col">
                            <span 
                              className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer" 
                              onClick={() => openProfileDetail(user)}
                            >
                                {user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">{user.email || user.id.slice(0, 12)}</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-sidebar-border/50 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            user.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                            user.status === "Suspended" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                            "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }
                          variant="outline"
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.joined || "Jan 2024"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openProfileDetail(user)}>
                              <ArrowUpRight className="h-4 w-4" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Key className="h-4 w-4" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="gap-2 text-amber-600 cursor-pointer"
                              onClick={() => handleUpdateStatus(user.id, user.status === 'Suspended' ? 'Active' : 'Suspended')}
                            >
                              <UserX className="h-4 w-4" /> 
                              {user.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive cursor-pointer focus:bg-destructive/5"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        No users found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {disputes.map((dispute) => (
              <Card key={dispute.id} className="border-sidebar-border bg-card/50 flex flex-col justify-between group overflow-hidden relative">
                 <div className={`absolute top-0 right-0 h-1 w-full ${dispute.urgency === 'High' ? 'bg-rose-500' : 'bg-blue-400'}`} />
                 <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">CASE #{dispute.id}</span>
                    <Badge className={dispute.status === "Open" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}>
                      {dispute.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold leading-tight">{dispute.subject}</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Reporter</span>
                        <span className="font-semibold text-foreground">{dispute.reporter}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Subject</span>
                        <span className="font-semibold text-foreground">{dispute.against}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground italic leading-relaxed border-l-2 border-primary/20">
                    "Documentation upload required for final mediation phase."
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="ghost" className="flex-1 text-xs h-9" onClick={() => {
                      toast({ title: "Opening Case", description: `Loading audit trails for #${dispute.id}` })
                    }}>Audit Logs</Button>
                    <Button className="flex-1 text-xs h-9" onClick={() => {
                      toast({ title: "Entering Mediation", description: `Joining room for case #${dispute.id}` })
                    }}>Enter Mediation</Button>
                  </div>
                 </CardContent>
              </Card>
            ))}
            <Card className="border-2 border-dashed border-sidebar-border bg-transparent p-8 flex flex-col items-center justify-center text-center space-y-4 group cursor-pointer hover:border-primary/40 transition-all">
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-all text-muted-foreground group-hover:text-primary">
                    <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Report Conflict</h3>
                    <p className="text-xs text-muted-foreground mt-1 px-4">Manual intervention for system edge cases.</p>
                </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <DoctorDetailDialog 
        open={isDoctorDialogOpen}
        onOpenChange={setIsDoctorDialogOpen}
        doctor={selectedUser}
        isAdminView={true}
      />

      <PatientDetailDialog 
        open={isPatientDialogOpen}
        onOpenChange={setIsPatientDialogOpen}
        patient={selectedUser}
      />
    </div>
  )
}
