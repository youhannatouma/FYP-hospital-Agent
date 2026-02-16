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
import { useToast } from "@/hooks/use-toast";
import { AvatarAssistant } from "@/components/patient/avatar-assistant"; // Update path if needed

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
  const { toast } = useToast();
  const isCollapsed = state === "collapsed";

  const isActive = (href: string) => {
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
        <div className={cn("px-3 pb-2", isCollapsed && "flex justify-center")}>
          <div
            className={cn(
              "rounded-xl transition-all duration-300",
              !isCollapsed &&
                "bg-gradient-to-b from-blue-600 to-indigo-700 p-3 text-white",
            )}
          >
            <AvatarAssistant
              position="sidebar"
              className={isCollapsed ? "w-8 h-8" : "w-full"}
            />

            {!isCollapsed && (
              <div className="mt-4 space-y-4">
                <div className="rounded-lg bg-white/10 p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Heart className="h-3 w-3 text-rose-300" />
                    <span className="text-[10px] font-medium text-white">
                      AI Assistant
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress
                      value={95}
                      className="h-1.5 flex-1 bg-white/20 [&>div]:bg-emerald-400"
                    />
                    <span className="text-[10px] font-medium text-white">
                      Active
                    </span>
                  </div>
                </div>

                <Button
                  asChild
                  size="sm"
                  className="w-full bg-blue-500 text-white hover:bg-blue-600 border-0 h-7 text-xs"
                >
                  <Link href="/doctor/ai-assistant">
                    {" "}
                    {/* Fixed route */}
                    <MessageCircle className="mr-1.5 h-3 w-3" />
                    Ask AI Assistant
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
            <SidebarMenuButton
              tooltip="Logout"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                toast({
                  title: "Logging Out",
                  description: "Ending your clinical session and securing patient data...",
                })
              }}
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
