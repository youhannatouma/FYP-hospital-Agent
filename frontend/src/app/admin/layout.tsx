"use client"

import React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ShieldCheck, LayoutDashboard, Users, Settings, LogOut, Bell, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background dark">
        {/* Simple Sidebar for Admin */}
        <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col p-6 gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AdminHub</span>
          </div>

          <nav className="flex-1 space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-3 bg-secondary text-foreground" asChild>
              <Link href="/admin">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" asChild>
              <Link href="/admin/users">
                <Users className="h-4 w-4" />
                Users
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" asChild>
              <Link href="/admin/settings">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </nav>

          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-background" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-xs">
                AD
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
