'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation } from 'convex/react'
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Shield,
  Briefcase,
  GraduationCap,
  Camera,
  Save,
  AlertCircle,
  CheckCircle2,
  Github,
  Linkedin,
  Globe,
  Award,
  BookOpen,
  Target
} from "lucide-react"
import { toast } from 'sonner'
import bcrypt from 'bcryptjs'
import { Id } from "../../../convex/_generated/dataModel"

export default function AccountSettings() {
  const { data: session, update: updateSession } = useSession()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Fetch user data from Convex
  const userData = useQuery(
    api.users.getByEmail,
    session?.user?.email ? { email: session.user.email } : "skip"
  )

  const updateUser = useMutation(api.users.update)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    age: undefined as number | undefined,
  })

  // Role-specific form state
  const [mentorForm, setMentorForm] = useState({
    skills: [] as string[],
    experienceYears: 0,
    company: '',
    specialization: [] as string[],
    linkedin: '',
    github: '',
    portfolio: '',
  })

  const [studentForm, setStudentForm] = useState({
    level: '',
    interests: [] as string[],
    studyGoals: [] as string[],
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Load user data when fetched
  useEffect(() => {
    if (userData) {
      setProfileForm({
        name: userData.name || '',
        phone: userData.phone || '',
        location: userData.location || '',
        bio: userData.bio || '',
        age: userData.age,
      })

      if (userData.role === 'mentor') {
        setMentorForm({
          skills: userData.skills || [],
          experienceYears: userData.experienceYears || 0,
          company: userData.company || '',
          specialization: userData.specialization || [],
          linkedin: userData.socialMedia?.linkedin || '',
          github: userData.socialMedia?.github || '',
          portfolio: userData.socialMedia?.portfolio || '',
        })
      }

      if (userData.role === 'siswa') {
        setStudentForm({
          level: userData.level || 'Beginner',
          interests: userData.interests || [],
          studyGoals: userData.studyGoals || [],
        })
      }
    }
  }, [userData])

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData) return

    setLoading(true)
    const loadingToast = toast.loading('Updating profile...')

    try {
      const updateData: any = {
        id: userData._id,
        name: profileForm.name,
        phone: profileForm.phone,
        bio: profileForm.bio,
        location: profileForm.location,
      }

      // Add role-specific fields
      if (userData.role === 'mentor') {
        updateData.company = mentorForm.company
        updateData.experienceYears = mentorForm.experienceYears
        updateData.skills = mentorForm.skills
        updateData.socialMedia = {
          linkedin: mentorForm.linkedin,
          github: mentorForm.github,
          portfolio: mentorForm.portfolio,
        }
      } else if (userData.role === 'siswa') {
        updateData.level = studentForm.level
        updateData.interests = studentForm.interests
        updateData.studyGoals = studentForm.studyGoals
      }

      await updateUser(updateData)

      // Update session
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: profileForm.name,
        },
      })

      toast.dismiss(loadingToast)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData) return

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setPasswordLoading(true)
    const loadingToast = toast.loading('Changing password...')

    try {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        passwordForm.currentPassword,
        userData.password || ''
      )

      if (!isPasswordValid) {
        toast.dismiss(loadingToast)
        toast.error('Current password is incorrect')
        setPasswordLoading(false)
        return
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(passwordForm.newPassword, 10)

      // Update password in Convex (need to add this mutation)
      await updateUser({
        id: userData._id,
        password: hashedPassword,
      } as any)

      toast.dismiss(loadingToast)
      toast.success('Password changed successfully!')

      // Reset password form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error changing password:', error)
      toast.error('Failed to change password. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'mentor': return 'bg-green-100 text-green-800'
      case 'siswa': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />
      case 'mentor': return <Briefcase className="h-4 w-4" />
      case 'siswa': return <GraduationCap className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading account settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl">
                {userData.name.charAt(0).toUpperCase()}
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{userData.name}</h2>
              <p className="text-muted-foreground">{userData.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getRoleBadgeColor(userData.role)}>
                  <span className="flex items-center gap-1">
                    {getRoleIcon(userData.role)}
                    {userData.role}
                  </span>
                </Badge>
                {userData.emailVerified && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            {/* Stats (role-specific) */}
            <div className="hidden md:flex gap-6">
              {userData.role === 'mentor' && (
                <>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userData.rating || 5.0}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userData.totalStudents || 0}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                </>
              )}
              {userData.role === 'siswa' && (
                <div className="text-center">
                  <p className="text-2xl font-bold">{userData.level || 'Beginner'}</p>
                  <p className="text-xs text-muted-foreground">Level</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Settings Tab */}
        <TabsContent value="profile">
          <form onSubmit={handleProfileUpdate}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        placeholder="+62812345678"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileForm.location || ''}
                        onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                        placeholder="Jakarta, Indonesia"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Role-specific sections */}
                {userData.role === 'mentor' && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Professional Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={mentorForm.company}
                          onChange={(e) => setMentorForm({...mentorForm, company: e.target.value})}
                          placeholder="Your company name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                          id="experience"
                          type="number"
                          value={mentorForm.experienceYears}
                          onChange={(e) => setMentorForm({...mentorForm, experienceYears: parseInt(e.target.value) || 0})}
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Skills</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {mentorForm.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                        {mentorForm.skills.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No skills added yet
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="linkedin">
                          <Linkedin className="h-4 w-4 inline mr-1" />
                          LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          value={mentorForm.linkedin}
                          onChange={(e) => setMentorForm({...mentorForm, linkedin: e.target.value})}
                          placeholder="linkedin.com/in/username"
                        />
                      </div>

                      <div>
                        <Label htmlFor="github">
                          <Github className="h-4 w-4 inline mr-1" />
                          GitHub
                        </Label>
                        <Input
                          id="github"
                          value={mentorForm.github}
                          onChange={(e) => setMentorForm({...mentorForm, github: e.target.value})}
                          placeholder="github.com/username"
                        />
                      </div>

                      <div>
                        <Label htmlFor="portfolio">
                          <Globe className="h-4 w-4 inline mr-1" />
                          Portfolio
                        </Label>
                        <Input
                          id="portfolio"
                          value={mentorForm.portfolio}
                          onChange={(e) => setMentorForm({...mentorForm, portfolio: e.target.value})}
                          placeholder="yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {userData.role === 'siswa' && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Learning Information
                    </h3>

                    <div>
                      <Label htmlFor="level">Current Level</Label>
                      <Select value={studentForm.level} onValueChange={(value) => setStudentForm({...studentForm, level: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Interests</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {studentForm.interests.map((interest, idx) => (
                          <Badge key={idx} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                        {studentForm.interests.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No interests added yet
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Study Goals</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {studentForm.studyGoals.map((goal, idx) => (
                          <Badge key={idx} variant="outline">
                            {goal}
                          </Badge>
                        ))}
                        {studentForm.studyGoals.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No study goals added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Change Password
                  </h3>

                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={passwordLoading} variant="default">
                    {passwordLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Account Information */}
              <div className="mt-8 pt-8 border-t space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Account Information
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Created:</span>
                    <span className="font-medium">
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">
                      {new Date(userData.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Type:</span>
                    <Badge className={getRoleBadgeColor(userData.role)}>
                      {userData.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
