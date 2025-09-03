'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Target, 
  Award, 
  PlayCircle, 
  FileText,
  ExternalLink,
  TrendingUp,
  Calendar,
  Zap
} from 'lucide-react'
import { learningService, type StudentProgress, type LearningJourney, type LearningMaterial } from '@/lib/learning-service'

interface StudentJourneyTrackerProps {
  studentId: number
}

export default function StudentJourneyTracker({ studentId }: StudentJourneyTrackerProps) {
  const [journeys, setJourneys] = useState<LearningJourney[]>([])
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([])
  const [nextMaterials, setNextMaterials] = useState<LearningMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJourney, setSelectedJourney] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [studentId])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [journeysData, progressData] = await Promise.all([
        learningService.getLearningJourneys(),
        learningService.getStudentProgress(studentId)
      ])

      setJourneys(journeysData)
      setStudentProgress(progressData)

      // Fetch next materials for active journeys
      const nextMaterialsPromises = progressData
        .filter(p => p.status === 'active')
        .map(p => learningService.getNextMaterials(studentId, p.journeyId))
      
      const allNextMaterials = await Promise.all(nextMaterialsPromises)
      setNextMaterials(allNextMaterials.flat())

    } catch (error) {
      console.error('Failed to fetch journey data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startJourney = async (journeyId: string) => {
    try {
      await learningService.startJourney(studentId, journeyId)
      await fetchData()
    } catch (error) {
      console.error('Failed to start journey:', error)
    }
  }

  const getJourneyProgress = (journeyId: string) => {
    return studentProgress.find(p => p.journeyId === journeyId)
  }

  const calculateOverallProgress = (journey: LearningJourney, progress: StudentProgress | undefined) => {
    if (!progress) return 0
    return Math.round((progress.currentLevel / journey.totalLevels) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'dropped': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCurrentPhase = (journey: LearningJourney, progress: StudentProgress | undefined) => {
    if (!progress) return journey.phases[0]
    return journey.phases.find(phase => phase.id === progress.currentPhase) || journey.phases[0]
  }

  if (isLoading) {
    return (
      <div className=\"p-6 space-y-6\">
        <div className=\"text-center py-8\">Loading your learning journey...</div>
      </div>
    )
  }

  return (
    <div className=\"p-6 space-y-6\">
      <div>
        <h1 className=\"text-3xl font-bold\">My Learning Journey</h1>
        <p className=\"text-muted-foreground\">Track your progress and continue learning</p>
      </div>

      {/* Active Journeys Overview */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <TrendingUp size={20} />
            Active Learning Journeys
          </CardTitle>
          <CardDescription>
            Continue your learning progress and see what's next
          </CardDescription>
        </CardHeader>
        <CardContent>
          {studentProgress.filter(p => p.status === 'active').length === 0 ? (
            <div className=\"text-center py-8\">
              <BookOpen className=\"mx-auto h-12 w-12 text-muted-foreground mb-4\" />
              <h3 className=\"text-lg font-medium mb-2\">No active journeys</h3>
              <p className=\"text-muted-foreground mb-4\">
                Start your first learning journey below!
              </p>
            </div>
          ) : (
            <div className=\"space-y-4\">
              {studentProgress.filter(p => p.status === 'active').map(progress => {
                const journey = journeys.find(j => j.id === progress.journeyId)
                if (!journey) return null

                const currentPhase = getCurrentPhase(journey, progress)
                const progressPercentage = calculateOverallProgress(journey, progress)

                return (
                  <div key={progress.id} className=\"p-4 border rounded-lg space-y-3\">
                    <div className=\"flex justify-between items-start\">
                      <div>
                        <h3 className=\"font-semibold\">{journey.title}</h3>
                        <p className=\"text-sm text-muted-foreground\">{journey.description}</p>
                      </div>
                      <Badge className={getStatusColor(progress.status)}>
                        {progress.status}
                      </Badge>
                    </div>

                    <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 text-sm\">
                      <div>
                        <span className=\"text-muted-foreground\">Current Level:</span>
                        <div className=\"font-medium\">{progress.currentLevel} / {journey.totalLevels}</div>
                      </div>
                      <div>
                        <span className=\"text-muted-foreground\">Current Phase:</span>
                        <div className=\"font-medium\">{currentPhase.title}</div>
                      </div>
                      <div>
                        <span className=\"text-muted-foreground\">Skills Acquired:</span>
                        <div className=\"font-medium\">{progress.skillsAcquired.length}</div>
                      </div>
                      <div>
                        <span className=\"text-muted-foreground\">Completed:</span>
                        <div className=\"font-medium\">{progress.completedMaterials.length} materials</div>
                      </div>
                    </div>

                    <div className=\"space-y-2\">
                      <div className=\"flex justify-between text-sm\">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className=\"w-full\" />
                    </div>

                    <div className=\"flex justify-between items-center\">
                      <div className=\"flex flex-wrap gap-1\">
                        {progress.skillsAcquired.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant=\"secondary\" className=\"text-xs\">
                            {skill}
                          </Badge>
                        ))}
                        {progress.skillsAcquired.length > 5 && (
                          <Badge variant=\"secondary\" className=\"text-xs\">
                            +{progress.skillsAcquired.length - 5} more
                          </Badge>
                        )}
                      </div>
                      <Button 
                        size=\"sm\" 
                        onClick={() => setSelectedJourney(selectedJourney === journey.id ? null : journey.id)}
                      >
                        {selectedJourney === journey.id ? 'Hide Details' : 'View Details'}
                      </Button>
                    </div>

                    {selectedJourney === journey.id && (
                      <div className=\"mt-4 pt-4 border-t space-y-4\">
                        {/* Recent Achievements */}
                        <div>
                          <h4 className=\"font-medium mb-2 flex items-center gap-2\">
                            <Award size={16} />
                            Recent Achievements
                          </h4>
                          <div className=\"space-y-2\">
                            {progress.completedAssignments.slice(-3).map((assignment, index) => (
                              <div key={index} className=\"flex items-center justify-between p-2 bg-muted rounded-lg\">
                                <div className=\"flex items-center gap-2\">
                                  <CheckCircle size={16} className=\"text-green-500\" />
                                  <span className=\"text-sm\">Assignment completed</span>
                                </div>
                                <div className=\"flex items-center gap-2\">
                                  <Badge variant=\"outline\">{assignment.score}%</Badge>
                                  <span className=\"text-xs text-muted-foreground\">
                                    {new Date(assignment.completedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {progress.completedProjects.slice(-2).map((project, index) => (
                              <div key={index} className=\"flex items-center justify-between p-2 bg-muted rounded-lg\">
                                <div className=\"flex items-center gap-2\">
                                  <Award size={16} className=\"text-blue-500\" />
                                  <span className=\"text-sm\">Project completed</span>
                                </div>
                                <div className=\"flex items-center gap-2\">
                                  <Badge variant=\"outline\">{project.score}%</Badge>
                                  <Button size=\"sm\" variant=\"outline\" asChild>
                                    <a href={project.liveUrl} target=\"_blank\" rel=\"noopener noreferrer\">
                                      <ExternalLink size={14} />
                                      View
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Current Phase Details */}
                        <div>
                          <h4 className=\"font-medium mb-2 flex items-center gap-2\">
                            <Target size={16} />
                            Current Phase: {currentPhase.title}
                          </h4>
                          <p className=\"text-sm text-muted-foreground mb-3\">{currentPhase.description}</p>
                          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4 text-sm\">
                            <div className=\"p-3 border rounded-lg\">
                              <div className=\"text-muted-foreground\">Estimated Duration</div>
                              <div className=\"font-medium\">{currentPhase.estimatedDuration}</div>
                            </div>
                            <div className=\"p-3 border rounded-lg\">
                              <div className=\"text-muted-foreground\">Level Range</div>
                              <div className=\"font-medium\">{currentPhase.levels[0]} - {currentPhase.levels[1]}</div>
                            </div>
                            <div className=\"p-3 border rounded-lg\">
                              <div className=\"text-muted-foreground\">Materials</div>
                              <div className=\"font-medium\">{currentPhase.materials.length} total</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Materials to Study */}
      {nextMaterials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className=\"flex items-center gap-2\">
              <Zap size={20} />
              Continue Learning
            </CardTitle>
            <CardDescription>
              Your next materials are ready to study
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className=\"grid gap-4\">
              {nextMaterials.slice(0, 3).map(material => (
                <div key={material.id} className=\"p-4 border rounded-lg space-y-3\">
                  <div className=\"flex justify-between items-start\">
                    <div>
                      <h3 className=\"font-semibold\">{material.title}</h3>
                      <p className=\"text-sm text-muted-foreground\">{material.description}</p>
                    </div>
                    <Badge variant=\"outline\">Level {material.level}</Badge>
                  </div>

                  <div className=\"grid grid-cols-3 gap-4 text-sm\">
                    <div className=\"flex items-center gap-2\">
                      <Clock size={16} className=\"text-muted-foreground\" />
                      <span>{material.estimatedHours}h</span>
                    </div>
                    <div className=\"flex items-center gap-2\">
                      <Target size={16} className=\"text-muted-foreground\" />
                      <span>{material.learningObjectives.length} objectives</span>
                    </div>
                    <div className=\"flex items-center gap-2\">
                      <BookOpen size={16} className=\"text-muted-foreground\" />
                      <span>{material.resources.length} resources</span>
                    </div>
                  </div>

                  <div className=\"flex flex-wrap gap-1\">
                    {material.skills.slice(0, 4).map((skill, index) => (
                      <Badge key={index} variant=\"secondary\" className=\"text-xs\">
                        {skill}
                      </Badge>
                    ))}
                    {material.skills.length > 4 && (
                      <Badge variant=\"secondary\" className=\"text-xs\">
                        +{material.skills.length - 4}
                      </Badge>
                    )}
                  </div>

                  <div className=\"flex justify-between items-center pt-2\">
                    <div className=\"text-sm text-muted-foreground\">
                      {material.meetingsRequired} meeting{material.meetingsRequired > 1 ? 's' : ''} required
                    </div>
                    <div className=\"flex gap-2\">
                      <Button size=\"sm\" variant=\"outline\">
                        <Calendar size={14} className=\"mr-1\" />
                        Schedule
                      </Button>
                      <Button size=\"sm\">
                        <PlayCircle size={14} className=\"mr-1\" />
                        Start Learning
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Journeys */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <BookOpen size={20} />
            Available Learning Journeys
          </CardTitle>
          <CardDescription>
            Choose a new journey to begin your learning adventure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=\"grid gap-4\">
            {journeys.filter(journey => !getJourneyProgress(journey.id)).map(journey => (
              <div key={journey.id} className=\"p-4 border rounded-lg space-y-3\">
                <div className=\"flex justify-between items-start\">
                  <div>
                    <h3 className=\"font-semibold\">{journey.title}</h3>
                    <p className=\"text-sm text-muted-foreground\">{journey.description}</p>
                  </div>
                  <Badge variant=\"outline\">{journey.category}</Badge>
                </div>

                <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 text-sm\">
                  <div>
                    <span className=\"text-muted-foreground\">Duration:</span>
                    <div className=\"font-medium\">{journey.estimatedDuration}</div>
                  </div>
                  <div>
                    <span className=\"text-muted-foreground\">Levels:</span>
                    <div className=\"font-medium\">{journey.totalLevels} levels</div>
                  </div>
                  <div>
                    <span className=\"text-muted-foreground\">Phases:</span>
                    <div className=\"font-medium\">{journey.phases.length} phases</div>
                  </div>
                  <div>
                    <span className=\"text-muted-foreground\">Skills:</span>
                    <div className=\"font-medium\">{journey.skills.length} skills</div>
                  </div>
                </div>

                <div className=\"flex flex-wrap gap-1\">
                  {journey.skills.slice(0, 5).map((skill, index) => (
                    <Badge key={index} variant=\"secondary\" className=\"text-xs\">
                      {skill}
                    </Badge>
                  ))}
                  {journey.skills.length > 5 && (
                    <Badge variant=\"secondary\" className=\"text-xs\">
                      +{journey.skills.length - 5} more
                    </Badge>
                  )}
                </div>

                <Separator />

                <div className=\"flex justify-between items-center\">
                  <div className=\"text-sm text-muted-foreground\">
                    {journey.phases.length} phases • {journey.totalLevels} levels • {journey.estimatedDuration}
                  </div>
                  <Button onClick={() => startJourney(journey.id)}>
                    <PlayCircle size={14} className=\"mr-1\" />
                    Start Journey
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}