"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import Link from "next/link"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useClerk } from "@clerk/nextjs"
import { useUserProfile } from "@/hooks/use-user-profile"
import { Activity, Moon, Sun, Settings, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationCenter } from "@/components/shared/notification-center"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DoctorTopNav() {
  const { theme, setTheme } = useTheme()
  const { signOut } = useClerk()
  const { profile, isLoading, fullName, initials, displayRole } = useUserProfile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSignOut = () => signOut({ redirectUrl: "/sign-in" })

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 px-6 glass border-b border-border/50">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-glow">
          <Activity className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-black tracking-tighter text-foreground uppercase">
            Care
          </span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Handcrafted Health
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <NotificationCenter />

        <div className="h-6 w-px bg-border/50 mx-1" />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="group gap-3 pl-1 pr-3 h-10 rounded-xl hover:bg-muted/50 transition-all"
            >
              <Avatar className="h-8 w-8 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black rounded-lg">
                  {isLoading ? "…" : initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start md:flex text-left">
                {isLoading ? (
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-2.5 w-16 rounded" />
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-bold text-foreground leading-none">
                      {profile?.role === "doctor" ? `Dr. ${fullName}` : fullName}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      {profile?.specialty || "Physician"}
                    </span>
                  </>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass shadow-premium animate-scale-in">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-bold leading-none">
                  {profile?.role === "doctor" ? `Dr. ${fullName}` : fullName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {profile?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-xs font-bold rounded-lg m-1 cursor-pointer">
              <Link href="/doctor/settings">
                <Settings className="mr-2 h-3.5 w-3.5" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-xs font-bold text-destructive rounded-lg m-1 cursor-pointer focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
