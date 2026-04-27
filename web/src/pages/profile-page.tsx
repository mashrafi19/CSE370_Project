import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Settings01Icon,
  Edit01Icon,
  Share01Icon,
  Location01Icon,
  Link01Icon,
  Briefcase01Icon,
  Mortarboard01Icon,
  CheckmarkBadge02Icon,
  Linkedin01Icon,
  GithubIcon,
  NewTwitterIcon,
  LinkSquare01Icon,
  Award02Icon,
  Logout01Icon,
  Cancel01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

interface ProfileData {
  name: string
  handle: string
  avatar: string
  location: string
  website: string
  bio: string
  role: string
  company: string
  verified: boolean
  stats: {
    matches: number
    connections: number
    views: number
  }
  skills: string[]
  education: {
    school: string
    degree: string
    year: string
  }
  experience: {
    role: string
    company: string
    period: string
  }
  social: {
    linkedin?: string
    github?: string
    twitter?: string
  }
  achievements: string[]
}

const profileData: ProfileData = {
  name: "Alex Rivera",
  handle: "@arivera",
  avatar: "",
  location: "San Francisco, CA",
  website: "alexsstartup.com",
  bio: "Full-stack developer & entrepreneur passionate about building products that make a difference. Looking for a technical co-founder to join my journey.",
  role: "Founder & CTO",
  company: "Fumble",
  verified: true,
  stats: {
    matches: 42,
    connections: 156,
    views: 1234,
  },
  skills: [
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "AWS",
    "Product Management",
    "UI/UX Design",
    "Machine Learning",
  ],
  education: {
    school: "Stanford University",
    degree: "M.S. Computer Science",
    year: "2022",
  },
  experience: {
    role: "Senior Software Engineer",
    company: "Google",
    period: "2020 - 2023",
  },
  social: {
    linkedin: "linkedin.com/in/arivera",
    github: "github.com/arivera",
    twitter: "twitter.com/arivera",
  },
  achievements: ["Top Rated", "Y Combinator Alumni", "Forbes 30 Under 30"],
}

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

function SkillTag({ skill }: { skill: string }) {
  return (
    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      {skill}
    </span>
  )
}

function AchievementBadge({ achievement }: { achievement: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
      <HugeiconsIcon icon={Award02Icon} size={12} />
      <span>{achievement}</span>
    </div>
  )
}

