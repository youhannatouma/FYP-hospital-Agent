"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  BookOpen,
  MessageSquare,
  ShieldAlert,
  Pipette,
  Activity,
  BarChart3,
  Stethoscope
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserButton, useUser, SignOutButton } from "@clerk/nextjs"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useUser()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background dark text-foreground font-sans">
        {/* Simple Sidebar for Admin */}
        <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col p-6 gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground font-heading tracking-tighter uppercase italic">Admin</span>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            <Button variant="ghost" className="w-full justify-start gap-3 bg-secondary text-foreground" asChild>
              <Link href="/admin">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" asChild>
              <Link href="/admin/users">
                <Users className="h-4 w-4" />
                User Management
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" asChild>
              <Link href="/admin/configuration">
                <Settings className="h-4 w-4" />
                Configuration
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" asChild>
              <Link href="/admin/knowledge">
                <BookOpen className="h-4 w-4" />
                Knowledge Base
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" asChild>
              <Link href="/admin/support">
                <MessageSquare className="h-4 w-4" />
                Support & Comms
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" asChild>
              <Link href="/admin/compliance">
                <ShieldAlert className="h-4 w-4" />
                Compliance
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" asChild>
              <Link href="/admin/pharmacy">
                <Pipette className="h-4 w-4" />
                Pharmacy Hub
              </Link>
            </Button>
            <div className="pt-4 mt-4 border-t border-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase px-2 mb-2 tracking-widest">Analytics</p>
              <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" asChild>
                <Link href="/admin">
                  <Activity className="h-4 w-4" />
                  User Trends
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" asChild>
                <Link href="/admin">
                  <BarChart3 className="h-4 w-4" />
                  Revenue
                </Link>
              </Button>
            </div>
          </nav>

          <SignOutButton>
            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </SignOutButton>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md w-full hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  placeholder="Search system logs or users..." 
                  className="w-full h-9 rounded-full bg-muted/50 border-0 pl-10 pr-4 text-sm focus:ring-2 ring-primary/20 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-background" />
              </Button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-border/50">
                <div className="hidden flex-col items-end md:flex">
                  <span className="text-xs font-bold text-foreground">
                    {user?.fullName || "Administrator"}
                  </span>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest">
                    Root Admin
                  </span>
                </div>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-9 w-9 border-2 border-primary/20",
                      userButtonPopoverCard: "bg-background border border-border shadow-2xl rounded-2xl",
                    }
                  }}
                />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
