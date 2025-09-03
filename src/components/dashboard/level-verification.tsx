'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp,
  Upload,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Award,
  Github,
  Video,
  FileText,
  AlertTriangle,
  Zap
} from 'lucide-react'
import { learningService, type LevelVerification, type StudentProgress, type LearningJourney } from '@/lib/learning-service'

interface LevelVerificationProps {
  studentId: number
}

export default function LevelVerification({ studentId }: LevelVerificationProps) {
  const [verifications, setVerifications] = useState<LevelVerification[]>([])
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([])
  const [journeys, setJourneys] = useState<LearningJourney[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    journeyId: '',
    targetLevel: 10,
    githubUrl: '',
    liveUrl: '',
    videoUrl: '',
    documentationUrl: '',
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [studentId])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [verificationsData, progressData, journeysData] = await Promise.all([
        learningService.getLevelVerifications(studentId),
        learningService.getStudentProgress(studentId),
        learningService.getLearningJourneys()
      ])

      setVerifications(verificationsData)
      setStudentProgress(progressData.filter(p => p.status === 'active'))
      setJourneys(journeysData)
    } catch (error) {
      console.error('Failed to fetch verification data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      const currentProgress = studentProgress.find(p => p.journeyId === formData.journeyId)
      if (!currentProgress) {
        alert('Progress not found for this journey')
        return
      }

      const submissions = [
        {
          type: 'github_project' as const,
          url: formData.githubUrl,
          liveUrl: formData.liveUrl || undefined,
          submittedAt: new Date().toISOString()
        },
        {
          type: 'video_explanation' as const,
          url: formData.videoUrl,
          duration: 300, // 5 minutes max
          submittedAt: new Date().toISOString()
        }
      ]

      if (formData.documentationUrl) {
        submissions.push({
          type: 'documentation' as const,
          url: formData.documentationUrl,
          submittedAt: new Date().toISOString()
        })
      }

      const verification: Omit<LevelVerification, 'id' | 'createdAt' | 'updatedAt'> = {
        studentId,
        journeyId: formData.journeyId,
        currentLevel: currentProgress.currentLevel,
        targetLevel: formData.targetLevel,
        type: 'level_jump',
        status: 'pending',
        requirements: [
          {
            type: 'project',
            projectId: `VERIFICATION-PROJECT-${formData.journeyId}`,
            status: 'completed',
            score: null
          }
        ],
        submissions,
        reviewedBy: null,
        reviewedAt: null,
        feedback: null,
        approvedLevel: null
      }

      await learningService.createLevelVerification(verification)
      
      // Reset form
      setFormData({
        journeyId: '',
        targetLevel: 10,
        githubUrl: '',
        liveUrl: '',
        videoUrl: '',
        documentationUrl: '',
        description: ''
      })
      
      setShowCreateForm(false)
      await fetchData()
      alert('Level verification submitted successfully!')

    } catch (error) {
      console.error('Failed to submit verification:', error)
      alert('Failed to submit verification. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_review': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />
      case 'in_review': return <Target size={16} />
      case 'approved': return <CheckCircle size={16} />
      case 'rejected': return <XCircle size={16} />
      default: return <AlertTriangle size={16} />
    }
  }

  const canRequestVerification = (journeyId: string, targetLevel: number) => {
    const progress = studentProgress.find(p => p.journeyId === journeyId)
    if (!progress) return false
    
    // Can only jump if current level is at least 50% of target level
    const minRequiredLevel = Math.floor(targetLevel * 0.5)
    return progress.currentLevel >= minRequiredLevel
  }

  const getJourneyName = (journeyId: string) => {
    return journeys.find(j => j.id === journeyId)?.title || journeyId
  }

  if (isLoading) {
    return (
      <div className=\"p-6 space-y-6\">
        <div className=\"text-center py-8\">Loading level verification data...</div>
      </div>
    )
  }

  return (
    <div className=\"p-6 space-y-6\">
      <div className=\"flex justify-between items-center\">
        <div>
          <h1 className=\"text-3xl font-bold\">Level Verification</h1>
          <p className=\"text-muted-foreground\">Request to jump to higher levels by demonstrating your skills</p>
        </div>
        {studentProgress.length > 0 && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Zap className=\"mr-2\" size={16} />
            Request Level Jump
          </Button>
        )}
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <Target size={20} />
            How Level Verification Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
            <div className=\"text-center space-y-3\">
              <div className=\"mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center\">
                <Github className=\"text-blue-600\" size={24} />
              </div>
              <h3 className=\"font-semibold\">1. Submit Project</h3>
              <p className=\"text-sm text-muted-foreground\">
                Create a comprehensive project demonstrating skills from your current level to target level
              </p>
            </div>
            <div className=\"text-center space-y-3\">
              <div className=\"mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center\">
                <Video className=\"text-green-600\" size={24} />
              </div>
              <h3 className=\"font-semibold\">2. Record Explanation</h3>
              <p className=\"text-sm text-muted-foreground\">
                Create a 5-minute video explaining your project, technical decisions, and learning outcomes
              </p>
            </div>
            <div className=\"text-center space-y-3\">
              <div className=\"mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center\">
                <Award className=\"text-purple-600\" size={24} />
              </div>
              <h3 className=\"font-semibold\">3. Get Reviewed</h3>
              <p className=\"text-sm text-muted-foreground\">
                Our mentors will review your submission and approve your level jump if you meet the criteria
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Progress */}
      {studentProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className=\"flex items-center gap-2\">
              <TrendingUp size={20} />
              Current Progress
            </CardTitle>
            <CardDescription>Your current level in active journeys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=\"space-y-4\">
              {studentProgress.map(progress => {
                const journey = journeys.find(j => j.id === progress.journeyId)
                if (!journey) return null

                const progressPercentage = (progress.currentLevel / journey.totalLevels) * 100

                return (
                  <div key={progress.id} className=\"p-4 border rounded-lg space-y-3\">
                    <div className=\"flex justify-between items-center\">
                      <div>
                        <h3 className=\"font-semibold\">{journey.title}</h3>
                        <p className=\"text-sm text-muted-foreground\">{journey.category}</p>
                      </div>
                      <Badge variant=\"outline\">
                        Level {progress.currentLevel} / {journey.totalLevels}
                      </Badge>
                    </div>
                    
                    <div className=\"space-y-2\">
                      <div className=\"flex justify-between text-sm\">
                        <span>Progress</span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <Progress value={progressPercentage} className=\"w-full\" />
                    </div>

                    <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 text-sm\">
                      <div>
                        <span className=\"text-muted-foreground\">Current Phase:</span>
                        <div className=\"font-medium\">{progress.currentPhase}</div>
                      </div>
                      <div>
                        <span className=\"text-muted-foreground\">Materials:</span>
                        <div className=\"font-medium\">{progress.completedMaterials.length} completed</div>
                      </div>
                      <div>
                        <span className=\"text-muted-foreground\">Assignments:</span>
                        <div className=\"font-medium\">{progress.completedAssignments.length} submitted</div>
                      </div>
                      <div>
                        <span className=\"text-muted-foreground\">Skills:</span>
                        <div className=\"font-medium\">{progress.skillsAcquired.length} acquired</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Request Level Verification</CardTitle>
            <CardDescription>
              Submit your project and video to demonstrate your advanced skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitVerification} className=\"space-y-6\">
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                <div className=\"space-y-2\">
                  <Label htmlFor=\"journey\">Learning Journey *</Label>
                  <select
                    id=\"journey\"
                    className=\"w-full p-2 border rounded-md\"
                    value={formData.journeyId}
                    onChange={(e) => setFormData(prev => ({ ...prev, journeyId: e.target.value }))}
                    required
                  >
                    <option value=\"\">Select a journey</option>
                    {studentProgress.map(progress => {
                      const journey = journeys.find(j => j.id === progress.journeyId)
                      return (
                        <option key={progress.journeyId} value={progress.journeyId}>
                          {journey?.title} (Current: Level {progress.currentLevel})
                        </option>
                      )
                    })}
                  </select>
                </div>
                
                <div className=\"space-y-2\">
                  <Label htmlFor=\"targetLevel\">Target Level *</Label>
                  <Input
                    id=\"targetLevel\"
                    type=\"number\"
                    min=\"1\"
                    max=\"100\"
                    value={formData.targetLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetLevel: parseInt(e.target.value) || 10 }))}
                    required
                  />
                  {formData.journeyId && !canRequestVerification(formData.journeyId, formData.targetLevel) && (
                    <p className=\"text-sm text-red-600\">
                      You need to be at least level {Math.floor(formData.targetLevel * 0.5)} to request level {formData.targetLevel}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className=\"space-y-4\">
                <h3 className=\"font-semibold\">Project Submission</h3>
                
                <div className=\"space-y-2\">
                  <Label htmlFor=\"githubUrl\">GitHub Repository URL *</Label>
                  <div className=\"relative\">
                    <Github className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground\" size={16} />
                    <Input
                      id=\"githubUrl\"
                      type=\"url\"
                      placeholder=\"https://github.com/username/project-name\"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                      className=\"pl-9\"
                      required
                    />
                  </div>
                  <p className=\"text-sm text-muted-foreground\">
                    Your project repository must be public and include a comprehensive README
                  </p>
                </div>

                <div className=\"space-y-2\">
                  <Label htmlFor=\"liveUrl\">Live Demo URL (Optional)</Label>
                  <div className=\"relative\">
                    <ExternalLink className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground\" size={16} />
                    <Input
                      id=\"liveUrl\"
                      type=\"url\"
                      placeholder=\"https://your-project-demo.com\"
                      value={formData.liveUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                      className=\"pl-9\"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className=\"space-y-4\">
                <h3 className=\"font-semibold\">Video Explanation</h3>
                
                <div className=\"space-y-2\">
                  <Label htmlFor=\"videoUrl\">Video URL (YouTube, Loom, etc.) *</Label>
                  <div className=\"relative\">
                    <Video className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground\" size={16} />
                    <Input
                      id=\"videoUrl\"
                      type=\"url\"
                      placeholder=\"https://youtube.com/watch?v=... or https://loom.com/share/...\"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                      className=\"pl-9\"
                      required
                    />
                  </div>
                  <div className=\"text-sm text-muted-foreground space-y-1\">
                    <p><strong>Video Requirements (Max 5 minutes):</strong></p>
                    <ul className=\"list-disc list-inside ml-2 space-y-1\">
                      <li>Demonstrate your project functionality</li>
                      <li>Explain technical decisions and architecture</li>
                      <li>Discuss challenges faced and how you solved them</li>
                      <li>Highlight skills learned and applied</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className=\"space-y-2\">
                <Label htmlFor=\"documentationUrl\">Additional Documentation (Optional)</Label>
                <div className=\"relative\">
                  <FileText className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground\" size={16} />
                  <Input
                    id=\"documentationUrl\"
                    type=\"url\"
                    placeholder=\"Link to additional documentation, blog post, etc.\"
                    value={formData.documentationUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentationUrl: e.target.value }))}
                    className=\"pl-9\"
                  />
                </div>
              </div>

              <div className=\"space-y-2\">
                <Label htmlFor=\"description\">Project Description</Label>
                <Textarea
                  id=\"description\"
                  placeholder=\"Brief description of your project and what it demonstrates...\"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <Separator />

              <div className=\"flex justify-end gap-3\">
                <Button
                  type=\"button\"
                  variant=\"outline\"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type=\"submit\" 
                  disabled={isSubmitting || (formData.journeyId && !canRequestVerification(formData.journeyId, formData.targetLevel))}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Verification'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Verification History */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <Award size={20} />
            Verification History
          </CardTitle>
          <CardDescription>Your previous level verification requests</CardDescription>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <div className=\"text-center py-8\">
              <Award className=\"mx-auto h-12 w-12 text-muted-foreground mb-4\" />
              <h3 className=\"text-lg font-medium mb-2\">No verifications yet</h3>
              <p className=\"text-muted-foreground mb-4\">
                Start learning and request your first level verification when you're ready!
              </p>
              {studentProgress.length > 0 && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Zap className=\"mr-2\" size={16} />
                  Request Level Jump
                </Button>
              )}
            </div>
          ) : (
            <div className=\"space-y-4\">
              {verifications.map(verification => (
                <div key={verification.id} className=\"p-4 border rounded-lg space-y-4\">
                  <div className=\"flex justify-between items-start\">
                    <div>
                      <h3 className=\"font-semibold\">{getJourneyName(verification.journeyId)}</h3>
                      <p className=\"text-sm text-muted-foreground\">
                        Level {verification.currentLevel} → {verification.targetLevel}
                      </p>
                    </div>
                    <div className=\"flex items-center gap-2\">
                      <Badge className={getStatusColor(verification.status)}>
                        {getStatusIcon(verification.status)}
                        {verification.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 text-sm\">
                    <div>
                      <span className=\"text-muted-foreground\">Submitted:</span>
                      <div className=\"font-medium\">{new Date(verification.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className=\"text-muted-foreground\">Type:</span>
                      <div className=\"font-medium capitalize\">{verification.type.replace('_', ' ')}</div>
                    </div>
                    {verification.reviewedAt && (
                      <div>
                        <span className=\"text-muted-foreground\">Reviewed:</span>
                        <div className=\"font-medium\">{new Date(verification.reviewedAt).toLocaleDateString()}</div>
                      </div>
                    )}
                    {verification.approvedLevel && (
                      <div>
                        <span className=\"text-muted-foreground\">Approved Level:</span>
                        <div className=\"font-medium\">{verification.approvedLevel}</div>
                      </div>
                    )}
                  </div>

                  {verification.submissions.length > 0 && (
                    <div>
                      <h4 className=\"font-medium mb-2\">Submissions:</h4>
                      <div className=\"flex gap-2 flex-wrap\">
                        {verification.submissions.map((submission, index) => (
                          <Button key={index} size=\"sm\" variant=\"outline\" asChild>
                            <a href={submission.url} target=\"_blank\" rel=\"noopener noreferrer\">
                              {submission.type === 'github_project' && <Github size={14} className=\"mr-1\" />}
                              {submission.type === 'video_explanation' && <Video size={14} className=\"mr-1\" />}
                              {submission.type === 'documentation' && <FileText size={14} className=\"mr-1\" />}
                              {submission.type.replace('_', ' ')}
                              <ExternalLink size={12} className=\"ml-1\" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {verification.feedback && (
                    <div className=\"mt-4 p-4 bg-muted rounded-lg\">
                      <h4 className=\"font-medium mb-2\">Mentor Feedback</h4>
                      <p className=\"text-sm\">{verification.feedback}</p>
                    </div>
                  )}

                  {verification.status === 'approved' && verification.approvedLevel && (
                    <div className=\"flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg\">
                      <CheckCircle className=\"text-green-600\" size={16} />
                      <span className=\"text-green-700 font-medium\">
                        Congratulations! You've been approved for level {verification.approvedLevel}
                      </span>
                    </div>
                  )}

                  {verification.status === 'rejected' && (
                    <div className=\"flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg\">
                      <XCircle className=\"text-red-600\" size={16} />
                      <span className=\"text-red-700 font-medium\">
                        Verification not approved. Please review the feedback and try again.
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}