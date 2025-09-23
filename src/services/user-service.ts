'use client'

import { BaseService } from './base/base-service'
import type { Id } from '../../convex/_generated/dataModel'

/**
 * User Service - Service Layer Pattern Implementation
 * Supports both Convex and REST API backends
 */

export interface User {
  _id: Id<"users">
  email: string
  name: string
  password?: string
  role: "admin" | "mentor" | "siswa"
  avatar?: string
  phone?: string
  provider?: string
  emailVerified?: boolean

  // Mentor specific fields
  bio?: string
  skills?: string[]
  rating?: number
  totalStudents?: number

  // Student specific fields
  level?: string
  interests?: string[]

  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  email: string
  name: string
  password?: string
  role: "admin" | "mentor" | "siswa"
  avatar?: string
  phone?: string
  provider?: string
  emailVerified?: boolean
  bio?: string
  skills?: string[]
  rating?: number
  totalStudents?: number
  level?: string
  interests?: string[]
}

export interface UpdateUserRequest {
  name?: string
  avatar?: string
  phone?: string
  emailVerified?: boolean
  bio?: string
  skills?: string[]
  rating?: number
  totalStudents?: number
  level?: string
  interests?: string[]
}

export class UserService extends BaseService {
  // ==================== QUERY METHODS ====================

  /**
   * Get all users
   */
  static useAllUsers() {
    return this.useQuery<User[]>('users.getAll')
  }

  /**
   * Get user by ID
   */
  static useUserById(id: Id<"users">) {
    return this.useQuery<User | null>('users.getById', { id })
  }

  /**
   * Get user by email
   */
  static useUserByEmail(email: string) {
    return this.useQuery<User | null>('users.getByEmail', { email })
  }

  /**
   * Get users by role
   */
  static useUsersByRole(role: "admin" | "mentor" | "siswa") {
    return this.useQuery<User[]>('users.getByRole', { role })
  }

  /**
   * Get all mentors
   */
  static useMentors() {
    return this.useQuery<User[]>('users.getMentors')
  }

  /**
   * Get all students
   */
  static useStudents() {
    return this.useQuery<User[]>('users.getStudents')
  }

  // ==================== MUTATION METHODS ====================

  /**
   * Create new user
   */
  static useCreateUser() {
    return this.useMutation<Id<"users">>('users.create', {
      onSuccess: (userId) => {
        console.log('User created successfully:', userId)
      },
      onError: (error) => {
        console.error('Failed to create user:', error)
      }
    })
  }

  /**
   * Update user
   */
  static useUpdateUser() {
    return this.useMutation<Id<"users">>('users.update', {
      onSuccess: (userId) => {
        console.log('User updated successfully:', userId)
      },
      onError: (error) => {
        console.error('Failed to update user:', error)
      }
    })
  }

  /**
   * Delete user
   */
  static useDeleteUser() {
    return this.useMutation<{ success: boolean }>('users.remove', {
      onSuccess: () => {
        console.log('User deleted successfully')
      },
      onError: (error) => {
        console.error('Failed to delete user:', error)
      }
    })
  }

  /**
   * Update mentor statistics
   */
  static useUpdateMentorStats() {
    return this.useMutation<Id<"users">>('users.updateMentorStats', {
      onSuccess: (mentorId) => {
        console.log('Mentor stats updated:', mentorId)
      },
      onError: (error) => {
        console.error('Failed to update mentor stats:', error)
      }
    })
  }

  /**
   * Verify user email
   */
  static useVerifyEmail() {
    return this.useMutation<Id<"users">>('users.verifyEmail', {
      onSuccess: (userId) => {
        console.log('Email verified for user:', userId)
      },
      onError: (error) => {
        console.error('Failed to verify email:', error)
      }
    })
  }

  // ==================== BUSINESS LOGIC METHODS ====================

  /**
   * Create user with validation
   */
  static async createUserWithValidation(userData: CreateUserRequest): Promise<Id<"users">> {
    // Client-side validation
    if (!userData.email || !userData.email.includes('@')) {
      throw new Error('Valid email is required')
    }

    if (!userData.name || userData.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long')
    }

    if (!userData.role) {
      throw new Error('User role is required')
    }

    // Additional validation for mentors
    if (userData.role === 'mentor') {
      if (!userData.bio || userData.bio.trim().length < 10) {
        throw new Error('Mentor bio must be at least 10 characters long')
      }

      if (!userData.skills || userData.skills.length === 0) {
        throw new Error('Mentor must have at least one skill')
      }
    }

    // Create user via mutation
    const createUserMutation = this.useCreateUser()
    return await createUserMutation(userData)
  }

  /**
   * Get active mentors (with high rating)
   */
  static useActiveMentors() {
    const mentors = this.useMentors()
    return mentors?.filter(mentor =>
      mentor.rating && mentor.rating >= 4.0
    ) ?? []
  }

  /**
   * Get mentor by skills
   */
  static useMentorsBySkills(requiredSkills: string[]) {
    const mentors = this.useMentors()

    return mentors?.filter(mentor => {
      if (!mentor.skills) return false

      return requiredSkills.some(skill =>
        mentor.skills!.some(mentorSkill =>
          mentorSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    }) ?? []
  }

  /**
   * Search users by name or email
   */
  static useSearchUsers(searchTerm: string) {
    const users = this.useAllUsers()

    if (!searchTerm || !users) return []

    const term = searchTerm.toLowerCase()
    return users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    )
  }

  /**
   * Get user statistics
   */
  static useUserStats() {
    const users = this.useAllUsers()

    if (!users) return null

    const stats = {
      totalUsers: users.length,
      totalMentors: users.filter(u => u.role === 'mentor').length,
      totalStudents: users.filter(u => u.role === 'siswa').length,
      totalAdmins: users.filter(u => u.role === 'admin').length,
      verifiedUsers: users.filter(u => u.emailVerified).length,
      averageMentorRating: 0
    }

    const mentorsWithRating = users.filter(u => u.role === 'mentor' && u.rating)
    if (mentorsWithRating.length > 0) {
      stats.averageMentorRating = mentorsWithRating.reduce((sum, mentor) =>
        sum + (mentor.rating || 0), 0
      ) / mentorsWithRating.length
    }

    return stats
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if current provider is Convex
   */
  static isUsingConvex(): boolean {
    return this.isConvexProvider()
  }

  /**
   * Get provider info for debugging
   */
  static getProviderInfo() {
    return {
      provider: this.getCurrentProvider(),
      isConvex: this.isConvexProvider(),
      isRest: this.isRestProvider()
    }
  }

  /**
   * Format user display name
   */
  static formatUserDisplayName(user: User): string {
    if (user.role === 'mentor') {
      return `${user.name} (Mentor)`
    } else if (user.role === 'admin') {
      return `${user.name} (Admin)`
    }
    return user.name
  }

  /**
   * Get user avatar URL with fallback
   */
  static getUserAvatarUrl(user: User): string {
    if (user.avatar) return user.avatar

    // Fallback to gravatar or default based on role
    const defaultAvatars = {
      mentor: '/avatars/default-mentor.png',
      siswa: '/avatars/default-student.png',
      admin: '/avatars/default-admin.png'
    }

    return defaultAvatars[user.role] || '/avatars/default-user.png'
  }
}