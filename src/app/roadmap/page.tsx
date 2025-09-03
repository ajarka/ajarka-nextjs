'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Code2, 
  Database, 
  Globe, 
  Smartphone, 
  Server, 
  Cloud,
  BookOpen,
  Clock,
  Users,
  Star,
  ChevronRight,
  Play,
  CheckCircle,
  Circle,
  Target,
  Award,
  TrendingUp,
  Zap,
  ArrowRight,
  PlayCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { learningService, type LearningJourney, type LearningMaterial, type StudentProgress } from '@/lib/learning-service'
import { useSession } from 'next-auth/react'

export default function RoadmapPage() {
  const { data: session } = useSession()
  const [journeys, setJourneys] = useState<LearningJourney[]>([])
  const [materials, setMaterials] = useState<LearningMaterial[]>([])
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([])
  const [selectedJourney, setSelectedJourney] = useState<LearningJourney | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [session])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [journeysData, materialsData] = await Promise.all([
        learningService.getLearningJourneys(),
        learningService.getLearningMaterials()
      ])

      setJourneys(journeysData)
      setMaterials(materialsData)

      // Fetch student progress if logged in
      if (session?.user?.id) {
        const progressData = await learningService.getStudentProgress(parseInt(session.user.id))
        setStudentProgress(progressData)
      }
    } catch (error) {
      console.error('Failed to fetch roadmap data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getJourneyProgress = (journeyId: string) => {
    if (!session?.user?.id) return null
    return studentProgress.find(p => p.journeyId === journeyId)
  }

  const getJourneyIcon = (category: string) => {
    switch (category) {
      case 'frontend': return Globe
      case 'backend': return Server
      case 'fullstack': return Code2
      case 'mobile': return Smartphone
      case 'devops': return Cloud
      case 'data': return Database
      default: return BookOpen
    }
  }

  const getJourneyColor = (category: string) => {
    switch (category) {
      case 'frontend': return 'bg-blue-500'
      case 'backend': return 'bg-green-500'
      case 'fullstack': return 'bg-purple-500'
      case 'mobile': return 'bg-orange-500'
      case 'devops': return 'bg-indigo-500'
      case 'data': return 'bg-pink-500'
      default: return 'bg-gray-500'
    }
  }

  const getMaterialsForPhase = (phaseData: any) => {
    return phaseData.materials
      .map((materialId: string) => materials.find(m => m.id === materialId))
      .filter(Boolean) as LearningMaterial[]
  }

  const calculatePhaseProgress = (journeyId: string, phaseId: string) => {
    const progress = getJourneyProgress(journeyId)
    if (!progress) return 0

    const journey = journeys.find(j => j.id === journeyId)
    const phase = journey?.phases.find(p => p.id === phaseId)
    if (!phase) return 0

    const phaseCompletedMaterials = phase.materials.filter(materialId => 
      progress.completedMaterials.includes(materialId)
    )
    
    return Math.round((phaseCompletedMaterials.length / phase.materials.length) * 100)
  }

  const startJourney = async (journeyId: string) => {
    if (!session?.user?.id) {
      alert('Please log in to start a learning journey')
      return
    }

    try {
      await learningService.startJourney(parseInt(session.user.id), journeyId)
      await fetchData() // Refresh data
      alert('Journey started successfully!')
    } catch (error) {
      console.error('Failed to start journey:', error)
      alert('Failed to start journey. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading learning journeys...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-6">
              Your Learning Journey Starts Here
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Structured, level-based learning paths with hands-on projects, assignments, and mentor guidance
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <PlayCircle className="mr-2" size={20} />
                Start Learning
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Target className="mr-2" size={20} />
                View All Paths
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Learning Journeys Grid */}
        <div className="mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Learning Journey</h2>
            <p className="text-lg text-gray-600">Structured paths with clear levels, projects, and verification systems</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {journeys.map((journey, index) => {
              const Icon = getJourneyIcon(journey.category)
              const progress = getJourneyProgress(journey.id)
              const progressPercentage = progress ? (progress.currentLevel / journey.totalLevels) * 100 : 0
              
              return (
                <motion.div
                  key={journey.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${getJourneyColor(journey.category)}`}>
                          <Icon className="text-white" size={24} />
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {journey.category}
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-xl mb-2">{journey.title}</CardTitle>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {journey.description}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Progress for logged-in users */}
                      {progress && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Your Progress</span>
                            <span className="font-medium">Level {progress.currentLevel} / {journey.totalLevels}</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{Math.round(progressPercentage)}% Complete</span>
                            <span>{progress.skillsAcquired.length} skills acquired</span>
                          </div>
                        </div>
                      )}

                      {/* Journey Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="text-gray-400" size={16} />
                          <span>{journey.estimatedDuration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="text-gray-400" size={16} />
                          <span>{journey.totalLevels} levels</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="text-gray-400" size={16} />
                          <span>{journey.phases.length} phases</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="text-gray-400" size={16} />
                          <span>{journey.skills.length} skills</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Skills You'll Learn:</p>
                        <div className="flex flex-wrap gap-1">
                          {journey.skills.slice(0, 4).map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {journey.skills.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{journey.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => setSelectedJourney(journey)}
                        >
                          <BookOpen className="mr-2" size={16} />
                          View Details
                        </Button>
                        
                        {progress ? (
                          <Button variant="outline" asChild>
                            <Link href="/dashboard">
                              <TrendingUp className="mr-2" size={16} />
                              Continue
                            </Link>
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            onClick={() => startJourney(journey.id)}
                            disabled={!session?.user?.id}
                          >
                            <Play className="mr-2" size={16} />
                            Start
                          </Button>
                        )}
                      </div>

                      {!session?.user?.id && (
                        <p className="text-xs text-center text-gray-500">
                          <Link href="/auth/signin" className="text-blue-600 hover:underline">
                            Sign in
                          </Link> to start your journey
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Journey Detail Modal */}
        {selectedJourney && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedJourney.title}</h2>
                    <p className="text-gray-600">{selectedJourney.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedJourney(null)}
                  >
                    ×
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Journey Overview */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="mx-auto mb-2 text-blue-600" size={32} />
                    <p className="font-semibold">{selectedJourney.estimatedDuration}</p>
                    <p className="text-sm text-gray-600">Total Duration</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Target className="mx-auto mb-2 text-green-600" size={32} />
                    <p className="font-semibold">{selectedJourney.totalLevels} Levels</p>
                    <p className="text-sm text-gray-600">Progressive Learning</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Award className="mx-auto mb-2 text-purple-600" size={32} />
                    <p className="font-semibold">{selectedJourney.skills.length} Skills</p>
                    <p className="text-sm text-gray-600">Professional Skills</p>
                  </div>
                </div>

                {/* Learning Phases */}
                <div>
                  <h3 className="text-xl font-bold mb-6">Learning Phases</h3>
                  <div className="space-y-6">
                    {selectedJourney.phases.map((phase, phaseIndex) => {
                      const phaseMaterials = getMaterialsForPhase(phase)
                      const phaseProgress = calculatePhaseProgress(selectedJourney.id, phase.id)
                      
                      return (
                        <div key={phase.id} className="border rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-semibold mb-2">
                                Phase {phaseIndex + 1}: {phase.title}
                              </h4>
                              <p className="text-gray-600 mb-3">{phase.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Duration: {phase.estimatedDuration}</span>
                                <span>Levels: {phase.levels[0]} - {phase.levels[1]}</span>
                                <span>Materials: {phaseMaterials.length}</span>
                              </div>
                            </div>
                            <Badge variant="outline">
                              Level {phase.levels[0]}-{phase.levels[1]}
                            </Badge>
                          </div>

                          {/* Phase Progress */}
                          {phaseProgress > 0 && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Your Progress</span>
                                <span>{phaseProgress}%</span>
                              </div>
                              <Progress value={phaseProgress} className="h-2" />
                            </div>
                          )}

                          {/* Phase Materials */}
                          <div className="space-y-3">
                            <h5 className="font-medium">Learning Materials</h5>
                            <div className="grid gap-3">
                              {phaseMaterials.map((material, materialIndex) => {
                                const isCompleted = getJourneyProgress(selectedJourney.id)?.completedMaterials.includes(material.id)
                                
                                return (
                                  <div key={material.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                      {isCompleted ? (
                                        <CheckCircle className="text-green-500" size={20} />
                                      ) : (
                                        <Circle className="text-gray-400" size={20} />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <h6 className="font-medium text-sm">{material.title}</h6>
                                      <p className="text-xs text-gray-600 mt-1">{material.description}</p>
                                      <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs">
                                          Level {material.level}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                          {material.estimatedHours}h
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                          {material.meetingsRequired} meetings
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {material.difficulty}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Action Section */}
                <div className="border-t pt-6">
                  <div className="flex justify-center gap-4">
                    {getJourneyProgress(selectedJourney.id) ? (
                      <Button size="lg" asChild>
                        <Link href="/dashboard">
                          <TrendingUp className="mr-2" size={20} />
                          Continue Learning
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button 
                          size="lg" 
                          onClick={() => startJourney(selectedJourney.id)}
                          disabled={!session?.user?.id}
                        >
                          <PlayCircle className="mr-2" size={20} />
                          Start This Journey
                        </Button>
                        {!session?.user?.id && (
                          <Button size="lg" variant="outline" asChild>
                            <Link href="/auth/signin">
                              Sign In to Start
                            </Link>
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  
                  {!session?.user?.id && (
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Create an account to track your progress, submit assignments, and get verified!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Learning System?</h2>
            <p className="text-lg text-gray-600">Comprehensive features designed for effective learning</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                title: 'Level-Based Learning',
                description: 'Clear progression with 100 levels across different skill categories'
              },
              {
                icon: BookOpen,
                title: 'Structured Materials',
                description: 'Curated learning materials with prerequisites and clear objectives'
              },
              {
                icon: Award,
                title: 'Project Verification',
                description: 'Skip levels by demonstrating your skills through projects and videos'
              },
              {
                icon: Users,
                title: 'Mentor Guidance',
                description: 'Learn with experienced mentors who guide your journey'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="text-center h-full">
                  <CardContent className="pt-6">
                    <feature.icon className="mx-auto mb-4 text-blue-600" size={48} />
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}