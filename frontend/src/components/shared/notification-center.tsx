"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useCallback } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/hooks/use-notifications"

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useNotifications()


  return (
    <DropdownMenu onOpenChange={(open) => open && refetch()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
        <div className="p-4 bg-primary/5 flex items-center justify-between border-b border-primary/10">
          <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Alert Center</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-6 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 p-0">
              Clear All
            </Button>
          )}
        </div>
        
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-10 text-center text-[10px] font-medium text-muted-foreground italic">
              No new notifications.
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem 
                key={n.id} 
                onClick={() => markAsRead(n.id)}
                className="p-4 flex flex-col items-start gap-1 focus:bg-primary/5 cursor-pointer border-b border-border/30 last:border-0"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary opacity-60">{n.type}</span>
                  <span className="text-[8px] font-medium text-muted-foreground">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h4 className="text-xs font-bold text-foreground leading-tight">{n.title}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        <div className="p-3 bg-muted/20 text-center">
           <Button variant="ghost" className="w-full h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
             View All History
           </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
