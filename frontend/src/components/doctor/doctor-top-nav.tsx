"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Activity,
  Bell,
  Globe,
  Moon,
  Sun,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function DoctorTopNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const isActiveTab = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              aria-label="Language"
            >
              <Globe className="h-4.5 w-4.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 glass shadow-premium">
            <DropdownMenuItem className="text-xs font-semibold">English</DropdownMenuItem>
            <DropdownMenuItem className="text-xs font-semibold">Arabic</DropdownMenuItem>
            <DropdownMenuItem className="text-xs font-semibold">French</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4.5 w-4.5" />
          ) : (
            <Moon className="h-4.5 w-4.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive border-2 border-background shadow-glow" />
        </Button>

        <div className="h-6 w-px bg-border/50 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="group gap-3 pl-1 pr-3 h-10 rounded-xl hover:bg-muted/50 transition-all"
            >
              <Avatar className="h-8 w-8 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <AvatarImage src="/placeholder-user.jpg" alt="Sarah Johnson" />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                  SJ
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start md:flex text-left">
                <span className="text-xs font-bold text-foreground leading-none">
                  Sarah Johnson
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                  General Practice
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass shadow-premium animate-scale-in">
             <div className="px-2 py-1.5 mb-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">Role: Senior Physician</p>
            </div>
            <DropdownMenuItem asChild className="text-xs font-bold rounded-lg m-1">
              <Link href="/doctor/settings">Profile Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem className="text-xs font-bold text-destructive rounded-lg m-1">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
