import { HugeiconsIcon } from "@hugeicons/react"
import {
  Settings01Icon,
  Edit01Icon,
  Share01Icon,
  Location01Icon,
  Link01Icon,
  Briefcase01Icon,
  Globe02Icon,
  Building02Icon,
  DollarCircleIcon,
  UserGroupIcon,
  PlusSignIcon,
  ArrowRight01Icon,
  FavouriteIcon,
  CheckmarkBadge02Icon,
  Linkedin01Icon,
  GithubIcon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface CompanyData {
  name: string
  tagline: string
  logo: string
  location: string
  website: string
  stage: string
  founded: string
  size: string
  industry: string
  description: string
  funding: {
    raised: string
    round: string
  }
  stats: {
    followers: number
    teamSize: number
    openPositions: number
  }
  verified: boolean
}

interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  isFounder?: boolean
}

interface OpenPosition {
  id: string
  title: string
  department: string
  type: string
  location: string
}

const companyData: CompanyData = {
  name: "Fumble",
  tagline: "Dating-app-style platform for startup matchmaking",
  logo: "",
  location: "San Francisco, CA",
  website: "fumble.app",
  stage: "Seed",
  founded: "2024",
  size: "5-10",
  industry: "Technology",
  description:
    "Fumble is revolutionizing how co-founders find each other. Like a dating app, but for building startups. We use AI matching, compatibility scores, and verified profiles to help entrepreneurs find their perfect business partner.",
  funding: {
    raised: "$500K",
    round: "Seed",
  },
  stats: {
    followers: 2456,
    teamSize: 7,
    openPositions: 3,
  },
  verified: true,
}

const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Alex Rivera",
    role: "CEO & Founder",
    avatar: "",
    isFounder: true,
  },
  {
    id: "2",
    name: "Sarah Chen",
    role: "CTO & Co-founder",
    avatar: "",
    isFounder: true,
  },
  {
    id: "3",
    name: "Michael Park",
    role: "Head of Product",
    avatar: "",
  },
  {
    id: "4",
    name: "Lisa Rodriguez",
    role: "Lead Designer",
    avatar: "",
  },
  {
    id: "5",
    name: "David Kim",
    role: "Senior Developer",
    avatar: "",
  },
]

const openPositions: OpenPosition[] = [
  {
    id: "1",
    title: "Full-Stack Developer",
    department: "Engineering",
    type: "Full-time",
    location: "Remote",
  },
  {
    id: "2",
    title: "Growth Marketing Manager",
    department: "Marketing",
    type: "Full-time",
    location: "San Francisco, CA",
  },
  {
    id: "3",
    title: "Community Manager",
    department: "Operations",
    type: "Part-time",
    location: "Remote",
  },
]

function StatCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-12 ring-2 ring-primary/10">
        <AvatarImage src={member.avatar} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {member.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{member.name}</p>
          {member.isFounder && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Founder
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{member.role}</p>
      </div>
    </div>
  )
}

function PositionCard({ position }: { position: OpenPosition }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
      <div>
        <p className="text-sm font-medium">{position.title}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{position.department}</span>
          <span>•</span>
          <span>{position.type}</span>
          <span>•</span>
          <span>{position.location}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="shrink-0 size-8">
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
      </Button>
    </div>
  )
}

export function CompanyPage() {
  return (
    <div className="flex h-full flex-col overflow-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-xl font-bold">Company</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-9">
            <HugeiconsIcon icon={Share01Icon} size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="size-9">
            <HugeiconsIcon icon={Settings01Icon} size={20} />
          </Button>
        </div>
      </div>

      {/* Company Header */}
      <div className="border-b px-4 py-6">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary">
            {companyData.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{companyData.name}</h2>
              {companyData.verified && (
                <HugeiconsIcon
                  icon={CheckmarkBadge02Icon}
                  size={18}
                  className="text-blue-500 shrink-0"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {companyData.tagline}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <HugeiconsIcon icon={Building02Icon} size={12} />
                <span>{companyData.stage}</span>
              </div>
              <div className="flex items-center gap-1">
                <HugeiconsIcon icon={Location01Icon} size={12} />
                <span>{companyData.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex justify-around">
          <StatCard label="Followers" value={companyData.stats.followers} />
          <StatCard label="Team Size" value={companyData.stats.teamSize} />
          <StatCard label="Open Positions" value={companyData.stats.openPositions} />
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button className="flex-1" size="sm">
            <HugeiconsIcon icon={Edit01Icon} size={16} />
            Edit Company
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            <HugeiconsIcon icon={FavouriteIcon} size={16} />
            Follow
          </Button>
        </div>
      </div>

      {/* About */}
      <div className="border-b px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold">About</h3>
        <p className="text-sm leading-relaxed text-foreground">
          {companyData.description}
        </p>
      </div>

      {/* Company Details */}
      <div className="border-b px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold">Details</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <HugeiconsIcon icon={Globe02Icon} size={16} />
            </div>
            <div>
              <p className="text-sm font-medium">Website</p>
              <a
                href={`https://${companyData.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                {companyData.website}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <HugeiconsIcon icon={Briefcase01Icon} size={16} />
            </div>
            <div>
              <p className="text-sm font-medium">Industry</p>
              <p className="text-xs text-muted-foreground">{companyData.industry}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <HugeiconsIcon icon={DollarCircleIcon} size={16} />
            </div>
            <div>
              <p className="text-sm font-medium">Funding</p>
              <p className="text-xs text-muted-foreground">
                {companyData.funding.raised} • {companyData.funding.round}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <HugeiconsIcon icon={Building02Icon} size={16} />
            </div>
            <div>
              <p className="text-sm font-medium">Founded</p>
              <p className="text-xs text-muted-foreground">{companyData.founded}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <HugeiconsIcon icon={UserGroupIcon} size={16} />
            </div>
            <div>
              <p className="text-sm font-medium">Company Size</p>
              <p className="text-xs text-muted-foreground">{companyData.size} employees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="border-b px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Team</h3>
          <Button variant="ghost" size="icon" className="size-8">
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
          </Button>
        </div>
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div className="border-b px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Open Positions</h3>
          <Button variant="ghost" size="icon" className="size-8">
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
          </Button>
        </div>
        <div className="space-y-2">
          {openPositions.map((position) => (
            <PositionCard key={position.id} position={position} />
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="border-b px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold">Connect</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="size-10">
            <HugeiconsIcon icon={Linkedin01Icon} size={18} />
          </Button>
          <Button variant="outline" size="icon" className="size-10">
            <HugeiconsIcon icon={NewTwitterIcon} size={18} />
          </Button>
          <Button variant="outline" size="icon" className="size-10">
            <HugeiconsIcon icon={GithubIcon} size={18} />
          </Button>
          <Button variant="outline" size="icon" className="size-10">
            <HugeiconsIcon icon={Globe02Icon} size={18} />
          </Button>
        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-20" />
    </div>
  )
}