function EditProfileForm({
  initialData,
  onSave,
  onCancel,
}: {
  initialData: {
    full_name: string | null
    bio: string
    location: string
    website: string
    role: string
    company: string
  }
  onSave: (data: {
    full_name?: string
    bio?: string
    location?: string
    website?: string
    role?: string
    company?: string
  }) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || "",
    bio: initialData.bio,
    location: initialData.location,
    website: initialData.website,
    role: initialData.role,
    company: initialData.company,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      full_name: formData.full_name || undefined,
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
      role: formData.role,
      company: formData.company,
    })
  }

  const inputClassName =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Full Name
        </label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) =>
            setFormData({ ...formData, full_name: e.target.value })
          }
          placeholder="Your full name"
          className={inputClassName}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about yourself"
          rows={3}
          className={`${inputClassName} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Role
          </label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g. Founder"
            className={inputClassName}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Company
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            placeholder="e.g. Acme Inc"
            className={inputClassName}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Location
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          placeholder="e.g. San Francisco, CA"
          className={inputClassName}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Website
        </label>
        <input
          type="text"
          value={formData.website}
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
          }
          placeholder="e.g. example.com"
          className={inputClassName}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1">
          <HugeiconsIcon icon={Tick01Icon} size={16} />
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (data: Parameters<typeof updateUser>[0]) => {
    setIsSaving(true)
    try {
      await updateUser(data)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("Failed to save changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-xl font-bold">Profile</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-9">
            <HugeiconsIcon icon={Share01Icon} size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="size-9">
            <HugeiconsIcon icon={Settings01Icon} size={20} />
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="border-b px-4 py-6">
        <div className="flex items-start gap-4">
          <Avatar className="size-20 ring-4 ring-primary/10">
            <AvatarImage src={profileData.avatar} />
            <AvatarFallback className="bg-primary text-2xl font-semibold text-primary-foreground">
              {(user?.email || profileData.name)
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">
                {user?.full_name || user?.email?.split("@")[0] || profileData.name}
              </h2>
              {profileData.verified && (
                <HugeiconsIcon
                  icon={CheckmarkBadge02Icon}
                  size={18}
                  className="text-blue-500"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {user?.email || profileData.handle}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <HugeiconsIcon icon={Briefcase01Icon} size={12} />
                <span>
                  {user?.role || "N/A"}
                  {user?.role && user?.company ? " at " : ""}
                  {user?.company || (user?.role ? "" : "N/A")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <HugeiconsIcon icon={Location01Icon} size={12} />
                <span>{user?.location || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex justify-around">
          <StatCard label="Matches" value={profileData.stats.matches} />
          <StatCard label="Connections" value={profileData.stats.connections} />
          <StatCard label="Profile Views" value={profileData.stats.views} />
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button
            className="w-full"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isEditing || isSaving}
          >
            <HugeiconsIcon icon={Edit01Icon} size={16} />
            Edit Profile
          </Button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="mt-6 rounded-lg border bg-muted/30 p-4">
            <EditProfileForm
              initialData={{
                full_name: user?.full_name,
                bio: user?.bio || "",
                location: user?.location || "",
                website: user?.website || "",
                role: user?.role || "",
                company: user?.company || "",
              }}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        )}
      </div>

      {/* Bio */}
      <div className="border-b px-4 py-4">
        <p className="text-sm leading-relaxed text-foreground">
          {user?.bio || "N/A"}
        </p>
      </div>

      {/* Skills */}
      <div className="border-b px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {profileData.skills.map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="border-b px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold">Achievements</h3>
        <div className="flex flex-wrap gap-2">
          {profileData.achievements.map((achievement) => (
            <AchievementBadge key={achievement} achievement={achievement} />
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="border-b px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold">Experience</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <HugeiconsIcon icon={Briefcase01Icon} size={20} />
            </div>
            <div>
              <p className="text-sm font-medium">{profileData.experience.role}</p>
              <p className="text-xs text-muted-foreground">
                {profileData.experience.company}
              </p>
              <p className="text-xs text-muted-foreground">
                {profileData.experience.period}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="border-b px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold">Education</h3>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <HugeiconsIcon icon={Mortarboard01Icon} size={20} />
          </div>
          <div>
            <p className="text-sm font-medium">{profileData.education.school}</p>
            <p className="text-xs text-muted-foreground">
              {profileData.education.degree}
            </p>
            <p className="text-xs text-muted-foreground">{profileData.education.year}</p>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="border-b px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold">Social Links</h3>
        <div className="space-y-2">
          {profileData.social.linkedin && (
            <a
              href={`https://${profileData.social.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={Linkedin01Icon} size={16} />
              <span>LinkedIn</span>
              <HugeiconsIcon icon={LinkSquare01Icon} size={12} className="ml-auto" />
            </a>
          )}
          {profileData.social.github && (
            <a
              href={`https://${profileData.social.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={GithubIcon} size={16} />
              <span>GitHub</span>
              <HugeiconsIcon icon={LinkSquare01Icon} size={12} className="ml-auto" />
            </a>
          )}
          {profileData.social.twitter && (
            <a
              href={`https://${profileData.social.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={NewTwitterIcon} size={16} />
              <span>Twitter</span>
              <HugeiconsIcon icon={LinkSquare01Icon} size={12} className="ml-auto" />
            </a>
          )}
          {user?.website ? (
            <a
              href={`https://${user.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={Link01Icon} size={16} />
              <span>{user.website}</span>
              <HugeiconsIcon icon={LinkSquare01Icon} size={12} className="ml-auto" />
            </a>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HugeiconsIcon icon={Link01Icon} size={16} />
              <span>N/A</span>
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 py-4">
        <Button
          variant="outline"
          className="w-full"
          size="sm"
          onClick={logout}
        >
          <HugeiconsIcon icon={Logout01Icon} size={16} />
          Log out
        </Button>
      </div>

    </div>
  )
}
