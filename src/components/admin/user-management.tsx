'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Users,
  Search,
  Trash2,
  Mail,
  Phone,
  Shield,
  GraduationCap,
  Briefcase,
  UserPlus,
  AlertTriangle
} from "lucide-react"
import Link from 'next/link'
import { Id } from "../../../convex/_generated/dataModel"
import { toast } from 'sonner'

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'mentor' | 'siswa'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{ id: Id<"users">, name: string, email: string } | null>(null)

  // Fetch all users from Convex
  const allUsers = useQuery(api.users.getAll)
  const deleteUser = useMutation(api.users.remove)

  // Filter users based on search and role
  const filteredUsers = allUsers?.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  // Count users by role
  const userStats = {
    total: allUsers?.length || 0,
    admins: allUsers?.filter(u => u.role === 'admin').length || 0,
    mentors: allUsers?.filter(u => u.role === 'mentor').length || 0,
    students: allUsers?.filter(u => u.role === 'siswa').length || 0,
  }

  const openDeleteDialog = (userId: Id<"users">, userName: string, userEmail: string) => {
    setUserToDelete({ id: userId, name: userName, email: userEmail })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    const loadingToast = toast.loading('Deleting user...')

    try {
      await deleteUser({ id: userToDelete.id })

      toast.dismiss(loadingToast)
      toast.success(
        <div className="space-y-1">
          <p className="font-semibold">User deleted successfully!</p>
          <p className="text-sm text-muted-foreground">
            {userToDelete.name} ({userToDelete.email}) has been removed
          </p>
        </div>,
        { duration: 5000 }
      )

      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error deleting user:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user. Please try again.'
      toast.error(errorMessage)
    }
  }

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
      default: return <Users className="h-4 w-4" />
    }
  }

  if (!allUsers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          User Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage all users, mentors, and students in the platform
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{userStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{userStats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mentors</p>
                <p className="text-2xl font-bold">{userStats.mentors}</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold">{userStats.students}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/tambah-mentor">
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Mentor
          </Button>
        </Link>
        <Link href="/dashboard/tambah-siswa">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Student
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Search and filter users by name, email, or role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="siswa">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User List */}
          <div className="space-y-3">
            {filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Card key={user._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{user.name}</h3>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              <span className="flex items-center gap-1">
                                {getRoleIcon(user.role)}
                                {user.role}
                              </span>
                            </Badge>
                            {user.emailVerified && (
                              <Badge variant="outline" className="text-green-600">
                                Verified
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {user.phone}
                              </div>
                            )}
                          </div>

                          {/* Role-specific info */}
                          {user.role === 'mentor' && user.skills && (
                            <div className="flex flex-wrap gap-1">
                              {user.skills.slice(0, 5).map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {user.skills.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{user.skills.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {user.role === 'siswa' && user.interests && (
                            <div className="flex flex-wrap gap-1">
                              {user.interests.slice(0, 3).map((interest, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                              {user.interests.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{user.interests.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(user._id, user.name, user.email)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your search criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4">
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
            {userToDelete && (
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Name:</span>
                  <span>{userToDelete.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Email:</span>
                  <span>{userToDelete.email}</span>
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
