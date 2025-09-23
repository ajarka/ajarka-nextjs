'use client'

import { BaseService } from './base/base-service'
import type { Id } from '../../convex/_generated/dataModel'

/**
 * Course Service - Real Implementation using Convex
 * Replaces existing course management with Service Layer Pattern
 */

export interface Course {
  _id: Id<"courses">
  title: string
  description: string
  price: number
  duration: string
  level: "Beginner" | "Intermediate" | "Advanced"
  category: string
  mentorId: Id<"users">
  syllabus: string[]
  thumbnail?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCourseRequest {
  title: string
  description: string
  price: number
  duration: string
  level: "Beginner" | "Intermediate" | "Advanced"
  category: string
  mentorId: Id<"users">
  syllabus: string[]
  thumbnail?: string
  isActive?: boolean
}

export interface UpdateCourseRequest {
  title?: string
  description?: string
  price?: number
  duration?: string
  level?: "Beginner" | "Intermediate" | "Advanced"
  category?: string
  syllabus?: string[]
  thumbnail?: string
  isActive?: boolean
}

export class CourseService extends BaseService {
  // ==================== QUERY METHODS ====================

  /**
   * Get all courses
   */
  static useAllCourses() {
    return this.useQuery<Course[]>('courses.getAll')
  }

  /**
   * Get course by ID
   */
  static useCourseById(id: Id<"courses">) {
    return this.useQuery<Course | null>('courses.getById', { id })
  }

  /**
   * Get courses by category
   */
  static useCoursesByCategory(category: string) {
    return this.useQuery<Course[]>('courses.getByCategory', { category })
  }

  /**
   * Get courses by mentor
   */
  static useCoursesByMentor(mentorId: Id<"users">) {
    return this.useQuery<Course[]>('courses.getByMentor', { mentorId })
  }

  /**
   * Get courses by level
   */
  static useCoursesByLevel(level: "Beginner" | "Intermediate" | "Advanced") {
    return this.useQuery<Course[]>('courses.getByLevel', { level })
  }

  /**
   * Get active courses only
   */
  static useActiveCourses() {
    return this.useQuery<Course[]>('courses.getActiveCourses')
  }

  // ==================== MUTATION METHODS ====================

  /**
   * Create new course
   */
  static useCreateCourse() {
    return this.useMutation<Id<"courses">>('courses.create', {
      onSuccess: (courseId) => {
        console.log('Course created successfully:', courseId)
      },
      onError: (error) => {
        console.error('Failed to create course:', error)
      }
    })
  }

  /**
   * Update course
   */
  static useUpdateCourse() {
    return this.useMutation<Id<"courses">>('courses.update', {
      onSuccess: (courseId) => {
        console.log('Course updated successfully:', courseId)
      },
      onError: (error) => {
        console.error('Failed to update course:', error)
      }
    })
  }

  /**
   * Delete course
   */
  static useDeleteCourse() {
    return this.useMutation<{ success: boolean }>('courses.remove', {
      onSuccess: () => {
        console.log('Course deleted successfully')
      },
      onError: (error) => {
        console.error('Failed to delete course:', error)
      }
    })
  }

  /**
   * Toggle course active status
   */
  static useToggleCourseActive() {
    return this.useMutation<Id<"courses">>('courses.toggleActive', {
      onSuccess: (courseId) => {
        console.log('Course status toggled:', courseId)
      },
      onError: (error) => {
        console.error('Failed to toggle course status:', error)
      }
    })
  }

  // ==================== BUSINESS LOGIC METHODS ====================

  /**
   * Create course with validation
   */
  static async createCourseWithValidation(courseData: CreateCourseRequest): Promise<Id<"courses">> {
    // Client-side validation
    if (!courseData.title || courseData.title.trim().length < 3) {
      throw new Error('Course title must be at least 3 characters long')
    }

    if (!courseData.description || courseData.description.trim().length < 10) {
      throw new Error('Course description must be at least 10 characters long')
    }

    if (!courseData.price || courseData.price <= 0) {
      throw new Error('Course price must be greater than 0')
    }

    if (!courseData.category || courseData.category.trim().length === 0) {
      throw new Error('Course category is required')
    }

    if (!courseData.syllabus || courseData.syllabus.length === 0) {
      throw new Error('Course must have at least one syllabus item')
    }

    // Create course via mutation
    const createCourseMutation = this.useCreateCourse()
    return await createCourseMutation(courseData)
  }

