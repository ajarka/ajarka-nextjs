'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  User, 
  Star,
  ChevronRight,
  ChevronLeft,
  Code,
  Eye,
  Target,
  Award,
  Lightbulb,
  Brain,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'
import CourseMaterialViewer from '@/components/dashboard/course-material-viewer'
import InteractiveLearningPath from '@/components/dashboard/interactive-learning-path'

interface Course {
  id: string
  title: string
  description: string
  price: number
  duration: string
  level: string
  category: string
  thumbnail: string
  mentorId: number
  syllabus: string[]
  totalLessons: number
  enrolledStudents: number
  rating: number
}

interface LearningMaterial {
  id: string
  title: string
  category: string
  subcategory: string
  level: number
  prerequisites: string[]
  estimatedHours: number
  meetingsRequired: number
  description: string
  learningObjectives: string[]
  resources: Array<{
    type: string
    title: string
    url?: string
    content?: string
    duration?: number
  }>
  isActive: boolean
  createdAt: string
}

interface StudentProgress {
  courseId: string
  studentId: number
  completedMaterials: string[]
  totalMaterials: number
  progressPercentage: number
  lastAccessedAt: string
  timeSpent: number
  currentMaterialId?: string
}

export default function CoursePage() {
  const params = useParams()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [materials, setMaterials] = useState<LearningMaterial[]>([])
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null)
  const [currentMaterial, setCurrentMaterial] = useState<LearningMaterial | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (courseId) {
      fetchCourseData()
    }
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      
      // Fetch course details
      const courseResponse = await fetch(`http://localhost:3001/courses/${courseId}`)
      if (courseResponse.ok) {
        const courseData = await courseResponse.json()
        setCourse(courseData)
        
        // Fetch learning materials based on course category
        const materialsResponse = await fetch(`http://localhost:3001/learning_materials`)
        const materialsData = await materialsResponse.json()
        
        // Filter materials based on course category
        const categoryKey = courseData.category.toLowerCase().includes('frontend') ? 'frontend' : 
                          courseData.category.toLowerCase().includes('backend') ? 'backend' : 
                          courseData.category.toLowerCase().includes('fullstack') ? 'fullstack' : 'frontend'
        
        const filteredMaterials = materialsData.filter((material: LearningMaterial) => 
          material.category === categoryKey && material.isActive
        ).sort((a: LearningMaterial, b: LearningMaterial) => a.level - b.level)
        
        setMaterials(filteredMaterials)
        
        // Set first material as current
        if (filteredMaterials.length > 0) {
          setCurrentMaterial(filteredMaterials[0])
        }
        
        // Fetch student progress (mock for now - in real app, get from session)
        const mockProgress: StudentProgress = {
          courseId: courseId,
          studentId: 3, // Mock student ID
          completedMaterials: filteredMaterials.slice(0, Math.floor(filteredMaterials.length * 0.4)).map(m => m.id),
          totalMaterials: filteredMaterials.length,
          progressPercentage: Math.floor(filteredMaterials.length * 0.4 / filteredMaterials.length * 100),
          lastAccessedAt: new Date().toISOString(),
          timeSpent: 1200, // minutes
          currentMaterialId: filteredMaterials[Math.floor(filteredMaterials.length * 0.4)]?.id
        }
        setStudentProgress(mockProgress)
      }
    } catch (error) {
      console.error('Error fetching course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMaterialSelect = (material: LearningMaterial) => {
    setCurrentMaterial(material)
    setActiveTab('content')
  }

  const markMaterialComplete = async (materialId: string) => {
    if (!studentProgress) return
    
    const updatedProgress = {
      ...studentProgress,
      completedMaterials: [...studentProgress.completedMaterials, materialId],
      progressPercentage: Math.floor(
        (studentProgress.completedMaterials.length + 1) / studentProgress.totalMaterials * 100
      )
    }
    setStudentProgress(updatedProgress)
  }

  const getNextMaterial = () => {
    if (!currentMaterial || !materials) return null
    const currentIndex = materials.findIndex(m => m.id === currentMaterial.id)
    return currentIndex < materials.length - 1 ? materials[currentIndex + 1] : null
  }

  const getPrevMaterial = () => {
    if (!currentMaterial || !materials) return null
    const currentIndex = materials.findIndex(m => m.id === currentMaterial.id)
    return currentIndex > 0 ? materials[currentIndex - 1] : null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full lg:w-64 h-48 object-cover rounded-xl"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
              <p className="text-lg opacity-90 mb-4">{course.description}</p>
              <div className="flex flex-wrap gap-4 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Target className="w-4 h-4 mr-1" />
                  {course.level}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <User className="w-4 h-4 mr-1" />
                  {course.enrolledStudents} students
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Star className="w-4 h-4 mr-1" />
                  {course.rating}
                </Badge>
              </div>
              {studentProgress && (
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Your Progress</span>
                    <span className="font-bold">{studentProgress.progressPercentage}%</span>
                  </div>
                  <Progress value={studentProgress.progressPercentage} className="h-3" />
                  <p className="text-sm opacity-80 mt-2">
                    {studentProgress.completedMaterials.length} of {studentProgress.totalMaterials} materials completed
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Course Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="path" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Learning Path
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Progress
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.syllabus.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Quick Start Materials
                </CardTitle>
                <CardDescription>
                  Jump into the most essential materials to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.slice(0, 6).map((material) => (
                    <Card 
                      key={material.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleMaterialSelect(material)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            Level {material.level}
                          </Badge>
                          {studentProgress?.completedMaterials.includes(material.id) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <h4 className="font-semibold text-sm mb-2">{material.title}</h4>
                        <p className="text-xs text-gray-600 mb-3">{material.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{material.estimatedHours}h</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="content">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Materials Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Materials</CardTitle>
                  <CardDescription>
                    {materials.length} lessons available
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {materials.map((material, index) => (
                      <div
                        key={material.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                          currentMaterial?.id === material.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => handleMaterialSelect(material)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {studentProgress?.completedMaterials.includes(material.id) ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{material.title}</p>
                            <p className="text-xs text-gray-500">{material.estimatedHours}h • Level {material.level}</p>
                          </div>
                          <Badge variant="outline" size="sm">
                            {index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Material Content */}
            <div className="lg:col-span-3">
              {currentMaterial ? (
                <CourseMaterialViewer
                  material={currentMaterial}
                  isCompleted={studentProgress?.completedMaterials.includes(currentMaterial.id) || false}
                  onComplete={() => markMaterialComplete(currentMaterial.id)}
                  onNext={() => {
                    const next = getNextMaterial()
                    if (next) setCurrentMaterial(next)
                  }}
                  onPrevious={() => {
                    const prev = getPrevMaterial()
                    if (prev) setCurrentMaterial(prev)
                  }}
                  hasNext={!!getNextMaterial()}
                  hasPrevious={!!getPrevMaterial()}
                />
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a Material</h3>
                    <p className="text-gray-600">Choose a material from the sidebar to get started</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Learning Path Tab */}
        <TabsContent value="path">
          <InteractiveLearningPath
            materials={materials}
            completedMaterials={studentProgress?.completedMaterials || []}
            currentMaterialId={currentMaterial?.id}
            onMaterialSelect={handleMaterialSelect}
          />
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {studentProgress && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Your Learning Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {studentProgress.progressPercentage}%
                      </div>
                      <p className="text-gray-600">Course Progress</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {Math.floor(studentProgress.timeSpent / 60)}h
                      </div>
                      <p className="text-gray-600">Time Spent</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {studentProgress.completedMaterials.length}
                      </div>
                      <p className="text-gray-600">Materials Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completed Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {materials
                      .filter(m => studentProgress.completedMaterials.includes(m.id))
                      .map(material => (
                        <div key={material.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div className="flex-1">
                            <h4 className="font-medium">{material.title}</h4>
                            <p className="text-sm text-gray-600">Level {material.level} • {material.estimatedHours}h</p>
                          </div>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}