"use client"
/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */

import * as React from "react"
import Link from "next/link"
import { Bell, Calendar, MessageSquare, TestTube, CheckCircle2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

type NotificationType = "appointment" | "message" | "lab" | "system"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  unread: boolean
  type: NotificationType
}

import { useNotifications } from "@/hooks/use-notifications"

const getIcon = (type: NotificationType) => {
  switch (type) {
    case "appointment":
      return <Calendar className="h-4 w-4 text-primary" />
    case "message":
      return <MessageSquare className="h-4 w-4 text-blue-500" />
    case "lab":
      return <TestTube className="h-4 w-4 text-orange-500" />
    case "system":
    default:
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
  }
}

export function NotificationsDropdown() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px] p-0 shadow-lg">
        <div className="flex items-center justify-between p-4 pb-2">
          <DropdownMenuLabel className="p-0 text-base font-bold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              className="h-8 px-2 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          <DropdownMenuGroup className="p-1">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-accent/50",
                    !notification.is_read && "bg-primary/5 focus:bg-primary/10"
                  )}
                  asChild
                >
                  <Link href="/patient/messages">
                    <div className="flex w-full items-start gap-3">
                      <div className={cn(
                        "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                        !notification.is_read ? "bg-primary/10" : "bg-muted"
                      )}>
                        {getIcon(notification.type as NotificationType)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "text-sm font-semibold leading-none",
                            !notification.is_read ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                            {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground/60">We'll let you know when something happens.</p>
              </div>
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="ghost" className="w-full justify-between text-xs font-medium" asChild>
            <Link href="/patient/messages">
              View all notifications
              <ChevronRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