  /**
   * Get courses by price range
   */
  static useCoursesByPriceRange(minPrice: number, maxPrice: number) {
    const courses = this.useAllCourses()
    return courses?.filter(course =>
      course.price >= minPrice && course.price <= maxPrice
    ) ?? []
  }

  /**
   * Search courses by title or description
   */
  static useSearchCourses(searchTerm: string) {
    const courses = this.useAllCourses()

    if (!searchTerm || !courses) return []

    const term = searchTerm.toLowerCase()
    return courses.filter(course =>
      course.title.toLowerCase().includes(term) ||
      course.description.toLowerCase().includes(term) ||
      course.category.toLowerCase().includes(term)
    )
  }

  /**
   * Get featured courses (highest price and advanced level)
   */
  static useFeaturedCourses() {
    const courses = this.useActiveCourses()
    return courses?.filter(course =>
      course.level === 'Advanced' && course.price >= 250000
    ).slice(0, 6) ?? []
  }

  /**
   * Get courses statistics
   */
  static useCoursesStats() {
    const courses = this.useAllCourses()

    if (!courses) return null

    const stats = {
      totalCourses: courses.length,
      activeCourses: courses.filter(c => c.isActive).length,
      beginnerCourses: courses.filter(c => c.level === 'Beginner').length,
      intermediateCourses: courses.filter(c => c.level === 'Intermediate').length,
      advancedCourses: courses.filter(c => c.level === 'Advanced').length,
      averagePrice: 0,
      totalCategories: 0,
      priceRange: { min: 0, max: 0 }
    }

    if (courses.length > 0) {
      stats.averagePrice = courses.reduce((sum, course) => sum + course.price, 0) / courses.length

      const prices = courses.map(c => c.price)
      stats.priceRange.min = Math.min(...prices)
      stats.priceRange.max = Math.max(...prices)

      const categories = new Set(courses.map(c => c.category))
      stats.totalCategories = categories.size
    }

    return stats
  }

  /**
   * Get courses grouped by category
   */
  static useCoursesGroupedByCategory() {
    const courses = this.useActiveCourses()

    if (!courses) return {}

    return courses.reduce((grouped, course) => {
      const category = course.category
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(course)
      return grouped
    }, {} as Record<string, Course[]>)
  }

  /**
   * Get recommended courses for user
   */
  static useRecommendedCourses(userLevel?: string, userInterests?: string[]) {
    const courses = this.useActiveCourses()

    if (!courses) return []

    let recommended = courses

    // Filter by user level
    if (userLevel) {
      const levelMapping = {
        'beginner': 'Beginner',
        'intermediate': 'Intermediate',
        'advanced': 'Advanced'
      }

      const targetLevel = levelMapping[userLevel as keyof typeof levelMapping]
      if (targetLevel) {
        recommended = recommended.filter(course => course.level === targetLevel)
      }
    }

    // Filter by user interests
    if (userInterests && userInterests.length > 0) {
      recommended = recommended.filter(course =>
        userInterests.some(interest =>
          course.category.toLowerCase().includes(interest.toLowerCase()) ||
          course.title.toLowerCase().includes(interest.toLowerCase())
        )
      )
    }

    return recommended.slice(0, 8)
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Format course price in IDR
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  /**
   * Get course difficulty color
   */
  static getLevelColor(level: Course['level']): string {
    const colors = {
      'Beginner': 'text-green-600 bg-green-100',
      'Intermediate': 'text-yellow-600 bg-yellow-100',
      'Advanced': 'text-red-600 bg-red-100'
    }
    return colors[level] || 'text-gray-600 bg-gray-100'
  }

  /**
   * Get course thumbnail with fallback
   */
  static getCourseThumbnail(course: Course): string {
    return course.thumbnail || '/images/course-placeholder.jpg'
  }

  /**
   * Calculate estimated completion time
   */
  static calculateEstimatedHours(syllabus: string[]): number {
    // Estimate 2 hours per syllabus item
    return syllabus.length * 2
  }
}