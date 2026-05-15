"use client"

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

export function PatientTopNav() {
  const { theme, setTheme } = useTheme()
  const { signOut } = useClerk()
  const { profile, isLoading, fullName, initials } = useUserProfile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSignOut = () => signOut({ redirectUrl: "/sign-in" })

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-4">
      <SidebarTrigger className="-ml-1" />

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Activity className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground font-heading">
          Care
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme Toggle — only render after mount to avoid hydration mismatch */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <NotificationCenter />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {isLoading ? "…" : initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start md:flex">
                {isLoading ? (
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-2.5 w-16 rounded" />
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-medium text-foreground">{fullName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {profile?.blood_type ? `Blood: ${profile.blood_type}` : "Patient"}
                    </span>
                  </>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-bold leading-none">{fullName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/patient/settings">
                <Settings className="mr-2 h-3.5 w-3.5" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
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
