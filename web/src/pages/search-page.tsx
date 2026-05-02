import { useState, useRef, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FavouriteIcon,
  Cancel01Icon,
  Briefcase01Icon,
  UserCircleIcon,
  CheckmarkBadge02Icon,
  Location01Icon,
  ArrowDown01Icon,
  CircleArrowReload01Icon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { searchApi, swipeApi, type User, type Company } from "@/lib/api/client"

type SearchMode = "cofounder" | "jobseeker"

interface SwipeCard {
  id: string
  name: string
  subtitle: string
  image?: string
  location: string
  description: string
  tags: string[]
  verified?: boolean
  stats?: {
    label: string
    value: string
  }[]
}

const options: { value: SearchMode; label: string }[] = [
  { value: "cofounder", label: "Cofounder" },
  { value: "jobseeker", label: "Job Seeker" },
]

function getTypeIcon(mode: SearchMode) {
  switch (mode) {
    case "jobseeker":
      return Briefcase01Icon
    case "cofounder":
      return UserCircleIcon
  }
}

function getTypeLabel(mode: SearchMode) {
  switch (mode) {
    case "jobseeker":
      return "Companies"
    case "cofounder":
      return "Cofounders"
  }
}

// Transform User to SwipeCard
function transformUserToCard(user: User): SwipeCard {
  return {
    id: user.id.toString(),
    name: user.full_name || user.email,
    subtitle: user.role || "Cofounder",
    location: user.location || "Remote",
    description: user.bio || "Looking for a cofounder to build something great!",
    tags: user.skills?.slice(0, 4) || ["Startup", "Tech"],
    verified: false,
    stats: [
      { label: "Skills", value: user.skills?.length?.toString() || "0" },
      { label: "Experience", value: user.role ? "Yes" : "New" },
      { label: "Status", value: "Open" },
    ],
  }
}

// Transform Company to SwipeCard
function transformCompanyToCard(company: Company): SwipeCard {
  return {
    id: company.id.toString(),
    name: company.name,
    subtitle: company.stage || company.industry || "Startup",
    location: company.location || "Remote",
    description: company.description || company.tagline || "Exciting startup opportunity!",
    tags: [company.industry, company.stage].filter(Boolean) as string[],
    verified: false,
    stats: [
      { label: "Team", value: company.size || "Unknown" },
      { label: "Stage", value: company.stage || "Early" },
      { label: "Funding", value: company.funding_amount || "Bootstrapped" },
    ],
  }
}

interface CardComponentProps {
  card: SwipeCard
  style?: React.CSSProperties
  onSwipe?: (direction: "left" | "right") => void
}

function CardComponent({ card, style, onSwipe }: CardComponentProps) {
  const [startX, setStartX] = useState<number | null>(null)
  const [offsetX, setOffsetX] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    setStartX(clientX)
  }

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (startX === null) return
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const diff = clientX - startX
    setOffsetX(diff)
  }

  const handleTouchEnd = () => {
    if (startX === null) return
    
    if (offsetX > 100) {
      onSwipe?.("right")
    } else if (offsetX < -100) {
      onSwipe?.("left")
    }
    
    setStartX(null)
    setOffsetX(0)
  }

  const rotate = offsetX * 0.05
  const opacity = Math.min(Math.abs(offsetX) / 100, 1)

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
      style={{
        ...style,
        transform: `translateX(${offsetX}px) rotate(${rotate}deg)`,
        transition: startX === null ? "transform 0.3s ease-out" : "none",
      }}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Like Indicator */}
      {offsetX > 50 && (
        <div
          className="absolute left-8 top-8 z-10 rounded-lg border-2 border-green-500 px-3 py-1 text-2xl font-bold text-green-500"
          style={{ opacity, transform: `rotate(-15deg)` }}
        >
          LIKE
        </div>
      )}
      
      {/* Nope Indicator */}
      {offsetX < -50 && (
        <div
          className="absolute right-8 top-8 z-10 rounded-lg border-2 border-red-500 px-3 py-1 text-2xl font-bold text-red-500"
          style={{ opacity, transform: `rotate(15deg)` }}
        >
          NOPE
        </div>
      )}

      <div className="h-full rounded-2xl bg-card shadow-xl overflow-hidden border">
        {/* Card Image/Header */}
        <div className="relative h-[45%] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="size-24 ring-4 ring-background">
              <AvatarImage src={card.image} />
              <AvatarFallback className="bg-primary text-3xl font-bold text-primary-foreground">
                {card.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {card.verified && (
              <div className="absolute bottom-4 right-4">
                <HugeiconsIcon
                  icon={CheckmarkBadge02Icon}
                  size={24}
                  className="text-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 flex flex-col h-[55%]">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate">{card.name}</h2>
              <p className="text-xs text-muted-foreground truncate">{card.subtitle}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2 shrink-0">
              <HugeiconsIcon icon={Location01Icon} size={12} />
              <span className="truncate max-w-[80px]">{card.location}</span>
            </div>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-foreground line-clamp-2">
            {card.description}
          </p>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1.5 overflow-hidden">
            {card.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          {card.stats && (
            <div className="mt-auto flex justify-around border-t pt-2">
              {card.stats.map((stat) => (
                <div key={stat.label} className="text-center px-1">
                  <p className="text-sm font-bold">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SearchPage() {
  const [searchMode, setSearchMode] = useState<SearchMode>("cofounder")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const [cards, setCards] = useState<SwipeCard[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [skip, setSkip] = useState(0)
  const PAGE_SIZE = 10

  // Fetch data when mode changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      setCurrentIndex(0)
      setSkip(0)
      setHasMore(true)
      
      try {
        if (searchMode === "cofounder") {
          const users = await searchApi.getCofounders(0, PAGE_SIZE)
          setCards(users.map(transformUserToCard))
          setHasMore(users.length === PAGE_SIZE)
        } else {
          const companies = await searchApi.getCompanies(0, PAGE_SIZE)
          setCards(companies.map(transformCompanyToCard))
          setHasMore(companies.length === PAGE_SIZE)
        }
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError("Failed to load data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchMode])

  const loadMoreCards = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    const newSkip = skip + PAGE_SIZE
    
    try {
      if (searchMode === "cofounder") {
        const users = await searchApi.getCofounders(newSkip, PAGE_SIZE)
        if (users.length === 0) {
          setHasMore(false)
        } else {
          setCards(prev => [...prev, ...users.map(transformUserToCard)])
          setSkip(newSkip)
          setHasMore(users.length === PAGE_SIZE)
        }
      } else {
        const companies = await searchApi.getCompanies(newSkip, PAGE_SIZE)
        if (companies.length === 0) {
          setHasMore(false)
        } else {
          setCards(prev => [...prev, ...companies.map(transformCompanyToCard)])
          setSkip(newSkip)
          setHasMore(companies.length === PAGE_SIZE)
        }
      }
    } catch (err) {
      console.error("Failed to load more data:", err)
    } finally {
      setLoadingMore(false)
    }
  }

  const currentCard = cards[currentIndex]

  const handleSwipe = async (swipeDirection: "left" | "right") => {
    const currentCard = cards[currentIndex]
    if (!currentCard) return

    // Record the swipe to the backend
    try {
      await swipeApi.createSwipe({
        swiped_id: parseInt(currentCard.id),
        swipe_type: swipeDirection === "right" ? "like" : "dislike",
        target_type: searchMode === "cofounder" ? "user" : "company",
      })
    } catch (err) {
      console.error("Failed to record swipe:", err)
      // Continue anyway - don't block the UI
    }

    setDirection(swipeDirection)
    setTimeout(async () => {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setDirection(null)
      
      // If approaching end of current cards and there might be more, fetch more
      if (nextIndex >= cards.length - 2 && hasMore && !loadingMore) {
        await loadMoreCards()
      }
    }, 300)
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchMode(e.target.value as SearchMode)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden pb-24">
      {/* Header with Search Mode Selector */}
      <div className="sticky top-0 z-50 border-b bg-background px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Mode:</span>
            <div className="relative">
              <select
                value={searchMode}
                onChange={handleSelectChange}
                className="h-10 w-[140px] appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center relative px-4 py-2">
        <div className="relative w-full max-w-[320px] h-[440px]">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
              <h3 className="text-lg font-semibold">Loading...</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Finding the best {getTypeLabel(searchMode).toLowerCase()} for you
              </p>
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-red-100 p-4">
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={48}
                  className="text-red-500"
                />
              </div>
              <h3 className="text-lg font-semibold">Error</h3>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          ) : cards.length > 0 ? (
            <>
              {/* Loading indicator for more cards */}
              {loadingMore && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-background/50 rounded-2xl">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              )}
              
              {/* Next Card (Background) */}
              {currentIndex < cards.length - 1 && (
                <div className="absolute inset-0 scale-95 opacity-50">
                  <CardComponent
                    card={cards[currentIndex + 1]}
                  />
                </div>
              )}

              {/* Current Card */}
              {currentCard && currentIndex < cards.length && (
                <CardComponent
                  card={currentCard}
                  onSwipe={handleSwipe}
                />
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center px-6">
              <div className="mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-6">
                <HugeiconsIcon
                  icon={getTypeIcon(searchMode)}
                  size={48}
                  className="text-primary"
                />
              </div>
              <h3 className="text-xl font-bold text-foreground">That's all for today!</h3>
              <p className="mt-3 text-sm text-muted-foreground max-w-[250px]">
                You've seen all available {getTypeLabel(searchMode).toLowerCase()} right now.
              </p>
              <p className="mt-2 text-xs text-muted-foreground/70">
                We'll refresh when new ones arrive
              </p>
              <Button
                variant="outline"
                className="mt-6 gap-2"
                onClick={() => {
                  setCurrentIndex(0)
                  setSkip(0)
                  const fetchData = async () => {
                    setLoading(true)
                    try {
                      if (searchMode === "cofounder") {
                        const users = await searchApi.getCofounders(0, PAGE_SIZE)
                        setCards(users.map(transformUserToCard))
                        setHasMore(users.length === PAGE_SIZE)
                      } else {
                        const companies = await searchApi.getCompanies(0, PAGE_SIZE)
                        setCards(companies.map(transformCompanyToCard))
                        setHasMore(companies.length === PAGE_SIZE)
                      }
                    } catch (err) {
                      console.error("Failed to refresh:", err)
                    } finally {
                      setLoading(false)
                    }
                  }
                  fetchData()
                }}
              >
                <HugeiconsIcon icon={CircleArrowReload01Icon} size={16} />
                Check for new {getTypeLabel(searchMode).toLowerCase()}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-8 pb-6 pt-2">
        <Button
          variant="outline"
          size="icon"
          className="size-14 rounded-full border-2 border-red-500 hover:bg-red-50 hover:text-red-500"
          onClick={() => handleSwipe("left")}
          disabled={loading || loadingMore || currentIndex >= cards.length}
        >
          <HugeiconsIcon icon={Cancel01Icon} size={28} />
        </Button>

        <Button
          size="icon"
          className="size-14 rounded-full bg-green-500 hover:bg-green-600"
          onClick={() => handleSwipe("right")}
          disabled={loading || loadingMore || currentIndex >= cards.length}
        >
          <HugeiconsIcon icon={FavouriteIcon} size={28} />
        </Button>
      </div>
    </div>
  )
}
