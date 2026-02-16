"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldAlert,
  Pipette,
  BookOpen,
  MessageSquare,
  Activity,
  BarChart3,
  LogOut,
  ShieldCheck,
  Bell,
  Search,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { useUser, SignOutButton } from "@clerk/nextjs"

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Configuration", href: "/admin/configuration", icon: Settings },
  { label: "Knowledge Base", href: "/admin/knowledge", icon: BookOpen },
  { label: "Support & Comms", href: "/admin/support", icon: MessageSquare },
  { label: "Compliance", href: "/admin/compliance", icon: ShieldAlert },
  { label: "Pharmacy Hub", href: "/admin/pharmacy", icon: Pipette },
]

const analyticsNavItems = [
  { label: "User Trends", href: "/admin?tab=trends", icon: Activity },
  { label: "Revenue", href: "/admin?tab=revenue", icon: BarChart3 },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const { user } = useUser()
  const isCollapsed = state === "collapsed"

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href.split("?")[0])
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex flex-col items-center gap-3">
          <Avatar
            className={`transition-all duration-200 ${
              isCollapsed ? "h-8 w-8" : "h-16 w-16"
            } ring-2 ring-primary/20 shadow-lg shadow-primary/10`}
          >
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || "Admin"} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              <ShieldCheck className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-bold text-sidebar-foreground">
                {user?.fullName || "Administrator"}
              </span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">
                Root Admin
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>System Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    className="group"
                  >
                    <Link href={item.href}>
                      <item.icon className={cn(
                        "h-4 w-4 transition-colors",
                        isActive(item.href) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Global Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    className="group"
                  >
                    <Link href={item.href}>
                      <item.icon className={cn(
                        "h-4 w-4 transition-colors",
                        isActive(item.href) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SignOutButton>
              <SidebarMenuButton tooltip="Logout" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Logout</span>
              </SidebarMenuButton>
            </SignOutButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
