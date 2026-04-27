import { useState, useRef } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FavouriteIcon,
  Cancel01Icon,
  InformationCircleIcon,
  Briefcase01Icon,
  DollarCircleIcon,
  UserCircleIcon,
  CheckmarkBadge02Icon,
  Location01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

type SearchType = "invest" | "work" | "cofounder"

interface SwipeCard {
  id: string
  type: SearchType
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

const mockCards: SwipeCard[] = [
  {
    id: "1",
    type: "invest",
    name: "TechStart Inc",
    subtitle: "Seed Stage Startup",
    location: "San Francisco, CA",
    description:
      "Revolutionary AI-powered platform for automated customer service. Already have 50+ enterprise clients and $100K MRR.",
    tags: ["AI", "SaaS", "B2B", "Seed"],
    verified: true,
    stats: [
      { label: "MRR", value: "$100K" },
      { label: "Clients", value: "50+" },
      { label: "Team", value: "12" },
    ],
  },
  {
    id: "2",
    type: "cofounder",
    name: "Jessica Chen",
    subtitle: "Technical Co-founder",
    location: "New York, NY",
    description:
      "Former Google engineer with 8 years of experience. Looking for a business-minded co-founder to build the next big thing in fintech.",
    tags: ["Engineering", "Fintech", "Full-stack", "Ex-Google"],
    verified: true,
    stats: [
      { label: "Experience", value: "8 yrs" },
      { label: "Skills", value: "React, Node" },
      { label: "Status", value: "Open" },
    ],
  },
  {
    id: "3",
    type: "work",
    name: "StartupXYZ",
    subtitle: "Series A Company",
    location: "Austin, TX",
    description:
      "Fast-growing health tech startup looking for senior developers. We offer competitive salary, equity, and remote work.",
    tags: ["Health Tech", "Remote", "Full-time", "Series A"],
    verified: false,
    stats: [
      { label: "Employees", value: "45" },
      { label: "Funding", value: "$5M" },
      { label: "Open Roles", value: "8" },
    ],
  },
  {
    id: "4",
    type: "invest",
    name: "GreenEnergy Co",
    subtitle: "Pre-seed Startup",
    location: "Seattle, WA",
    description:
      "Sustainable energy solutions for residential buildings. Prototype ready, looking for angel investors.",
    tags: ["CleanTech", "Hardware", "Pre-seed"],
    verified: true,
    stats: [
      { label: "Prototype", value: "Ready" },
      { label: "Patents", value: "2" },
      { label: "Team", value: "4" },
    ],
  },
  {
    id: "5",
    type: "cofounder",
    name: "Michael Park",
    subtitle: "Business Co-founder",
    location: "Los Angeles, CA",
    description:
      "MBA with experience scaling 3 startups to acquisition. Looking for a technical co-founder for AI/ML venture.",
    tags: ["Business", "AI/ML", "MBA", "Scaling"],
    verified: true,
    stats: [
      { label: "Startups", value: "3" },
      { label: "Exits", value: "2" },
      { label: "Looking", value: "CTO" },
    ],
  },
  {
    id: "6",
    type: "work",
    name: "DataFlow",
    subtitle: "Growth Stage",
    location: "Remote",
    description:
      "Data analytics platform seeking frontend engineers. Work with modern React, TypeScript, and cutting-edge tools.",
    tags: ["Data", "React", "TypeScript", "Remote"],
    verified: true,
    stats: [
      { label: "Users", value: "10K+" },
      { label: "Team", value: "25" },
      { label: "Growth", value: "300%" },
    ],
  },
]

const options: { value: SearchType; label: string }[] = [
  { value: "cofounder", label: "Cofounders" },
  { value: "work", label: "Work" },
  { value: "invest", label: "Invest" },
]

function getTypeIcon(type: SearchType) {
  switch (type) {
    case "invest":
      return DollarCircleIcon
    case "work":
      return Briefcase01Icon
    case "cofounder":
      return UserCircleIcon
  }
}

function getTypeLabel(type: SearchType) {
  switch (type) {
    case "invest":
      return "Invest"
    case "work":
      return "Work"
    case "cofounder":
      return "Cofounders"
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
        <div className="relative h-1/2 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
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
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{card.name}</h2>
              <p className="text-sm text-muted-foreground">{card.subtitle}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <HugeiconsIcon icon={Location01Icon} size={12} />
              <span>{card.location}</span>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-foreground line-clamp-3">
            {card.description}
          </p>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          {card.stats && (
            <div className="mt-4 flex justify-around border-t pt-3">
              {card.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-sm font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
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
  const [searchType, setSearchType] = useState<SearchType>("cofounder")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)

  const filteredCards = mockCards.filter((card) => card.type === searchType)
  const currentCard = filteredCards[currentIndex % filteredCards.length]

  const handleSwipe = (swipeDirection: "left" | "right") => {
    setDirection(swipeDirection)
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
      setDirection(null)
    }, 300)
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchType(e.target.value as SearchType)
    setCurrentIndex(0)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden pb-24">
      {/* Header with Search Type Selector */}
      <div className="sticky top-0 z-50 border-b bg-background px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={searchType}
              onChange={handleSelectChange}
              className="h-10 w-[160px] appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center relative px-4 py-4">
        <div className="relative w-full max-w-[320px] h-[480px]">
          {filteredCards.length > 0 ? (
            <>
              {/* Next Card (Background) */}
              {filteredCards.length > 1 && (
                <div className="absolute inset-0 scale-95 opacity-50">
                  <CardComponent
                    card={filteredCards[(currentIndex + 1) % filteredCards.length]}
                  />
                </div>
              )}

              {/* Current Card */}
              {currentCard && (
                <CardComponent
                  card={currentCard}
                  onSwipe={handleSwipe}
                />
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <HugeiconsIcon
                  icon={getTypeIcon(searchType)}
                  size={48}
                  className="text-muted-foreground"
                />
              </div>
              <h3 className="text-lg font-semibold">No more matches</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back later for new {getTypeLabel(searchType).toLowerCase()} opportunities
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 pb-6 pt-2">
        <Button
          variant="outline"
          size="icon"
          className="size-14 rounded-full border-2 border-red-500 hover:bg-red-50 hover:text-red-500"
          onClick={() => handleSwipe("left")}
        >
          <HugeiconsIcon icon={Cancel01Icon} size={28} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="size-12 rounded-full"
        >
          <HugeiconsIcon icon={InformationCircleIcon} size={24} />
        </Button>

        <Button
          size="icon"
          className="size-14 rounded-full bg-green-500 hover:bg-green-600"
          onClick={() => handleSwipe("right")}
        >
          <HugeiconsIcon icon={FavouriteIcon} size={28} />
        </Button>
      </div>
    </div>
  )
}
