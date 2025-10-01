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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  UserPlus,
  Mail,
  Phone,
  GraduationCap,
  Target,
  Plus,
  X,
  Upload,
  Download,
  FileJson,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import bcrypt from 'bcryptjs'

const INTEREST_OPTIONS = [
  'Web Development', 'Mobile Development', 'UI/UX Design', 'Data Science',
  'Machine Learning', 'DevOps', 'Blockchain', 'Game Development',
  'Cybersecurity', 'Cloud Computing', 'Backend Development', 'Frontend Development'
]

const LEVEL_OPTIONS = [
  'Beginner', 'Intermediate', 'Advanced'
]

const STUDY_GOAL_OPTIONS = [
  'Career Change', 'Skill Enhancement', 'Personal Project',
  'Certification', 'Job Preparation', 'Freelancing'
]

interface StudentFormData {
  email: string
  password: string
  name: string
  phone: string
  age?: number
  location?: string
  level: string
  interests: string[]
  studyGoals: string[]
  bio?: string
}

interface BulkImportResult {
  success: number
  failed: number
  errors: Array<{
    row: number
    email: string
    error: string
  }>
}

export default function AddStudentForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [newInterest, setNewInterest] = useState('')
  const [newGoal, setNewGoal] = useState('')
  const [bulkResult, setBulkResult] = useState<BulkImportResult | null>(null)

  // Convex mutation for creating user
  const createUser = useMutation(api.users.create)

  const [formData, setFormData] = useState<StudentFormData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    age: undefined,
    location: '',
    level: 'Beginner',
    interests: [],
    studyGoals: [],
    bio: ''
  })

  const addInterest = (interest: string) => {
    if (interest && !formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest]
      })
    }
    setNewInterest('')
  }

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    })
  }

  const addGoal = (goal: string) => {
    if (goal && !formData.studyGoals.includes(goal)) {
      setFormData({
        ...formData,
        studyGoals: [...formData.studyGoals, goal]
      })
    }
    setNewGoal('')
  }

  const removeGoal = (goal: string) => {
    setFormData({
      ...formData,
      studyGoals: formData.studyGoals.filter(g => g !== goal)
    })
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

    setLoading(true)
    const loadingToast = toast.loading('Creating student account...')

    try {
      // Hash password before saving
      const hashedPassword = await bcrypt.hash(formData.password, 10)

      // Create student account using Convex
      await createUser({
        email: formData.email,
        password: hashedPassword,
        role: 'siswa' as const,
        name: formData.name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=1976d2&color=fff`,
        phone: formData.phone,
        age: formData.age,
        location: formData.location,
        level: formData.level,
        interests: formData.interests,
        studyGoals: formData.studyGoals,
        provider: 'email',
        emailVerified: false,
      })

      toast.dismiss(loadingToast)

      // Show success toast with credentials
      toast.success(
        <div className="space-y-2">
          <p className="font-semibold">Student account created successfully!</p>
          <div className="text-sm space-y-1">
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Password:</strong> {formData.password}</p>
          </div>
          <p className="text-xs text-muted-foreground">Please share these credentials with the student</p>
        </div>,
        { duration: 10000 }
      )

      // Reset form
      setFormData({
        email: '',
        password: '',
        name: '',
        phone: '',
        age: undefined,
        location: '',
        level: 'Beginner',
        interests: [],
        studyGoals: [],
        bio: ''
      })

      setTimeout(() => {
        router.push('/dashboard/users')
      }, 2000)
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error creating student:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create student account. Please try again.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Download CSV Template
  const downloadCSVTemplate = () => {
    const csvContent = `email,password,name,phone,age,location,level,interests,studyGoals
student1@example.com,password123,John Doe,+6281234567890,25,Jakarta,Beginner,"Web Development|Mobile Development","Career Change|Skill Enhancement"
student2@example.com,password456,Jane Smith,+6281234567891,22,Bandung,Intermediate,"UI/UX Design|Frontend Development","Job Preparation|Personal Project"
student3@example.com,password789,Bob Wilson,+6281234567892,30,Surabaya,Advanced,"Data Science|Machine Learning","Certification|Freelancing"`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Download JSON Template
  const downloadJSONTemplate = () => {
    const jsonData = [
      {
        email: "student1@example.com",
        password: "password123",
        name: "John Doe",
        phone: "+6281234567890",
        age: 25,
        location: "Jakarta",
        level: "Beginner",
        interests: ["Web Development", "Mobile Development"],
        studyGoals: ["Career Change", "Skill Enhancement"]
      },
      {
        email: "student2@example.com",
        password: "password456",
        name: "Jane Smith",
        phone: "+6281234567891",
        age: 22,
        location: "Bandung",
        level: "Intermediate",
        interests: ["UI/UX Design", "Frontend Development"],
        studyGoals: ["Job Preparation", "Personal Project"]
      },
      {
        email: "student3@example.com",
        password: "password789",
        name: "Bob Wilson",
        phone: "+6281234567892",
        age: 30,
        location: "Surabaya",
        level: "Advanced",
        interests: ["Data Science", "Machine Learning"],
        studyGoals: ["Certification", "Freelancing"]
      }
    ]

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_import_template.json'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Handle CSV Import
  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBulkLoading(true)
    setBulkResult(null)

    try {
      const text = await file.text()
      const rows = text.split('\n').slice(1) // Skip header

      const results: BulkImportResult = {
        success: 0,
        failed: 0,
        errors: []
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i].trim()
        if (!row) continue

        const columns = row.split(',')
        if (columns.length < 4) continue

        try {
          const [email, password, name, phone, age, location, level, interests, studyGoals] = columns

          // Hash password before saving
          const hashedPassword = await bcrypt.hash(password.trim(), 10)

          await createUser({
            email: email.trim(),
            password: hashedPassword,
            name: name.trim(),
            phone: phone.trim(),
            age: age ? parseInt(age.trim()) : undefined,
            location: location?.trim(),
            level: level?.trim() || 'Beginner',
            interests: interests ? interests.trim().replace(/"/g, '').split('|') : [],
            studyGoals: studyGoals ? studyGoals.trim().replace(/"/g, '').split('|') : [],
            role: 'siswa' as const,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=1976d2&color=fff`,
            provider: 'email',
            emailVerified: false,
          })

          results.success++
        } catch (error) {
          results.failed++
          results.errors.push({
            row: i + 2,
            email: columns[0]?.trim() || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      setBulkResult(results)
      if (results.success > 0) {
        toast.success(`Successfully imported ${results.success} student(s)`)
      }
      if (results.failed > 0) {
        toast.error(`Failed to import ${results.failed} student(s)`)
      }
    } catch (error) {
      toast.error('Failed to parse CSV file. Please check the format.')
    } finally {
      setBulkLoading(false)
      e.target.value = '' // Reset file input
    }
  }

  // Handle JSON Import
  const handleJSONImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBulkLoading(true)
    setBulkResult(null)

    try {
      const text = await file.text()
      const students = JSON.parse(text)

      if (!Array.isArray(students)) {
        throw new Error('JSON file must contain an array of students')
      }

      const results: BulkImportResult = {
        success: 0,
        failed: 0,
        errors: []
      }

      for (let i = 0; i < students.length; i++) {
        const student = students[i]

        try {
          // Hash password before saving
          const hashedPassword = await bcrypt.hash(student.password, 10)

          await createUser({
            email: student.email,
            password: hashedPassword,
            name: student.name,
            phone: student.phone,
            age: student.age,
            location: student.location,
            level: student.level || 'Beginner',
            interests: student.interests || [],
            studyGoals: student.studyGoals || [],
            role: 'siswa' as const,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1976d2&color=fff`,
            provider: 'email',
            emailVerified: false,
          })

          results.success++
        } catch (error) {
          results.failed++
          results.errors.push({
            row: i + 1,
            email: student.email || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      setBulkResult(results)
      if (results.success > 0) {
        toast.success(`Successfully imported ${results.success} student(s)`)
      }
      if (results.failed > 0) {
        toast.error(`Failed to import ${results.failed} student(s)`)
      }
    } catch (error) {
      toast.error('Failed to parse JSON file. Please check the format.')
    } finally {
      setBulkLoading(false)
      e.target.value = '' // Reset file input
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserPlus className="h-8 w-8 text-blue-600" />
          Add New Student
        </h1>
        <p className="text-muted-foreground mt-2">
          Create student accounts individually or import multiple students from CSV/JSON file
        </p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Student</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>

        {/* Single Student Form */}
        <TabsContent value="single">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Essential details for the student account
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
                      placeholder="student@example.com"
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({...formData, age: e.target.value ? parseInt(e.target.value) : undefined})}
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Jakarta"
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">Level *</Label>
                    <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVEL_OPTIONS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests & Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Interests & Learning Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Interests */}
                <div>
                  <Label>Interests</Label>
                  <div className="flex gap-2 mb-2">
                    <Select value={newInterest} onValueChange={setNewInterest}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select interest to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {INTEREST_OPTIONS.filter(interest => !formData.interests.includes(interest)).map((interest) => (
                          <SelectItem key={interest} value={interest}>
                            {interest}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={() => addInterest(newInterest)}
                      disabled={!newInterest}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Study Goals */}
                <div>
                  <Label>Study Goals</Label>
                  <div className="flex gap-2 mb-2">
                    <Select value={newGoal} onValueChange={setNewGoal}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select goal to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDY_GOAL_OPTIONS.filter(goal => !formData.studyGoals.includes(goal)).map((goal) => (
                          <SelectItem key={goal} value={goal}>
                            {goal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={() => addGoal(newGoal)}
                      disabled={!newGoal}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.studyGoals.map((goal) => (
                      <Badge key={goal} variant="outline" className="flex items-center gap-1">
                        {goal}
                        <button
                          type="button"
                          onClick={() => removeGoal(goal)}
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

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/admin')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? 'Creating Student...' : 'Create Student Account'}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Bulk Import */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Import Students</CardTitle>
              <CardDescription>
                Import multiple students at once using CSV or JSON file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Download Templates */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Template
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={downloadCSVTemplate}
                    className="w-full justify-start"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Download CSV Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={downloadJSONTemplate}
                    className="w-full justify-start"
                  >
                    <FileJson className="h-4 w-4 mr-2" />
                    Download JSON Template
                  </Button>
                </div>
              </div>

              {/* Upload Files */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload File
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="csv-upload">Upload CSV File</Label>
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleCSVImport}
                      disabled={bulkLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="json-upload">Upload JSON File</Label>
                    <Input
                      id="json-upload"
                      type="file"
                      accept=".json"
                      onChange={handleJSONImport}
                      disabled={bulkLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {bulkLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Importing students...</p>
                  </div>
                </div>
              )}

              {/* Import Results */}
              {bulkResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-2xl font-bold text-green-900">{bulkResult.success}</p>
                            <p className="text-sm text-green-700">Successfully imported</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="text-2xl font-bold text-red-900">{bulkResult.failed}</p>
                            <p className="text-sm text-red-700">Failed to import</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {bulkResult.errors.length > 0 && (
                    <Card className="border-yellow-200 bg-yellow-50">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          Error Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {bulkResult.errors.map((error, idx) => (
                            <div key={idx} className="text-sm p-2 bg-white rounded border border-yellow-200">
                              <p className="font-semibold">Row {error.row}: {error.email}</p>
                              <p className="text-red-600">{error.error}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={() => router.push('/dashboard/admin')}
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
