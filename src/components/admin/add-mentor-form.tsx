'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Star,
  Code,
  GraduationCap,
  Briefcase,
  Plus,
  X
} from "lucide-react"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import bcrypt from 'bcryptjs'

const SKILL_OPTIONS = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular',
  'Node.js', 'Python', 'Java', 'PHP', 'Go', 'PostgreSQL', 'MongoDB', 
  'Redis', 'Docker', 'AWS', 'Azure', 'GCP', 'UI/UX Design', 'Mobile Development',
  'DevOps', 'Machine Learning', 'Data Science', 'Blockchain'
]

interface MentorFormData {
  email: string
  password: string
  name: string
  phone: string
  bio: string
  skills: string[]
  experience: string
  education: string
  portfolioUrl: string
  linkedinUrl: string
  githubUrl: string
  hourlyRate: number
  availability: string[]
  specializations: string[]
  bankDetails: {
    bankName: string
    accountNumber: string
    accountName: string
  }
}

export default function AddMentorForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [newSpecialization, setNewSpecialization] = useState('')

  // Convex mutation for creating user
  const createUser = useMutation(api.users.create)
  
  const [formData, setFormData] = useState<MentorFormData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    bio: '',
    skills: [],
    experience: '',
    education: '',
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    hourlyRate: 50000,
    availability: [],
    specializations: [],
    bankDetails: {
      bankName: '',
      accountNumber: '',
      accountName: ''
    }
  })

  const availabilityOptions = [
    'Monday Morning', 'Monday Afternoon', 'Monday Evening',
    'Tuesday Morning', 'Tuesday Afternoon', 'Tuesday Evening',
    'Wednesday Morning', 'Wednesday Afternoon', 'Wednesday Evening',
    'Thursday Morning', 'Thursday Afternoon', 'Thursday Evening',
    'Friday Morning', 'Friday Afternoon', 'Friday Evening',
    'Saturday Morning', 'Saturday Afternoon', 'Saturday Evening',
    'Sunday Morning', 'Sunday Afternoon', 'Sunday Evening'
  ]

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill]
      })
    }
    setNewSkill('')
  }

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    })
  }

  const addSpecialization = (specialization: string) => {
    if (specialization && !formData.specializations.includes(specialization)) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, specialization]
      })
    }
    setNewSpecialization('')
  }

  const removeSpecialization = (specialization: string) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter(s => s !== specialization)
    })
  }

  const handleAvailabilityChange = (slot: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        availability: [...formData.availability, slot]
      })
    } else {
      setFormData({
        ...formData,
        availability: formData.availability.filter(s => s !== slot)
      })
    }
  }

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, password })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password || !formData.name || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.skills.length === 0) {
      toast.error('Please add at least one skill')
      return
    }

    setLoading(true)
    const loadingToast = toast.loading('Creating mentor account...')

    try {
      // Hash password before saving
      const hashedPassword = await bcrypt.hash(formData.password, 10)

      // Create user account using Convex
      await createUser({
        email: formData.email,
        password: hashedPassword,
        role: 'mentor' as const,
        name: formData.name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=2e7d32&color=fff`,
        phone: formData.phone,
        bio: formData.bio,
        skills: formData.skills,
        rating: 5.0,
        totalStudents: 0,
        experienceYears: parseInt(formData.experience) || 0,
        specialization: formData.specializations,
        provider: 'email',
        emailVerified: false,
        socialMedia: {
          linkedin: formData.linkedinUrl,
          github: formData.githubUrl,
          portfolio: formData.portfolioUrl,
        }
      })

      toast.dismiss(loadingToast)

      // Show success toast with credentials
      toast.success(
        <div className="space-y-2">
          <p className="font-semibold">Mentor account created successfully!</p>
          <div className="text-sm space-y-1">
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Password:</strong> {formData.password}</p>
          </div>
          <p className="text-xs text-muted-foreground">Please share these credentials with the mentor</p>
        </div>,
        { duration: 10000 }
      )

      // Reset form
      setFormData({
        email: '',
        password: '',
        name: '',
        phone: '',
        bio: '',
        skills: [],
        experience: '',
        education: '',
        portfolioUrl: '',
        linkedinUrl: '',
        githubUrl: '',
        hourlyRate: 50000,
        availability: [],
        specializations: [],
        bankDetails: {
          bankName: '',
          accountNumber: '',
          accountName: ''
        }
      })

      setTimeout(() => {
        router.push('/dashboard/users')
      }, 2000)
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error creating mentor:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create mentor account. Please try again.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserPlus className="h-8 w-8" />
          Add New Mentor
        </h1>
        <p className="text-muted-foreground mt-2">
          Create a new mentor account with skills, experience, and payment details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Essential details for the mentor account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="mentor@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Password"
                    required
                  />
                  <Button type="button" variant="outline" onClick={generatePassword}>
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+6281234567890"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio/Description</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Brief description about the mentor..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills and Expertise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Skills & Expertise
            </CardTitle>
            <CardDescription>
              Technical skills and areas of specialization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Skills */}
            <div>
              <Label>Skills *</Label>
              <div className="flex gap-2 mb-2">
                <Select value={newSkill} onValueChange={setNewSkill}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select skill to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_OPTIONS.filter(skill => !formData.skills.includes(skill)).map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => addSkill(newSkill)}
                  disabled={!newSkill}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div>
              <Label>Specializations</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="e.g., Full Stack Development"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization(newSpecialization))}
                />
                <Button
                  type="button"
                  onClick={() => addSpecialization(newSpecialization)}
                  disabled={!newSpecialization}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec) => (
                  <Badge key={spec} variant="outline" className="flex items-center gap-1">
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialization(spec)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="experience">Experience</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                placeholder="Previous work experience, companies, projects..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="education">Education</Label>
              <Textarea
                id="education"
                value={formData.education}
                onChange={(e) => setFormData({...formData, education: e.target.value})}
                placeholder="Educational background, certifications..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                  placeholder="https://portfolio.com"
                />
              </div>
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details for Payouts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Payment Information
            </CardTitle>
            <CardDescription>
              Bank details for monthly payouts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={formData.bankDetails.bankName}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                  })}
                  placeholder="e.g., BCA, Mandiri, BNI"
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                  })}
                  placeholder="Account number"
                />
              </div>
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={formData.bankDetails.accountName}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountName: e.target.value }
                  })}
                  placeholder="Account holder name"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? 'Creating Mentor...' : 'Create Mentor Account'}
          </Button>
        </div>
      </form>
    </div>
  )
}