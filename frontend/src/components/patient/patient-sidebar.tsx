"use client"
/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/purity */

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { useUserProfile } from "@/hooks/use-user-profile"
import {
  LayoutDashboard,
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
  Activity,
  Stethoscope,
  History,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { m } from "framer-motion"
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

import ThreeAvatar from "../ThreeAvatar"

const mainNavItems = [
  { label: "Dashboard", href: "/patient", icon: LayoutDashboard },
  { label: "Find Doctors", href: "/patient/find-doctor", icon: Stethoscope },
  { label: "Clinical History", href: "/patient/clinical-history", icon: History },
  { label: "Medical Records", href: "/patient/records", icon: ShieldCheck },
  { label: "Appointments", href: "/patient/appointments", icon: CalendarDays },
  { label: "Medications", href: "/patient/medicines", icon: Pill },
  { label: "Lab Results", href: "/patient/lab-results", icon: FlaskConical },
  { label: "Documents", href: "/patient/reports", icon: FolderOpen },
  { label: "Messages", href: "/patient/messages", icon: MessageSquare },
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
  const { signOut } = useClerk()
  const { profile, isLoading, fullName, initials } = useUserProfile()

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === "/patient") return pathname === "/patient"
    return pathname.startsWith(href.split("?")[0])
  }

  const handleSignOut = () => signOut({ redirectUrl: "/sign-in" })

  // Derive a short patient subtitle
  const patientSubtitle = (() => {
    if (isLoading) return null
    const parts: string[] = []
    if (profile?.date_of_birth) {
      const age = Math.floor(
        (Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000)
      )
      parts.push(`Age: ${age}`)
    }
    if (profile?.gender) parts.push(profile.gender)
    if (profile?.blood_type) parts.push(profile.blood_type)
    return parts.length > 0 ? parts.join(" · ") : "Patient"
  })()

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex flex-col items-center gap-3">
          <Avatar
            className={`transition-all duration-200 ${
              isCollapsed ? "h-8 w-8" : "h-16 w-16"
            } ring-2 ring-primary/20`}
          >
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {isLoading ? <Activity className="h-5 w-5 animate-pulse" /> : initials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col items-center text-center w-full">
              {isLoading ? (
                <div className="space-y-1.5 w-full flex flex-col items-center">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              ) : (
                <>
                  <span className="text-sm font-semibold text-sidebar-foreground">
                    {fullName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {patientSubtitle}
                  </span>
                </>
              )}
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
            <SidebarMenu className="gap-1 px-2">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    className={cn(
                      "relative h-10 transition-all duration-300 rounded-lg group",
                      isActive(item.href)
                        ? "bg-primary/5 text-primary font-bold"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3 w-full px-3">
                      <div
                        className={cn(
                          "relative flex items-center justify-center h-5 w-5 transition-transform duration-300",
                          isActive(item.href) ? "scale-110" : "group-hover:scale-110"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {isActive(item.href) && (
                          <m.div
                            layoutId="activeIndicatorPatient"
                            className="absolute -left-3 w-1 h-5 bg-primary rounded-r-full"
                          />
                        )}
                      </div>
                      <span className="text-sm tracking-tight">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
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
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
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

        {/* AI Health Avatar */}
        <div className={cn("px-3 pb-2", isCollapsed && "flex justify-center")}>
          <div
            className={cn(
              "rounded-xl transition-all duration-300",
              !isCollapsed && "bg-gradient-to-b from-indigo-600 to-violet-700 p-3 text-white"
            )}
          >
            <div className="flex items-center justify-center overflow-hidden rounded-2xl bg-white/5 border border-white/10">
              <div className="translate-y-8">
                <ThreeAvatar size={isCollapsed ? 32 : 160} />
              </div>
            </div>

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

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/50">
            Account Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    className={cn(
                      "h-9 rounded-lg transition-colors group",
                      isActive(item.href)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3 px-3">
                      <item.icon className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">{item.label}</span>
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
            <SidebarMenuButton
              tooltip="Sign Out"
              onClick={handleSignOut}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
