'use client'

import React, { useState } from 'react'
import { CourseService } from '@/services/course-service'
import { UserService } from '@/services/user-service'
import { toast } from 'react-hot-toast'

/**
 * Courses Page - Real Implementation using Convex
 * Demonstrates main application feature with Service Layer Pattern
 */
export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all')

  // Using CourseService with Convex
  const courses = CourseService.useActiveCourses()
  const searchResults = CourseService.useSearchCourses(searchTerm)
  const courseStats = CourseService.useCoursesStats()
  const featuredCourses = CourseService.useFeaturedCourses()
  const coursesByCategory = CourseService.useCoursesGroupedByCategory()

  // Get mentors for course details
  const mentors = UserService.useMentors()

  // Get mentor name by ID
  const getMentorName = (mentorId: string) => {
    const mentor = mentors?.find(m => m._id === mentorId)
    return mentor?.name || 'Unknown Mentor'
  }

  // Filter courses based on selection
  const filteredCourses = React.useMemo(() => {
    let filtered = searchTerm ? searchResults : courses || []

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course =>
        course.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel)
    }

    return filtered
  }, [courses, searchResults, searchTerm, selectedCategory, selectedLevel])

  // Get unique categories
  const categories = React.useMemo(() => {
    if (!courses) return []
    const uniqueCategories = Array.from(new Set(courses.map(c => c.category)))
    return uniqueCategories
  }, [courses])

  const handleEnrollCourse = (courseId: string, courseName: string) => {
    toast.success(`Enrolled in "${courseName}"! (Demo mode)`)
    console.log('Enroll course:', courseId)
  }

  if (!courses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses from Convex...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Our Courses
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn from industry experts and advance your coding skills with our comprehensive courses
          </p>
        </div>

        {/* Provider Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900">🚀 Powered by Convex Database</h3>
              <p className="text-sm text-green-700">Real-time data, instant updates, optimized performance</p>
            </div>
            <div className="text-sm text-green-700">
              <span className="font-mono bg-green-100 px-2 py-1 rounded">
                Provider: {CourseService.getCurrentProvider()}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {courseStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Courses</h3>
              <p className="text-3xl font-bold text-gray-900">{courseStats.activeCourses}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Average Price</h3>
              <p className="text-3xl font-bold text-blue-600">
                {CourseService.formatPrice(courseStats.averagePrice)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
              <p className="text-3xl font-bold text-green-600">{courseStats.totalCategories}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Price Range</h3>
              <p className="text-lg font-bold text-purple-600">
                {CourseService.formatPrice(courseStats.priceRange.min)} - {CourseService.formatPrice(courseStats.priceRange.max)}
              </p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <input
                type="text"
                placeholder="Search by title, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredCourses.length} of {courses.length} courses
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedLevel('all')
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Featured Courses */}
        {featuredCourses && featuredCourses.length > 0 && !searchTerm && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Featured Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCourses.slice(0, 3).map((course) => (
                <div key={course._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-6xl">🚀</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        {CourseService.formatPrice(course.price)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${CourseService.getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center">
                <img
                  src={CourseService.getCourseThumbnail(course)}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="60">📚</text></svg>'
                  }}
                />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{course.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${CourseService.getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-16">Mentor:</span>
                    <span className="font-medium">{getMentorName(course.mentorId)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-16">Duration:</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-16">Category:</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{course.category}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">
                      {CourseService.formatPrice(course.price)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEnrollCourse(course._id, course.title)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search criteria or clear the filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedLevel('all')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}