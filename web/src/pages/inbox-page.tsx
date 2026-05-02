import { useState, useEffect, useRef } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  ArrowLeft01Icon,
  Building03Icon,
  Refresh01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getToken } from "@/lib/auth"

interface Conversation {
  user_id: number
  full_name: string | null
  email: string
  last_message: string
  last_message_time: string
  unread_count: number
}

interface Message {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  is_read: number
  created_at: string
  is_invitation?: boolean
  invitation_id?: number
  invitation_status?: string
  company_name?: string
}

interface Company {
  id: number
  name: string
  founder_count: number
}

interface Invitation {
  id: number
  company_id: number
  company_name: string
  inviter_id: number
  inviter_name: string
  status: string
}

interface UserProfile {
  id: number
  email: string
  full_name: string | null
  bio: string | null
  location: string | null
  website: string | null
  role: string | null
  company: string | null
  skills: string[]
  achievements: string[]
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "now"
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function ConversationItem({
  conversation,
  onClick,
  isSelected,
}: {
  conversation: Conversation
  onClick: () => void
  isSelected: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={`relative flex cursor-pointer items-start gap-3 border-b border-border/50 px-4 py-3 transition-colors hover:bg-muted/50 ${
        isSelected ? "bg-muted" : ""
      }`}
    >
      <Avatar className="size-12">
        <AvatarImage src="" />
        <AvatarFallback className="bg-primary/10 text-primary">
          {conversation.full_name
            ? conversation.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : conversation.email.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-semibold text-foreground">
              {conversation.full_name || conversation.email}
            </span>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatTime(conversation.last_message_time)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p
            className={`mt-0.5 line-clamp-1 text-sm ${
              conversation.unread_count > 0
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {conversation.last_message}
          </p>
          {conversation.unread_count > 0 && (
            <span className="ml-2 shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function InviteModal({
  isOpen,
  onClose,
  companies,
  onInvite,
  loading,
}: {
  isOpen: boolean
  onClose: () => void
  companies: Company[]
  onInvite: (companyId: number) => void
  loading: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">Invite to Company</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Select a company to invite as cofounder:
        </p>
        
        {companies.length === 0 ? (
          <p className="text-center text-muted-foreground">
            You don't have any companies with cofounder vacancies (max 5 founders).
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => onInvite(company.id)}
                disabled={loading}
                className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted"
              >
                <div className="font-medium">{company.name}</div>
                <div className="text-xs text-muted-foreground">
                  {company.founder_count} / 5 founders
                </div>
              </button>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProfileDialog({
  isOpen,
  onClose,
  user,
  loading,
}: {
  isOpen: boolean
  onClose: () => void
  user: UserProfile | null
  loading: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-lg">
        {loading || !user ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Profile</h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-muted transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Avatar and Name */}
            <div className="text-center mb-6">
              <Avatar className="size-20 mx-auto mb-4">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {user.full_name
                    ? user.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : user.email.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-foreground">
                {user.full_name || user.email}
              </h2>
              {user.role && (
                <p className="text-sm text-primary font-medium mt-1">{user.role}</p>
              )}
            </div>

            {/* Info */}
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{user.email}</span>
              </div>

              {/* Location */}
              {user.location && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">{user.location}</span>
                </div>
              )}

              {/* Website */}
              {user.website && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {user.website}
                  </a>
                </div>
              )}

              {/* Bio */}
              {user.bio && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">About</p>
                  <p className="text-sm">{user.bio}</p>
                </div>
              )}

              {/* Skills */}
              {user.skills && user.skills.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {user.achievements && user.achievements.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Achievements</p>
                  <ul className="space-y-1">
                    {user.achievements.map((achievement, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span className="text-primary">•</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ChatView({
  userId,
  userName,
  onBack,
}: {
  userId: number
  userName: string
  onBack: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [invitableCompanies, setInvitableCompanies] = useState<Company[]>([])
  const [sendingInvite, setSendingInvite] = useState(false)
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([])
  const [showProfile, setShowProfile] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInvitableCompanies = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/companies/invitable`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setInvitableCompanies(data)
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    }
  }

  const fetchPendingInvitations = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/company-invitations/pending`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setPendingInvitations(data)
      }
    } catch (error) {
      console.error("Error fetching invitations:", error)
    }
  }

  const fetchUserProfile = async () => {
    setProfileLoading(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleOpenProfile = () => {
    fetchUserProfile()
    setShowProfile(true)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            receiver_id: userId,
            content: newMessage.trim(),
          }),
        }
      )

      if (response.ok) {
        setNewMessage("")
        fetchMessages()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const sendInvitation = async (companyId: number) => {
    setSendingInvite(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/company-invitations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            company_id: companyId,
            invitee_id: userId,
          }),
        }
      )

      if (response.ok) {
        // Send a message about the invitation
        await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            receiver_id: userId,
            content: `I'd like to invite you to join as a cofounder!`,
          }),
        })
        
        setShowInviteModal(false)
        fetchMessages()
      }
    } catch (error) {
      console.error("Error sending invitation:", error)
    } finally {
      setSendingInvite(false)
    }
  }

  const acceptInvitation = async (invitationId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/company-invitations/${invitationId}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )

      if (response.ok) {
        fetchPendingInvitations()
        fetchMessages()
      }
    } catch (error) {
      console.error("Error accepting invitation:", error)
    }
  }

  const ignoreInvitation = async (invitationId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/company-invitations/${invitationId}/ignore`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )

      if (response.ok) {
        fetchPendingInvitations()
      }
    } catch (error) {
      console.error("Error ignoring invitation:", error)
    }
  }

  const isInvitationMessage = (content: string) => {
    return content.includes("I'd like to invite you to join as a cofounder!")
  }

  useEffect(() => {
    fetchMessages()
    fetchInvitableCompanies()
    fetchPendingInvitations()
    const interval = setInterval(() => {
      fetchMessages()
      fetchPendingInvitations()
    }, 5000)
    return () => clearInterval(interval)
  }, [userId])

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="icon" className="size-9" onClick={onBack}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
        </Button>
        <button 
          onClick={handleOpenProfile}
          className="flex items-center gap-3 flex-1 text-left hover:bg-muted/50 rounded-lg p-1 -ml-1 transition-colors"
        >
          <Avatar className="size-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-foreground">{userName}</h2>
            <p className="text-xs text-muted-foreground">Matched</p>
          </div>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isMe = message.sender_id !== userId
              const showDate =
                index === 0 ||
                new Date(message.created_at).toDateString() !==
                  new Date(messages[index - 1].created_at).toDateString()
              
              const isInviteMessage = isInvitationMessage(message.content)
              const relatedInvitation = pendingInvitations.find(
                inv => inv.inviter_id === message.sender_id && inv.status === "pending"
              )

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="my-4 flex justify-center">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {isInviteMessage && relatedInvitation && !isMe ? (
                    // Invitation message with Accept/Ignore buttons
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl bg-muted p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <HugeiconsIcon icon={Building03Icon} size={20} className="text-primary" />
                          <span className="font-semibold">Company Invitation</span>
                        </div>
                        <p className="mb-3">{message.content}</p>
                        <div className="rounded-lg bg-background p-3 mb-3">
                          <p className="font-medium">{relatedInvitation.company_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Invited by {relatedInvitation.inviter_name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptInvitation(relatedInvitation.id)}
                            className="flex-1"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => ignoreInvitation(relatedInvitation.id)}
                            className="flex-1"
                          >
                            Ignore
                          </Button>
                        </div>
                        <span className="mt-2 block text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Regular message
                    <div
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p>{message.content}</p>
                        <span
                          className={`mt-1 block text-xs ${
                            isMe
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {isMe && message.is_read === 1 && (
                            <span className="ml-1">✓✓</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Section: Invite Button + Message Input */}
      <div className="border-t bg-background">
        {/* Invite to Company Button - Prominent but elegant */}
        <div className="px-4 pt-3 pb-2">
          <button
            onClick={() => setShowInviteModal(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 px-4 py-3 transition-colors"
          >
            <HugeiconsIcon icon={Building03Icon} size={18} className="text-primary" />
            <span className="text-sm font-medium text-primary">Invite to Company</span>
          </button>
        </div>

        {/* Message Input */}
        <div className="px-4 pb-20 pt-2">
          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-input bg-background px-4 py-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full size-10 shrink-0"
              onClick={() => {
                fetchMessages()
                fetchPendingInvitations()
              }}
              title="Refresh"
            >
              <HugeiconsIcon icon={Refresh01Icon} size={18} />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="rounded-full size-10 shrink-0"
              disabled={!newMessage.trim()}
              title="Send"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </Button>
          </form>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        companies={invitableCompanies}
        onInvite={sendInvitation}
        loading={sendingInvite}
      />

      {/* Profile Dialog */}
      <ProfileDialog
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={userProfile}
        loading={profileLoading}
      />
    </div>
  )
}

export function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<{
    id: number
    name: string
  } | null>(null)

  const fetchConversations = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/conversations`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [])

  if (selectedUser) {
    return (
      <ChatView
        userId={selectedUser.id}
        userName={selectedUser.name}
        onBack={() => {
          setSelectedUser(null)
          fetchConversations()
        }}
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center border-b px-4 py-3">
        <h1 className="text-xl font-bold">Messages</h1>
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

      {/* Conversation List */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <p className="text-muted-foreground">
              No conversations yet. Start swiping to find matches!
            </p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.user_id}
              conversation={conversation}
              isSelected={false}
              onClick={() =>
                setSelectedUser({
                  id: conversation.user_id,
                  name: conversation.full_name || conversation.email,
                })
              }
            />
          ))
        )}
      </div>
    </div>
  )
}
