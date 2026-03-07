"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Pill,
  FlaskConical,
  Users, // Changed from FolderOpen
  MessageSquare,
  CreditCard,
  Bot,
  Brain,
  User,
  ShieldCheck,
  LogOut,
  Heart,
  MessageCircle,
  FileText as PrescriptionIcon, // Better icon for prescription
  Stethoscope, // Doctor-specific icon
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { m, AnimatePresence } from "framer-motion";
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
} from "@/components/ui/sidebar";

import ThreeAvatar from "../ThreeAvatar"

const mainNavItems = [
  { label: "Dashboard", href: "/doctor", icon: LayoutDashboard },
  { label: "Medical Records", href: "/doctor/records", icon: FileText },
  {
    label: "Appointments",
    href: "/doctor/appointments",
    icon: CalendarDays,
    badge: 3,
  },
  {
    label: "Lab Results",
    href: "/doctor/lab-results",
    icon: FlaskConical,
    badge: 2,
  },
  { label: "My Patients", href: "/doctor/patients", icon: Users }, // Fixed icon
  {
    label: "Messages",
    href: "/doctor/messages",
    icon: MessageSquare,
    badge: 4,
  },
];

const aiNavItems = [
  { label: "AI Assistant", href: "/doctor/ai-assistant", icon: Bot },
  { label: "Health Insights", href: "/doctor/insights", icon: Brain },
];

const settingsNavItems = [
  { label: "Profile", href: "/doctor/settings", icon: User },
  {
    label: "Privacy",
    href: "/doctor/settings?tab=privacy",
    icon: ShieldCheck,
  },
];

export function DoctorSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/doctor") return pathname === "/doctor";
    return pathname.startsWith(href.split("?")[0]);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex flex-col items-center gap-3">
          <Avatar
            className={`transition-all duration-200 ${
              isCollapsed ? "h-8 w-8" : "h-16 w-16"
            } ring-2 ring-primary/20`}
          >
            <AvatarImage src="/doctor-avatar.jpg" alt="Dr. Smith" />{" "}
            {/* Update alt */}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              <Stethoscope className="h-6 w-6" /> {/* Doctor icon */}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-sidebar-foreground">
                Dr. John Smith
              </span>
              <span className="text-xs text-muted-foreground">
                Cardiologist • MD
              </span>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Online
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
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
                      isActive(item.href) ? "bg-primary/5 text-primary font-bold" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3 w-full px-3">
                      <div className={cn(
                        "relative flex items-center justify-center h-5 w-5 transition-transform duration-300",
                        isActive(item.href) ? "scale-110" : "group-hover:scale-110"
                      )}>
                        <item.icon className="h-4 w-4" />
                        {isActive(item.href) && (
                          <m.div 
                            layoutId="activeIndicator"
                            className="absolute -left-3 w-1 h-5 bg-primary rounded-r-full"
                          />
                        )}
                      </div>
                      <span className="text-sm tracking-tight">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge && (
                    <SidebarMenuBadge className="bg-primary/10 text-primary border-none text-[10px] font-black right-2">
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
          <SidebarGroupLabel>AI Assistant</SidebarGroupLabel>
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

        {/* AI Assistant Widget */}
        <div className={cn("px-4 pb-4 mt-2", isCollapsed && "flex justify-center px-2")}>
          <div
            className={cn(
              "rounded-2xl transition-all duration-500 relative overflow-hidden group",
              !isCollapsed ? 
                "bg-slate-900 border border-slate-800 shadow-2xl p-4" : 
                "p-1"
            )}
          >
            {!isCollapsed && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-500/10 opacity-50" />
            )}
            
            <div className="flex items-center justify-center overflow-hidden rounded-2xl bg-white/5 border border-white/10">
              <div className="translate-y-8">
                <ThreeAvatar size={isCollapsed ? 32 : 160} />
              </div>
            </div>

            {!isCollapsed && (
              <div className="relative z-10">
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="text-sm font-bold text-white tracking-tight">AI HEALTH ENGINE</h4>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Neural Core Active</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">
                          System Status
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-500">95%</span>
                    </div>
                    <Progress
                      value={95}
                      className="h-1 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-400"
                    />
                  </div>

                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-white border-0 h-9 rounded-xl text-xs font-bold shadow-lg shadow-primary/20"
                  >
                    <Link href="/doctor/ai-assistant">
                      <MessageCircle className="mr-2 h-3.5 w-3.5" />
                      ASK AI ADVISOR
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <SidebarSeparator />

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/50">Settings & Security</SidebarGroupLabel>
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
                      isActive(item.href) ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
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
              tooltip="Logout"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
