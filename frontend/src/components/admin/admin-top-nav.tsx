"use client"

import { Bell, Menu, SunIcon, MoonIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

export function AdminTopNav() {
  const { theme, setTheme } = useTheme()
  const { toggleSidebar } = useSidebar()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <header className="h-16 border-b border-sidebar-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

      </div>
      
      <div className="flex items-center gap-4 lg:gap-6">
        <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-muted/50">
          <Bell className="h-5 w-5 text-muted-foreground" />
          

          <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-background" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? (
            <SunIcon className="h-4 w-4" />
          ) : (
            <MoonIcon className="h-4 w-4" />
          )}
        </Button> 
        
        <div className="h-8 w-[1px] bg-sidebar-border mx-2 hidden sm:block" />
        
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonAvatarBox: "h-9 w-9 border-2 border-primary/20 hover:border-primary/40 transition-all",
              userButtonPopoverCard: "bg-background border border-border shadow-xl rounded-2xl",
            }
          }}
        />
      </div>
    </header>
  )
}
