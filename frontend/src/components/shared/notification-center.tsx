"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Loader2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function NotificationCenter() {
  const { getToken } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    try {
      const token = await getToken()
      const response = await apiClient.get("/notifications/", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(response.data)
      setUnreadCount(response.data.filter((n: any) => !n.is_read).length)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }, [getToken])

  useEffect(() => {
    fetchNotifications()
    // Poll every minute for notifications
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markRead = async (id: string) => {
    try {
      const token = await getToken()
      await apiClient.patch(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchNotifications()
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllRead = async () => {
    try {
      const token = await getToken()
      await apiClient.patch("/notifications/read-all", {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchNotifications()
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
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
            <Button variant="ghost" size="sm" onClick={markAllRead} className="h-6 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 p-0">
              Clear All
            </Button>
          )}
        </div>
        
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-[10px] font-medium text-muted-foreground italic">
              No new notifications.
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem 
                key={n.id} 
                onClick={() => markRead(n.id)}
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
