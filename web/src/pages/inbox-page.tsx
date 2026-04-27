import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  MoreVerticalCircle01Icon,
  Bookmark01Icon,
  NotificationCircleIcon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  name: string
  avatar: string
  preview: string
  timestamp: string
  unread: boolean
  pinned?: boolean
}

const messages: Message[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "",
    preview: "Hey! Are you still interested in the co-founder position?",
    timestamp: "2m",
    unread: true,
    pinned: true,
  },
  {
    id: "2",
    name: "TechFounders Group",
    avatar: "",
    preview: "Alex: We should schedule a meeting to discuss the MVP",
    timestamp: "15m",
    unread: true,
  },
  {
    id: "3",
    name: "Michael Park",
    avatar: "",
    preview: "Thanks for connecting! I'd love to learn more about your startup",
    timestamp: "1h",
    unread: false,
  },
  {
    id: "4",
    name: "Lisa Rodriguez",
    avatar: "",
    preview: "Can we reschedule our call for tomorrow?",
    timestamp: "3h",
    unread: false,
  },
  {
    id: "5",
    name: "Startup Match",
    avatar: "",
    preview: "You've matched with 3 new co-founders today!",
    timestamp: "5h",
    unread: false,
  },
  {
    id: "6",
    name: "David Kim",
    avatar: "",
    preview: "Great talking to you yesterday. Here's my portfolio...",
    timestamp: "1d",
    unread: false,
  },
  {
    id: "7",
    name: "Emma Wilson",
    avatar: "",
    preview: "I'm interested in joining your team as a developer",
    timestamp: "2d",
    unread: false,
  },
]

function MessageItem({ message }: { message: Message }) {
  return (
    <div className="relative flex cursor-pointer items-start gap-3 border-b border-border/50 px-4 py-3 transition-colors hover:bg-muted/50">
      <Avatar className="size-12">
        <AvatarImage src={message.avatar} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {message.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {message.pinned && (
              <HugeiconsIcon
                icon={Bookmark01Icon}
                size={12}
                className="text-primary"
              />
            )}
            <span className="truncate font-semibold text-foreground">
              {message.name}
            </span>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {message.timestamp}
          </span>
        </div>

        <p
          className={`mt-0.5 line-clamp-1 text-sm ${
            message.unread ? "font-medium text-foreground" : "text-muted-foreground"
          }`}
        >
          {message.preview}
        </p>
      </div>

      {message.unread && (
        <div className="absolute right-4 top-1/2 mt-3 size-2 rounded-full bg-primary" />
      )}
    </div>
  )
}

export function InboxPage() {
  const unreadCount = messages.filter((m) => m.unread).length

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-xl font-bold">Messages</h1>
          <p className="text-xs text-muted-foreground">
            {unreadCount} unread
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-9">
            <HugeiconsIcon icon={NotificationCircleIcon} size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="size-9">
            <HugeiconsIcon icon={MoreVerticalCircle01Icon} size={20} />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b px-4 py-3">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-auto">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>
    </div>
  )
}
