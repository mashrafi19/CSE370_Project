import { useState, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Edit01Icon,
  Location01Icon,
  Briefcase01Icon,
  Globe02Icon,
  Building02Icon,
  DollarCircleIcon,
  UserGroupIcon,
  PlusSignIcon,
  CheckmarkBadge02Icon,
  Cancel01Icon,
  Tick01Icon,
  Building03Icon,
  Delete01Icon,
  Add01Icon,
  Briefcase02Icon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { companiesApi, jobsApi, type Company, type CompanyCreate, type JobCreate, ApiError } from "@/lib/api/client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CompanyFormData {
  name: string
  tagline: string
  description: string
  website: string
  location: string
  industry: string
  stage: string
  founded_year: string
  size: string
  funding_amount: string
  funding_round: string
}

function CompanyForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  onSubmit: (data: CompanyCreate) => void
  onCancel: () => void
  isSubmitting: boolean
}) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    tagline: "",
    description: "",
    website: "",
    location: "",
    industry: "",
    stage: "",
    founded_year: "",
    size: "",
    funding_amount: "",
    funding_round: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onSubmit({
        name: formData.name,
        tagline: formData.tagline || undefined,
        description: formData.description || undefined,
        website: formData.website || undefined,
        location: formData.location || undefined,
        industry: formData.industry || undefined,
        stage: formData.stage || undefined,
        founded_year: formData.founded_year || undefined,
        size: formData.size || undefined,
        funding_amount: formData.funding_amount || undefined,
        funding_round: formData.funding_round || undefined,
      })
    }
  }

  const inputClassName =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4">
        <h2 className="mb-4 text-lg font-semibold">Create Your Company</h2>
        
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Acme Inc"
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Building the future of AI"
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us about your company"
              rows={3}
              className={`${inputClassName} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Website
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="e.g. acme.com"
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Francisco, CA"
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. Technology"
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Stage
              </label>
              <input
                type="text"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                placeholder="e.g. Seed, Series A"
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Founded Year
              </label>
              <input
                type="text"
                value={formData.founded_year}
                onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                placeholder="e.g. 2024"
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Company Size
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g. 1-10"
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Funding Amount
              </label>
              <input
                type="text"
                value={formData.funding_amount}
                onChange={(e) => setFormData({ ...formData, funding_amount: e.target.value })}
                placeholder="e.g. $500K"
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Funding Round
              </label>
              <input
                type="text"
                value={formData.funding_round}
                onChange={(e) => setFormData({ ...formData, funding_round: e.target.value })}
                placeholder="e.g. Seed"
                className={inputClassName}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1" disabled={isSubmitting || !formData.name.trim()}>
          <HugeiconsIcon icon={Tick01Icon} size={16} />
          {isSubmitting ? "Creating..." : "Create Company"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
          Cancel
        </Button>
      </div>
    </form>
  )
}

interface JobFormData {
  title: string
  department: string
  type: string
  location: string
  description: string
  requirements: string
  salary_range: string
}

function JobForm({
  company,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  company: Company
  onSubmit: (data: JobCreate) => void
  onCancel: () => void
  isSubmitting: boolean
}) {
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    department: "",
    type: "",
    location: "",
    description: "",
    requirements: "",
    salary_range: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim()) {
      onSubmit({
        title: formData.title,
        department: formData.department || undefined,
        type: formData.type || undefined,
        location: formData.location || undefined,
        description: formData.description || undefined,
        requirements: formData.requirements
          ? formData.requirements.split("\n").filter((r) => r.trim())
          : [],
        salary_range: formData.salary_range || undefined,
      })
    }
  }

  const inputClassName =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4">
        <h2 className="mb-4 text-lg font-semibold">List a Job at {company.name}</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Software Engineer"
              className={inputClassName}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Engineering"
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Job Type
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g. Full-time"
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Remote, San Francisco"
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Salary Range
              </label>
              <input
                type="text"
                value={formData.salary_range}
                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                placeholder="e.g. $100K - $150K"
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the role and responsibilities"
              rows={3}
              className={`${inputClassName} resize-none`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Requirements (one per line)
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="e.g. 5+ years of experience&#10;React expertise&#10;Team leadership"
              rows={3}
              className={`${inputClassName} resize-none`}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1" disabled={isSubmitting || !formData.title.trim()}>
          <HugeiconsIcon icon={Tick01Icon} size={16} />
          {isSubmitting ? "Listing..." : "List Job"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
          Cancel
        </Button>
      </div>
    </form>
  )
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

function CompanyCard({ 
  company,
  onEdit,
  onDelete,
  isInvestor = false,
}: { 
  company: Company
  onEdit: () => void
  onDelete: () => void
  isInvestor?: boolean
}) {
  return (
    <div className="border-b px-4 py-6">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary">
          {company.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{company.name}</h2>
            <HugeiconsIcon
              icon={CheckmarkBadge02Icon}
              size={18}
              className="text-blue-500 shrink-0"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {company.tagline || "No tagline"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {company.stage && (
              <div className="flex items-center gap-1">
                <HugeiconsIcon icon={Building02Icon} size={12} />
                <span>{company.stage}</span>
              </div>
            )}
            {company.location && (
              <div className="flex items-center gap-1">
                <HugeiconsIcon icon={Location01Icon} size={12} />
                <span>{company.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 flex justify-around">
        <StatCard label="Followers" value={0} />
        <StatCard label="Team Size" value={company.size || "N/A"} />
        <StatCard label="Open Positions" value={0} />
      </div>

      {/* Actions - Only show edit/delete for founders, not investors */}
      {!isInvestor && (
        <div className="mt-6 flex gap-3">
          <Button className="flex-1" size="sm" onClick={onEdit}>
            <HugeiconsIcon icon={Edit01Icon} size={16} />
            Edit Company
          </Button>
          <Button variant="outline" className="flex-1" size="sm" onClick={onDelete}>
            <HugeiconsIcon icon={Delete01Icon} size={16} />
            Delete
          </Button>
        </div>
      )}
      
      {/* Show investor badge if user is an investor */}
      {isInvestor && (
        <div className="mt-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
          <p className="text-sm text-green-700 text-center font-medium">
            You are an investor in this company
          </p>
        </div>
      )}
    </div>
  )
}

function CompanyDetails({ company }: { company: Company }) {
  return (
    <>
      {/* About */}
      <div className="border-b px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold">About</h3>
        <p className="text-sm leading-relaxed text-foreground">
          {company.description || "No description yet"}
        </p>
      </div>

      {/* Company Details */}
      <div className="border-b px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold">Details</h3>
        <div className="space-y-3">
          {company.website && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <HugeiconsIcon icon={Globe02Icon} size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">Website</p>
                <a
                  href={`https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  {company.website}
                </a>
              </div>
            </div>
          )}
          {company.industry && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <HugeiconsIcon icon={Briefcase01Icon} size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">Industry</p>
                <p className="text-xs text-muted-foreground">{company.industry}</p>
              </div>
            </div>
          )}
          {(company.funding_amount || company.funding_round) && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <HugeiconsIcon icon={DollarCircleIcon} size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">Funding</p>
                <p className="text-xs text-muted-foreground">
                  {company.funding_amount || "N/A"} {company.funding_round ? `• ${company.funding_round}` : ""}
                </p>
              </div>
            </div>
          )}
          {company.founded_year && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <HugeiconsIcon icon={Building02Icon} size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">Founded</p>
                <p className="text-xs text-muted-foreground">{company.founded_year}</p>
              </div>
            </div>
          )}
          {company.size && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <HugeiconsIcon icon={UserGroupIcon} size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">Company Size</p>
                <p className="text-xs text-muted-foreground">{company.size} employees</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Founders */}
      <div className="border-b px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold">Founders</h3>
        <div className="space-y-3">
          {company.founders.map((founder) => (
            <div key={founder.id} className="flex items-center gap-3">
              <Avatar className="size-10 ring-2 ring-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {(founder.full_name || founder.email)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{founder.full_name || founder.email.split("@")[0]}</p>
                <p className="text-xs text-muted-foreground">{founder.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showJobForm, setShowJobForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  // Check if current user is an investor in the selected company
  const isInvestor = selectedCompany?.investors?.some(inv => inv.id === currentUserId) || false
  // Check if current user is a founder
  const isFounder = selectedCompany?.founders?.some(f => f.id === currentUserId) || false

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch current user
        const token = localStorage.getItem("token")
        if (token) {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (response.ok) {
            const user = await response.json()
            if (!cancelled) {
              setCurrentUserId(user.id)
            }
          }
        }
        
        // Fetch companies
        const myCompanies = await companiesApi.getMyCompanies()
        if (!cancelled) {
          setCompanies(myCompanies)
          if (myCompanies.length > 0) {
            setSelectedCompany(myCompanies[0])
          }
        }
      } catch (err) {
        console.error("Failed to load data:", err)
        if (!cancelled) {
          setError("Failed to load companies. Please try again.")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  const handleCreateCompany = async (data: CompanyCreate) => {
    try {
      setIsSubmitting(true)
      setError(null)
      const newCompany = await companiesApi.createCompany(data)
      setCompanies([...companies, newCompany])
      setSelectedCompany(newCompany)
      setShowForm(false)
    } catch (err) {
      console.error("Failed to create company:", err)
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to create company. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCompany = async (companyId: number) => {
    if (!confirm("Are you sure you want to delete this company?")) {
      return
    }

    try {
      setIsSubmitting(true)
      await companiesApi.deleteCompany(companyId)
      const updatedCompanies = companies.filter((c) => c.id !== companyId)
      setCompanies(updatedCompanies)
      if (updatedCompanies.length > 0) {
        setSelectedCompany(updatedCompanies[0])
      } else {
        setSelectedCompany(null)
      }
    } catch (err) {
      console.error("Failed to delete company:", err)
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to delete company. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateJob = async (data: JobCreate) => {
    if (!selectedCompany) return

    try {
      setIsSubmitting(true)
      setError(null)
      await jobsApi.createJob(selectedCompany.id, data)
      setShowJobForm(false)
    } catch (err) {
      console.error("Failed to create job:", err)
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to create job. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasCompanies = companies.length > 0

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-xl font-bold">Company</h1>
        <div className="flex items-center gap-2">
          {hasCompanies && (
            <>
              <Button variant="ghost" size="icon" className="size-9" onClick={() => setShowForm(true)}>
                <HugeiconsIcon icon={PlusSignIcon} size={20} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowJobForm(true)}
                disabled={!selectedCompany}
              >
                <HugeiconsIcon icon={Briefcase02Icon} size={16} />
                List Job
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* No Companies - Show Create Form */}
      {!hasCompanies && !showForm ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <HugeiconsIcon icon={Building03Icon} size={40} className="text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">No Company Yet</h2>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            You haven't created or joined any companies yet. Create your first company to get started.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <HugeiconsIcon icon={Add01Icon} size={16} />
            Create Company
          </Button>
        </div>
      ) : showJobForm && selectedCompany ? (
        <div className="px-4 py-4">
          <JobForm
            company={selectedCompany}
            onSubmit={handleCreateJob}
            onCancel={() => {
              setShowJobForm(false)
              setError(null)
            }}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : showForm ? (
        <div className="px-4 py-4">
          <CompanyForm
            onSubmit={handleCreateCompany}
            onCancel={() => {
              setShowForm(false)
              setError(null)
            }}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : (
        <>
          {/* Company Tabs */}
          {companies.length > 1 && (
            <div className="border-b px-4 py-2">
              <Tabs value={selectedCompany?.id.toString()} onValueChange={(value) => {
                const company = companies.find((c) => c.id.toString() === value)
                if (company) setSelectedCompany(company)
              }}>
                <TabsList className="flex w-full justify-start overflow-x-auto px-2 scrollbar-hide">
                  {companies.map((company) => (
                    <TabsTrigger 
                      key={company.id} 
                      value={company.id.toString()}
                      className="shrink-0 whitespace-nowrap px-3"
                    >
                      {company.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Selected Company */}
          {selectedCompany && (
            <>
              <CompanyCard 
                company={selectedCompany} 
                onEdit={() => {}}
                onDelete={() => handleDeleteCompany(selectedCompany.id)}
                isInvestor={isInvestor && !isFounder}
              />
              <CompanyDetails company={selectedCompany} />
            </>
          )}
        </>
      )}

      {/* Footer spacing */}
      <div className="h-20" />
    </div>
  )
}
