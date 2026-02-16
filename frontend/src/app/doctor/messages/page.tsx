"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  Reply,
  Star,
  Paperclip,
  ChevronRight,
  Clock,
  User,
  Users,
  Mail,
  AlertCircle,
  FlaskConical,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DoctorNewMessageDialog } from "@/components/doctor/dialogs/new-message-dialog"

import { useUser } from "@clerk/nextjs"
import { useDataStore, Message } from "@/hooks/use-data-store"
import { formatDistanceToNow } from "date-fns"

function MessageDetail({ message, onRead }: { message: Message; onRead: (id: string) => void }) {
  const { toast } = useToast()
  const { toggleMessageStar } = useDataStore()

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 gap-4">
        <div className="flex-1">
          <DialogTitle className="text-xl font-bold text-foreground mb-1">{message.subject}</DialogTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
              {message.senderRole.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</span>
          </div>
        </div>
      </DialogHeader>
      <div className="flex flex-col gap-6 pt-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-background shadow-md">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
              {message.senderName.split(' ').map(n=>n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
               <p className="text-sm font-bold text-foreground">{message.senderName}</p>
               <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{message.category || "General"}</span>
            </div>
            <p className="text-xs text-muted-foreground">Reference: {message.id}</p>
          </div>
        </div>

        <div className="whitespace-pre-line text-sm text-foreground leading-relaxed rounded-2xl bg-muted/30 p-6 border italic border-muted">
          "{message.content}"
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11"
            onClick={() => {
              toast({
                title: "Reply",
                description: `Replying to ${message.senderName}...`,
              })
            }}
          >
            <Reply className="h-4 w-4" />
            Send Clinical Reply
          </Button>
          <Button
            variant="outline"
            className="border-border text-foreground gap-2 h-11"
            onClick={() => {
              toggleMessageStar(message.id)
              toast({
                title: message.starred ? "Unstarred" : "Starred",
                description: message.starred ? "Removed from favorites" : "Added to favorites",
              })
            }}
          >
            <Star className={`h-4 w-4 ${message.starred ? 'fill-amber-500 text-amber-500' : ''}`} />
            {message.starred ? 'Starred' : 'Star Message'}
          </Button>
          <Button
            variant="outline"
            className="border-border text-foreground gap-2 h-11 px-3"
            onClick={() => {
               toast({ title: "Archive", description: "Archived" })
            }}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default function DoctorMessagesPage() {
  const { user } = useUser()
  const { messages, getInboxMessages, getUnreadCount, markMessageRead } = useDataStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)

  // In a real app, we'd map Clerk user to our DB user. For now, we use doc-1.
  const doctorId = "doc-1" 
  const inbox = getInboxMessages(doctorId)
  const unreadCount = getUnreadCount(doctorId)

  const filteredMessages = inbox.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCategoryIcon = (category?: string) => {
    switch(category?.toLowerCase()) {
      case 'patient': return <User className="h-3 w-3" />;
      case 'staff': return <Users className="h-3 w-3" />;
      case 'system': return <AlertCircle className="h-3 w-3" />;
      default: return <Mail className="h-3 w-3" />;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clinical Inbox</h1>
          <p className="text-sm text-muted-foreground">
            You have {unreadCount} urgent patient and administrative message{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button 
          className="gap-2 shadow-lg shadow-primary/20" 
          onClick={() => setIsNewMessageOpen(true)}
        >
          <Plus className="h-4 w-4" /> New Message
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by patient name, subject, or lab ID..."
          className="pl-10 h-11 rounded-xl bg-card border-none shadow-sm focus-visible:ring-primary/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-2">
          <TabsTrigger value="all" className="rounded-lg">All Messages</TabsTrigger>
          <TabsTrigger value="unread" className="rounded-lg">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="starred" className="rounded-lg">Starred</TabsTrigger>
        </TabsList>

        {["all", "unread", "starred"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4 flex flex-col gap-3">
            {filteredMessages
              .filter((m) => {
                if (tab === "unread") return !m.read
                if (tab === "starred") return m.starred
                return true
              })
              .map((message) => (
                <Dialog key={message.id}>
                  <DialogTrigger asChild>
                    <Card
                      onClick={() => markMessageRead(message.id)}
                      className={`cursor-pointer border-none bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group overflow-hidden ${
                        !message.read ? "ring-1 ring-primary/20" : ""
                      }`}
                    >
                      <CardContent className="flex items-start gap-4 p-5 relative">
                        {!message.read && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        )}
                        <Avatar className="h-12 w-12 shrink-0 border-2 border-background shadow-sm">
                          <AvatarFallback
                            className="bg-primary/5 text-primary text-xs font-bold"
                          >
                            {message.senderName.split(' ').map(n=>n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`text-sm ${
                                  !message.read
                                    ? "font-bold text-foreground"
                                    : "font-semibold text-foreground"
                                }`}
                              >
                                {message.senderName}
                              </h3>
                              <Badge variant="secondary" className="text-[9px] h-4 py-0 px-1.5 flex items-center gap-1 bg-muted text-muted-foreground border-none">
                                {(message.category || "General").toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              {message.starred && (
                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                              )}
                              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <p
                            className={`text-sm mb-1 ${
                              !message.read
                                ? "font-bold text-foreground"
                                : "text-card-foreground/80"
                            }`}
                          >
                            {message.subject}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 italic">
                            {message.content}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <MessageDetail message={message} onRead={markMessageRead} />
                </Dialog>
              ))}
            {filteredMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center p-20 text-center space-y-3 bg-muted/20 rounded-2xl border border-dashed">
                 <Mail className="h-10 w-10 text-muted-foreground/40" />
                 <h3 className="font-bold text-lg">No clinical messages found</h3>
                 <p className="text-sm text-muted-foreground max-w-xs">Your clinical inbox is clear. New reports or patient queries will appear here.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <DoctorNewMessageDialog 
        open={isNewMessageOpen} 
        onOpenChange={setIsNewMessageOpen} 
      />
    </div>
  )
}
