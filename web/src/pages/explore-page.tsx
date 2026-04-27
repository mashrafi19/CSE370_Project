import { useState, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreHorizontalCircle01Icon,
  FavouriteIcon,
  RepeatIcon,
  Image01Icon,
  Image02Icon,
  SentIcon,
  UserGroupIcon,
  HashtagIcon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { postsApi, ApiError } from "@/lib/api/client"
import type { Post } from "@/lib/api/client"

interface DisplayPost {
  id: number
  author: {
    name: string
    avatar: string | null
    handle: string
  }
  timestamp: string
  content: string
  image?: string
  likes: number
  comments: number
  shares: number
  liked: boolean
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function transformPost(post: Post): DisplayPost {
  const fullName = post.author.full_name || post.author.email.split("@")[0]
  const handle = post.author.email.split("@")[0].toLowerCase()

  return {
    id: post.id,
    author: {
      name: fullName,
      avatar: null,
      handle: `@${handle}`,
    },
    timestamp: formatTimestamp(post.created_at),
    content: post.content,
    image: post.image_url || undefined,
    likes: 0,
    comments: 0,
    shares: 0,
    liked: false,
  }
}

function PostCard({ post }: { post: DisplayPost }) {
  return (
    <div className="border-b bg-background">
      {/* Post Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 ring-2 ring-primary/20">
            <AvatarImage src={post.author.avatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {post.author.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">{post.timestamp}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="size-8">
          <HugeiconsIcon icon={MoreHorizontalCircle01Icon} size={20} />
        </Button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed text-foreground">
          {post.content}
        </p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="aspect-video w-full bg-muted">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <HugeiconsIcon icon={Image01Icon} size={48} />
              <span className="text-sm">Post image</span>
            </div>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-6 px-4 py-3">
        <button
          className={`flex items-center gap-1.5 transition-colors ${
            post.liked
              ? "text-red-500"
              : "text-muted-foreground hover:text-red-500"
          }`}
        >
          <HugeiconsIcon
            icon={FavouriteIcon}
            size={20}
            fill={post.liked ? "currentColor" : "none"}
          />
          <span className="text-sm font-medium">{post.likes}</span>
        </button>
        <button className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
          <HugeiconsIcon icon={RepeatIcon} size={20} />
          <span className="text-sm font-medium">{post.shares}</span>
        </button>
      </div>
    </div>
  )
}

function CreatePostDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (content: string) => Promise<void>
  isSubmitting: boolean
}) {
  const { user } = useAuth()
  const [content, setContent] = useState("")

  const handleSubmit = async () => {
    if (content.trim()) {
      await onSubmit(content)
      setContent("")
      onOpenChange(false)
    }
  }

  const userInitials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "??"

  const userName = user?.full_name || user?.email?.split("@")[0] || "Anonymous"
  const userHandle = user?.email
    ? `@${user.email.split("@")[0].toLowerCase()}`
    : "@unknown"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Avatar className="size-10 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm">{userName}</p>
              <p className="text-xs text-muted-foreground">{userHandle}</p>
            </div>
          </div>
          <Textarea
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            className="min-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-primary"
              disabled={isSubmitting}
            >
              <HugeiconsIcon icon={Image02Icon} size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-primary"
              disabled={isSubmitting}
            >
              <HugeiconsIcon icon={SentIcon} size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-primary"
              disabled={isSubmitting}
            >
              <HugeiconsIcon icon={UserGroupIcon} size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-primary"
              disabled={isSubmitting}
            >
              <HugeiconsIcon icon={HashtagIcon} size={18} />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ExplorePage() {
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [posts, setPosts] = useState<DisplayPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadPosts() {
      setIsLoading(true)
      setError(null)
      try {
        const fetchedPosts = await postsApi.getPosts()
        if (!cancelled) {
          setPosts(fetchedPosts.map(transformPost))
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err)
        if (!cancelled) {
          setError("Failed to load posts. Please try again.")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadPosts()

    return () => {
      cancelled = true
    }
  }, [])

  const handleCreatePost = async (content: string) => {
    try {
      setIsSubmitting(true)
      setError(null)
      const newPost = await postsApi.createPost({ content })
      setPosts((prev) => [transformPost(newPost), ...prev])
    } catch (err) {
      console.error("Failed to create post:", err)
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to create post. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const userInitials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "??"

  return (
    <div className="flex h-full flex-col overflow-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-xl font-bold">Explore</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Create Post Input */}
      <div className="border-b bg-background px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 ring-2 ring-primary/20 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex-1 text-left"
          >
            <div className="flex h-10 items-center rounded-full border border-input bg-muted/50 px-4 text-sm text-muted-foreground transition-colors hover:bg-muted">
              What's happening?
            </div>
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-primary"
              onClick={() => setIsDialogOpen(true)}
            >
              <HugeiconsIcon icon={Image02Icon} size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-primary"
              onClick={() => setIsDialogOpen(true)}
            >
              <HugeiconsIcon icon={SentIcon} size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-primary"
              onClick={() => setIsDialogOpen(true)}
            >
              <HugeiconsIcon icon={UserGroupIcon} size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-primary"
              onClick={() => setIsDialogOpen(true)}
            >
              <HugeiconsIcon icon={HashtagIcon} size={18} />
            </Button>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="sm"
            className="rounded-full px-6"
          >
            Post
          </Button>
        </div>
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreatePost}
        isSubmitting={isSubmitting}
      />

      {/* Feed */}
      <div className="flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-primary"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-primary"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-primary"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to share something!
            </p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {/* Loading indicator */}
      {!isLoading && posts.length > 0 && (
        <div className="flex items-center justify-center py-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
