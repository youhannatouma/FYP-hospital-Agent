"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

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
  UserCheck,
  Plus
} from "lucide-react"
import { m } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPortal,
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



import { useHospital } from "@/hooks/use-hospital"
import { useAuth } from "@clerk/nextjs"
import { toast } from "@/hooks/use-toast"

type ApiUser = {
  user_id: string
  first_name?: string
  last_name?: string
  email?: string
  role?: string
  status?: string
  created_at?: string
}

type UiUser = {
  id: string
  name: string
  email: string
  role: string
  status: string
  joined: string
  lastActive: string
  verified: boolean
}

export default function UserManagementPage() {
  const { admin } = useHospital()
  const { getToken } = useAuth()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filterRole, setFilterRole] = React.useState("All")
  const [users, setUsers] = React.useState<UiUser[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isAddDoctorOpen, setIsAddDoctorOpen] = React.useState(false)
  const [newDoctor, setNewDoctor] = React.useState({
    name: "",
    email: "",
    customId: "",
    password: ""
  })

  const loadUsers = React.useCallback(async () => {
    setLoading(true)
    const token = await getToken()
    try {
      const data = await admin.getAllUsers(token || undefined)
      if (Array.isArray(data)) {
        const mappedUsers = (data as ApiUser[]).map((u) => ({
          id: u.user_id,
          name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Unknown User",
          email: u.email || "",
          role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "Unknown",
          status: u.status || "Active",
          joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : "Unknown",
          lastActive: "Recent", // Requires proper last_login tracking in backend
          verified: true
        }))
        setUsers(mappedUsers)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [admin, getToken])

  React.useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleUpdateStatus = async (userId: string, status: string) => {
    const token = await getToken()
    const result = await admin.updateStatus('users', userId, status, token || undefined)
    if (result) {
      toast({ title: "Success", description: `User status updated to ${status}` })
      loadUsers()
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const token = await getToken()
    const result = await admin.deleteUser(userId, token || undefined)
    if (result) {
      toast({ title: "Deleted", description: "User account has been removed" })
      loadUsers()
    }
  }

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = await getToken()
    const result = await admin.addDoctor(newDoctor, token || undefined)
    if (result) {
      toast({ title: "Success", description: "Doctor added successfully" })
      setIsAddDoctorOpen(false)
      setNewDoctor({ name: "", email: "", customId: "", password: "" })
      loadUsers()
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterRole === "All" || user.role === filterRole
    return matchesSearch && matchesFilter
  })

  return (
    <m.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto min-h-screen bg-background text-foreground"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight font-heading">User Management</h1>
          <p className="text-muted-foreground">Manage patients, doctors, and institutional stakeholders.</p>
        </div>
        <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" /> Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>
                Register a new healthcare professional to the system.
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
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john.doe@med.com" 
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctorId">Doctor ID</Label>
                <Input 
                  id="doctorId" 
                  placeholder="DOC-12345" 
                  value={newDoctor.customId}
                  onChange={(e) => setNewDoctor({...newDoctor, customId: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={newDoctor.password}
                  onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                  required 
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Create Doctor Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border border-border/50">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="disputes">
            Dispute Resolution
            <Badge className="ml-2 bg-destructive/20 text-destructive border-0">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="verification">Verification Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-xl font-bold">Registry</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search name or email..." 
                      className="pl-10 h-9 bg-muted/30"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-2">
                        <Filter className="h-4 w-4" />
                        {filterRole}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setFilterRole("All")}>All Roles</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterRole("Patient")}>Patients</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterRole("Doctor")}>Doctors</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterRole("Pharmacy")}>Pharmacies</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold flex items-center gap-1">
                            {user.name}
                            {"verified" in user && (
                              <UserCheck className="h-3 w-3 text-primary" />
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary/20 text-primary font-medium">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            user.status === "Active" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" :
                            user.status === "Suspended" ? "bg-destructive/10 text-destructive hover:bg-destructive/20" :
                            "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                          }
                          variant="secondary"
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.joined}</TableCell>
                      <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <ArrowUpRight className="h-4 w-4" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Key className="h-4 w-4" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="gap-2 text-warning cursor-pointer"
                              onClick={() => handleUpdateStatus(user.id, user.status === 'Suspended' ? 'Active' : 'Suspended')}
                            >
                              <UserX className="h-4 w-4" /> 
                              {user.status === 'Suspended' ? 'Reactivate Account' : 'Suspend Account'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive cursor-pointer"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground w-full col-span-full opacity-60">
              <AlertCircle className="h-10 w-10 mb-4" />
              <p className="font-bold uppercase tracking-widest text-sm">Dispute Module Offline</p>
              <p className="text-xs mt-2 max-w-md">The dispute resolution system is currently being integrated with the new clinical operations core. Check back later.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </m.div>
  )
}
