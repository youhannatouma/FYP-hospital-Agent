"use client"

import { AvatarAssistant } from "./avatar-assistant"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Pill,
  FlaskConical,
  FolderOpen,
  MessageSquare,
  CreditCard,
  Bot,
  Brain,
  User,
  ShieldCheck,
  LogOut,
  Heart,
  MessageCircle,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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

const mainNavItems = [
  { label: "Dashboard", href: "/patient", icon: LayoutDashboard },
  { label: "Doctors", href: "/patient/records", icon: FileText },
  { label: "Appointments", href: "/patient/appointments", icon: CalendarDays, badge: 3 },
  { label: "Medications", href: "/patient/medicines", icon: Pill },
  { label: "Lab Results", href: "/patient/lab-results", icon: FlaskConical, badge: 2 },
  { label: "Documents", href: "/patient/reports", icon: FolderOpen },
  { label: "Messages", href: "/patient/messages", icon: MessageSquare, badge: 4 },
  { label: "Billing", href: "/patient/billing", icon: CreditCard },
]

const aiNavItems = [
  { label: "AI Chat", href: "/patient/ai-assistant", icon: Bot },
  { label: "Health Insights", href: "/patient/mental-health", icon: Brain },
]

const settingsNavItems = [
  { label: "Profile", href: "/patient/settings", icon: User },
  { label: "Privacy", href: "/patient/settings?tab=privacy", icon: ShieldCheck },
]


export function PatientSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const isActive = (href: string) => {
    if (href === "/patient") return pathname === "/patient"
    return pathname.startsWith(href.split("?")[0])
  }

  return (
    
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex flex-col items-center gap-3">
          <Avatar
            className={`transition-all duration-200 ${
              isCollapsed ? "h-8 w-8" : "h-16 w-16"
            } ring-2 ring-primary/20`}
          >
            <AvatarImage src="/placeholder-user.jpg" alt="Sarah Johnson" />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              SJ
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-sidebar-foreground">
                Sarah Johnson
              </span>
              <span className="text-xs text-muted-foreground">
                Age: 42 - Female
              </span>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active Patient
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge && (
                    <SidebarMenuBadge className="bg-primary/10 text-primary">
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>AI Health Assistant</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Health Avatar - Embedded in Sidebar */}
        {/* AI Health Avatar - Embedded in Sidebar */}
        <div className={cn("px-3 pb-2", isCollapsed && "flex justify-center")}>
          <div className={cn(
            "rounded-xl transition-all duration-300",
            !isCollapsed && "bg-gradient-to-b from-indigo-600 to-violet-700 p-3 text-white"
          )}>
             <AvatarAssistant 
                position="sidebar" 
                className={isCollapsed ? "w-10 h-10" : "w-full"} 
              />
              
              {!isCollapsed && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg bg-white/10 p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Heart className="h-3 w-3 text-rose-300" />
                      <span className="text-[10px] font-medium text-white">Health Status</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={82} className="h-1.5 flex-1 bg-white/20 [&>div]:bg-emerald-400" />
                      <span className="text-[10px] font-medium text-white">82%</span>
                    </div>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-amber-500 text-white hover:bg-amber-600 border-0 h-7 text-xs"
                  >
                    <Link href="/patient/ai-assistant">
                      <MessageCircle className="mr-1.5 h-3 w-3" />
                      Start Chat
                    </Link>
                  </Button>
                </div>
              )}
          </div>
        </div>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
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
            <SidebarMenuButton tooltip="Logout" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
