"use client"

import { Calendar, Home, Inbox, Settings, FileText, Pill, Activity, User, Stethoscope } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { AIHealthSidebar } from "@/components/dashboard/ai-health-sidebar"

// Menu items.
const items = [
  {
    title: "Overview",
    url: "/patient",
    icon: Home,
  },
  {
    title: "Find Doctors",
    url: "/patient/doctors",
    icon: Stethoscope,
  },
  {
    title: "Appointments",
    url: "/patient/appointments",
    icon: Calendar,
  },
  {
    title: "Medical Records",
    url: "/patient/medical-records",
    icon: FileText,
  },
  {
    title: "Prescriptions",
    url: "/patient/prescriptions",
    icon: Pill,
  },
  {
    title: "Messages",
    url: "/patient/messages",
    icon: Inbox,
  },
  {
    title: "Settings",
    url: "/patient/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Care AI</span>
                <span className="truncate text-xs">Patient Portal</span>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Sidebar Widget - Hidden when collapsed */}
        <SidebarGroup className="mt-auto group-data-[collapsible=icon]:hidden">
            <SidebarGroupContent>
                <AIHealthSidebar />
            </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-sidebar-foreground">
                        <User className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">John Doe</span>
                        <span className="truncate text-xs">john@example.com</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
