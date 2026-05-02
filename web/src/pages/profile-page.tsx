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
  Delete01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import type { User, UserUpdate, Education, SocialLinks } from "@/lib/api/client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

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

function SkillTag({ skill, onRemove }: { skill: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      {skill}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:text-destructive"
          type="button"
        >
          <HugeiconsIcon icon={Delete01Icon} size={12} />
        </button>
      )}
    </span>
  )
}

function AchievementBadge({ achievement, onRemove }: { achievement: string; onRemove?: () => void }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
      <HugeiconsIcon icon={Award02Icon} size={12} />
      <span>{achievement}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:text-amber-800"
          type="button"
        >
          <HugeiconsIcon icon={Delete01Icon} size={12} />
        </button>
      )}
    </div>
  )
}

function EditSkillsSection({
  skills,
  onChange,
}: {
  skills: string[]
  onChange: (skills: string[]) => void
}) {
  const [newSkill, setNewSkill] = useState("")

  const handleAdd = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onChange([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const handleRemove = (skill: string) => {
    onChange(skills.filter((s) => s !== skill))
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Skills</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillTag key={skill} skill={skill} onRemove={() => handleRemove(skill)} />
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          placeholder="Add a skill"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"
        />
        <Button type="button" size="sm" onClick={handleAdd} disabled={!newSkill.trim()}>
          <HugeiconsIcon icon={Add01Icon} size={16} />
          Add
        </Button>
      </div>
    </div>
  )
}

function EditAchievementsSection({
  achievements,
  onChange,
}: {
  achievements: string[]
  onChange: (achievements: string[]) => void
}) {
  const [newAchievement, setNewAchievement] = useState("")

  const handleAdd = () => {
    if (newAchievement.trim() && !achievements.includes(newAchievement.trim())) {
      onChange([...achievements, newAchievement.trim()])
      setNewAchievement("")
    }
  }

  const handleRemove = (achievement: string) => {
    onChange(achievements.filter((a) => a !== achievement))
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Achievements</h3>
      <div className="flex flex-wrap gap-2">
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement} achievement={achievement} onRemove={() => handleRemove(achievement)} />
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newAchievement}
          onChange={(e) => setNewAchievement(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          placeholder="Add an achievement"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"
        />
        <Button type="button" size="sm" onClick={handleAdd} disabled={!newAchievement.trim()}>
          <HugeiconsIcon icon={Add01Icon} size={16} />
          Add
        </Button>
      </div>
    </div>
  )
}

function EditEducationSection({
  education,
  onChange,
}: {
  education: Education | null
  onChange: (education: Education) => void
}) {
  const [formData, setFormData] = useState<Education>(
    education || { school: "", degree: "", year: "" }
  )

  const handleChange = (field: keyof Education, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Education</h3>
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            School
          </label>
          <input
            type="text"
            value={formData.school}
            onChange={(e) => handleChange("school", e.target.value)}
            placeholder="e.g. Stanford University"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Degree
          </label>
          <input
            type="text"
            value={formData.degree}
            onChange={(e) => handleChange("degree", e.target.value)}
            placeholder="e.g. M.S. Computer Science"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Year
          </label>
          <input
            type="text"
            value={formData.year}
            onChange={(e) => handleChange("year", e.target.value)}
            placeholder="e.g. 2022"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>
    </div>
  )
}

function EditSocialLinksSection({
  socialLinks,
  onChange,
}: {
  socialLinks: SocialLinks | null
  onChange: (socialLinks: SocialLinks) => void
}) {
  const [formData, setFormData] = useState<SocialLinks>(
    socialLinks || { linkedin: "", github: "", twitter: "" }
  )

  const handleChange = (field: keyof SocialLinks, value: string) => {
    const updated = { ...formData, [field]: value || undefined }
    setFormData(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Social Links</h3>
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            LinkedIn
          </label>
          <input
            type="text"
            value={formData.linkedin || ""}
            onChange={(e) => handleChange("linkedin", e.target.value)}
            placeholder="e.g. linkedin.com/in/username"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            GitHub
          </label>
          <input
            type="text"
            value={formData.github || ""}
            onChange={(e) => handleChange("github", e.target.value)}
            placeholder="e.g. github.com/username"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Twitter
          </label>
          <input
            type="text"
            value={formData.twitter || ""}
            onChange={(e) => handleChange("twitter", e.target.value)}
            placeholder="e.g. twitter.com/username"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>
    </div>
  )
}

function EditProfileForm({
  user,
  onSave,
  onCancel,
}: {
  user: User
  onSave: (data: UserUpdate) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    role: user.role || "",
    company: user.company || "",
    skills: user.skills || [],
    achievements: user.achievements || [],
    education: user.education,
    social_links: user.social_links,
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
      skills: formData.skills,
      achievements: formData.achievements,
      education: formData.education || undefined,
      social_links: formData.social_links || undefined,
    })
  }

  const inputClassName =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="flex w-full justify-start overflow-x-auto px-2 scrollbar-hide">
          <TabsTrigger value="basic" className="shrink-0 whitespace-nowrap px-3">Basic Info</TabsTrigger>
          <TabsTrigger value="skills" className="shrink-0 whitespace-nowrap px-3">Skills</TabsTrigger>
          <TabsTrigger value="achievements" className="shrink-0 whitespace-nowrap px-3">Achievements</TabsTrigger>
          <TabsTrigger value="education" className="shrink-0 whitespace-nowrap px-3">Education</TabsTrigger>
          <TabsTrigger value="social" className="shrink-0 whitespace-nowrap px-3">Social</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
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
        </TabsContent>

        <TabsContent value="skills" className="pt-4">
          <EditSkillsSection
            skills={formData.skills}
            onChange={(skills) => setFormData({ ...formData, skills })}
          />
        </TabsContent>

        <TabsContent value="achievements" className="pt-4">
          <EditAchievementsSection
            achievements={formData.achievements}
            onChange={(achievements) => setFormData({ ...formData, achievements })}
          />
        </TabsContent>

        <TabsContent value="education" className="pt-4">
          <EditEducationSection
            education={formData.education}
            onChange={(education) => setFormData({ ...formData, education })}
          />
        </TabsContent>

        <TabsContent value="social" className="pt-4">
          <EditSocialLinksSection
            socialLinks={formData.social_links}
            onChange={(social_links) => setFormData({ ...formData, social_links })}
          />
        </TabsContent>
      </Tabs>

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

  const handleSave = async (data: UserUpdate) => {
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
            <AvatarImage src={""} />
            <AvatarFallback className="bg-primary text-2xl font-semibold text-primary-foreground">
              {(user?.email || "User")
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
                {user?.full_name || user?.email?.split("@")[0] || "User"}
              </h2>
              <HugeiconsIcon
                icon={CheckmarkBadge02Icon}
                size={18}
                className="text-blue-500"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {user?.email}
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
          <StatCard label="Matches" value={0} />
          <StatCard label="Connections" value={0} />
          <StatCard label="Profile Views" value={0} />
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
        {isEditing && user && (
          <div className="mt-6 rounded-lg border bg-muted/30 p-4">
            <EditProfileForm
              user={user}
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
        {user?.skills && user.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <SkillTag key={skill} skill={skill} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No skills added yet</p>
        )}
      </div>

      {/* Achievements */}
      <div className="border-b px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold">Achievements</h3>
        {user?.achievements && user.achievements.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.achievements.map((achievement) => (
              <AchievementBadge key={achievement} achievement={achievement} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No achievements added yet</p>
        )}
      </div>

      {/* Education */}
      <div className="border-b px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold">Education</h3>
        {user?.education ? (
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <HugeiconsIcon icon={Mortarboard01Icon} size={20} />
            </div>
            <div>
              <p className="text-sm font-medium">{user.education.school}</p>
              <p className="text-xs text-muted-foreground">
                {user.education.degree}
              </p>
              <p className="text-xs text-muted-foreground">{user.education.year}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No education added yet</p>
        )}
      </div>

      {/* Social Links */}
      <div className="border-b px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold">Social Links</h3>
        <div className="space-y-2">
          {user?.social_links?.linkedin ? (
            <a
              href={`https://${user.social_links.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={Linkedin01Icon} size={16} />
              <span>LinkedIn</span>
              <HugeiconsIcon icon={LinkSquare01Icon} size={12} className="ml-auto" />
            </a>
          ) : null}
          {user?.social_links?.github ? (
            <a
              href={`https://${user.social_links.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={GithubIcon} size={16} />
              <span>GitHub</span>
              <HugeiconsIcon icon={LinkSquare01Icon} size={12} className="ml-auto" />
            </a>
          ) : null}
          {user?.social_links?.twitter ? (
            <a
              href={`https://${user.social_links.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={NewTwitterIcon} size={16} />
              <span>Twitter</span>
              <HugeiconsIcon icon={LinkSquare01Icon} size={12} className="ml-auto" />
            </a>
          ) : null}
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
          ) : null}
          {!user?.social_links?.linkedin && !user?.social_links?.github && !user?.social_links?.twitter && !user?.website && (
            <p className="text-sm text-muted-foreground">No social links added yet</p>
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
