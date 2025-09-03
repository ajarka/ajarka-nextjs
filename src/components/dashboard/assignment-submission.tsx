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
  FileText, 
  Upload, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Target,
  Award,
  Code,
  Github,
  PlayCircle
} from 'lucide-react'
import { learningService, type Assignment, type AssignmentSubmission } from '@/lib/learning-service'

interface AssignmentSubmissionProps {
  studentId: number
  assignmentId?: string
}

export default function AssignmentSubmission({ studentId, assignmentId }: AssignmentSubmissionProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  // Submission form state
  const [submissionForm, setSubmissionForm] = useState({
    submissionUrl: '',
    submissionContent: '',
    isSubmitting: false
  })

  useEffect(() => {
    fetchData()
  }, [studentId, assignmentId])

  useEffect(() => {
    // Timer for assignment deadline
    let interval: NodeJS.Timeout
    if (selectedAssignment && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev ? prev - 1 : 0)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [selectedAssignment, timeRemaining])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const assignmentsData = await learningService.getAssignments()
      setAssignments(assignmentsData.filter(a => a.isActive))

      // If specific assignment ID provided, select it
      if (assignmentId) {
        const assignment = assignmentsData.find(a => a.id === assignmentId)
        if (assignment) {
          setSelectedAssignment(assignment)
          // Calculate time remaining (mock - in real app this would be based on student's assignment start time)
          setTimeRemaining(assignment.timeLimit)
        }
      }

      // Fetch submissions for this student
      // Note: In a real app, this would be filtered by student ID on the backend
      // For now, we'll mock this
      setSubmissions([])

    } catch (error) {
      console.error('Failed to fetch assignment data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssignment) return

    try {
      setIsSubmitting(true)
      
      const submission: Omit<AssignmentSubmission, 'id' | 'submittedAt'> = {
        assignmentId: selectedAssignment.id,
        studentId,
        submissionUrl: submissionForm.submissionUrl,
        submissionContent: submissionForm.submissionContent || undefined,
        status: 'pending',
        score: null,
        feedback: null,
        attempt: 1, // In real app, calculate based on previous attempts
        gradedAt: null,
        gradedBy: null
      }

      await learningService.submitAssignment(submission)
      
      // Reset form
      setSubmissionForm({
        submissionUrl: '',
        submissionContent: '',
        isSubmitting: false
      })

      // Refresh data
      await fetchData()
      alert('Assignment submitted successfully!')

    } catch (error) {
      console.error('Failed to submit assignment:', error)
      alert('Failed to submit assignment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'graded': return 'bg-green-100 text-green-800'
      case 'revision_needed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-orange-100 text-orange-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className=\"p-6 space-y-6\">
        <div className=\"text-center py-8\">Loading assignments...</div>
      </div>
    )
  }

  return (
    <div className=\"p-6 space-y-6\">
      <div>
        <h1 className=\"text-3xl font-bold\">Assignment Submissions</h1>
        <p className=\"text-muted-foreground\">Complete and submit your assignments</p>
      </div>

      <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">
        {/* Assignment List */}
        <div className=\"lg:col-span-1 space-y-4\">
          <Card>
            <CardHeader>
              <CardTitle className=\"flex items-center gap-2\">
                <FileText size={20} />
                Available Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className=\"text-center py-8\">
                  <FileText className=\"mx-auto h-12 w-12 text-muted-foreground mb-4\" />
                  <h3 className=\"text-lg font-medium mb-2\">No assignments available</h3>
                  <p className=\"text-muted-foreground\">
                    Complete some materials to unlock assignments
                  </p>
                </div>
              ) : (
                <div className=\"space-y-3\">
                  {assignments.map(assignment => (
                    <div
                      key={assignment.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedAssignment?.id === assignment.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        setSelectedAssignment(assignment)
                        setTimeRemaining(assignment.timeLimit)
                        setSubmissionForm({
                          submissionUrl: '',
                          submissionContent: '',
                          isSubmitting: false
                        })
                      }}
                    >
                      <div className=\"space-y-2\">
                        <h3 className=\"font-medium text-sm\">{assignment.title}</h3>
                        <div className=\"flex items-center gap-2\">
                          <Badge variant=\"outline\" className=\"text-xs\">
                            Level {assignment.level}
                          </Badge>
                          <Badge className={getDifficultyColor(assignment.type)} variant=\"secondary\">
                            {assignment.type}
                          </Badge>
                        </div>
                        <div className=\"flex items-center gap-4 text-xs text-muted-foreground\">
                          <div className=\"flex items-center gap-1\">
                            <Clock size={12} />
                            {Math.floor(assignment.timeLimit / 3600)}h
                          </div>
                          <div className=\"flex items-center gap-1\">
                            <Target size={12} />
                            {assignment.passingScore}%
                          </div>
                          <div className=\"flex items-center gap-1\">
                            <Award size={12} />
                            {assignment.maxAttempts} attempts
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assignment Details and Submission */}
        <div className=\"lg:col-span-2 space-y-6\">
          {selectedAssignment ? (
            <>
              {/* Assignment Details */}
              <Card>
                <CardHeader>
                  <div className=\"flex justify-between items-start\">
                    <div>
                      <CardTitle>{selectedAssignment.title}</CardTitle>
                      <CardDescription>{selectedAssignment.description}</CardDescription>
                    </div>
                    <div className=\"flex gap-2\">
                      <Badge variant=\"outline\">Level {selectedAssignment.level}</Badge>
                      <Badge className={getDifficultyColor(selectedAssignment.type)}>
                        {selectedAssignment.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className=\"space-y-6\">
                  {/* Timer */}
                  {timeRemaining !== null && (
                    <div className=\"p-4 bg-muted rounded-lg\">
                      <div className=\"flex items-center justify-between mb-2\">
                        <span className=\"font-medium flex items-center gap-2\">
                          <Clock size={16} />
                          Time Remaining
                        </span>
                        <span className={`font-mono text-lg ${timeRemaining < 900 ? 'text-red-600' : ''}`}>
                          {formatTime(timeRemaining)}
                        </span>
                      </div>
                      <Progress 
                        value={(timeRemaining / selectedAssignment.timeLimit) * 100} 
                        className=\"w-full\"
                      />
                      {timeRemaining < 900 && (
                        <div className=\"flex items-center gap-2 mt-2 text-red-600 text-sm\">
                          <AlertTriangle size={14} />
                          Less than 15 minutes remaining!
                        </div>
                      )}
                    </div>
                  )}

                  {/* Instructions */}
                  <div>
                    <h3 className=\"font-semibold mb-2\">Instructions</h3>
                    <p className=\"text-muted-foreground\">{selectedAssignment.instructions}</p>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h3 className=\"font-semibold mb-2\">Requirements</h3>
                    <ul className=\"space-y-1\">
                      {selectedAssignment.requirements.map((req, index) => (
                        <li key={index} className=\"flex items-center gap-2 text-sm\">
                          <div className=\"w-1.5 h-1.5 bg-primary rounded-full\" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Resources */}
                  {selectedAssignment.resources.length > 0 && (
                    <div>
                      <h3 className=\"font-semibold mb-2\">Helpful Resources</h3>
                      <div className=\"space-y-2\">
                        {selectedAssignment.resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource}
                            target=\"_blank\"
                            rel=\"noopener noreferrer\"
                            className=\"flex items-center gap-2 text-sm text-primary hover:underline\"
                          >
                            <ExternalLink size={14} />
                            {resource}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rubric */}
                  <div>
                    <h3 className=\"font-semibold mb-2\">Grading Rubric</h3>
                    <div className=\"space-y-2\">
                      {selectedAssignment.rubric.map((criterion, index) => (
                        <div key={index} className=\"flex justify-between items-center p-3 border rounded-lg\">
                          <div>
                            <h4 className=\"font-medium text-sm\">{criterion.criteria}</h4>
                            <p className=\"text-xs text-muted-foreground\">{criterion.description}</p>
                          </div>
                          <Badge variant=\"outline\">{criterion.points} pts</Badge>
                        </div>
                      ))}
                    </div>
                    <div className=\"mt-2 text-sm text-muted-foreground\">
                      Passing score: {selectedAssignment.passingScore}% 
                      ({Math.ceil((selectedAssignment.passingScore / 100) * selectedAssignment.rubric.reduce((sum, r) => sum + r.points, 0))} points)
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submission Form */}
              <Card>
                <CardHeader>
                  <CardTitle className=\"flex items-center gap-2\">
                    <Upload size={20} />
                    Submit Assignment
                  </CardTitle>
                  <CardDescription>
                    Submit your completed assignment for review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className=\"space-y-4\">
                    {selectedAssignment.submissionFormat === 'github_repo' && (
                      <div className=\"space-y-2\">
                        <Label htmlFor=\"githubUrl\">GitHub Repository URL *</Label>
                        <div className=\"relative\">
                          <Github className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground\" size={16} />
                          <Input
                            id=\"githubUrl\"
                            type=\"url\"
                            placeholder=\"https://github.com/username/repo-name\"
                            value={submissionForm.submissionUrl}
                            onChange={(e) => setSubmissionForm(prev => ({ ...prev, submissionUrl: e.target.value }))}
                            className=\"pl-9\"
                            required
                          />
                        </div>
                        <p className=\"text-sm text-muted-foreground\">
                          Make sure your repository is public or accessible to mentors
                        </p>
                      </div>
                    )}

                    {selectedAssignment.submissionFormat === 'file_upload' && (
                      <div className=\"space-y-2\">
                        <Label htmlFor=\"fileUrl\">File URL or Drive Link *</Label>
                        <Input
                          id=\"fileUrl\"
                          type=\"url\"
                          placeholder=\"https://drive.google.com/... or file URL\"
                          value={submissionForm.submissionUrl}
                          onChange={(e) => setSubmissionForm(prev => ({ ...prev, submissionUrl: e.target.value }))}
                          required
                        />
                      </div>
                    )}

                    {(selectedAssignment.submissionFormat === 'text' || selectedAssignment.type === 'essay') && (
                      <div className=\"space-y-2\">
                        <Label htmlFor=\"content\">Assignment Content *</Label>
                        <Textarea
                          id=\"content\"
                          placeholder=\"Write your assignment content here...\"
                          value={submissionForm.submissionContent}
                          onChange={(e) => setSubmissionForm(prev => ({ ...prev, submissionContent: e.target.value }))}
                          rows={10}
                          required
                        />
                      </div>
                    )}

                    <div className=\"space-y-2\">
                      <Label htmlFor=\"notes\">Additional Notes (Optional)</Label>
                      <Textarea
                        id=\"notes\"
                        placeholder=\"Any additional notes or comments for your mentor...\"
                        rows={3}
                      />
                    </div>

                    <Separator />

                    <div className=\"flex items-center justify-between\">
                      <div className=\"text-sm text-muted-foreground\">
                        Attempts remaining: {selectedAssignment.maxAttempts} • 
                        Passing score: {selectedAssignment.passingScore}%
                      </div>
                      <div className=\"flex gap-3\">
                        <Button type=\"button\" variant=\"outline\">
                          Save Draft
                        </Button>
                        <Button 
                          type=\"submit\" 
                          disabled={isSubmitting || timeRemaining === 0}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                        </Button>
                      </div>
                    </div>

                    {timeRemaining === 0 && (
                      <div className=\"p-4 bg-red-50 border border-red-200 rounded-lg\">
                        <div className=\"flex items-center gap-2 text-red-600\">
                          <XCircle size={16} />
                          <span className=\"font-medium\">Time's up!</span>
                        </div>
                        <p className=\"text-sm text-red-600 mt-1\">
                          The assignment deadline has passed. Please contact your mentor if you need an extension.
                        </p>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* Previous Submissions */}
              {submissions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Previous Submissions</CardTitle>
                    <CardDescription>Your submission history for this assignment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className=\"space-y-4\">
                      {submissions.map((submission, index) => (
                        <div key={submission.id} className=\"p-4 border rounded-lg\">
                          <div className=\"flex justify-between items-start mb-2\">
                            <div>
                              <span className=\"text-sm font-medium\">Attempt {submission.attempt}</span>
                              <div className=\"text-xs text-muted-foreground\">
                                Submitted {new Date(submission.submittedAt).toLocaleString()}
                              </div>
                            </div>
                            <Badge className={getStatusColor(submission.status)}>
                              {submission.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          {submission.score !== null && (
                            <div className=\"flex items-center gap-2 mb-2\">
                              <Award size={16} className={submission.score >= selectedAssignment.passingScore ? 'text-green-500' : 'text-red-500'} />
                              <span className=\"font-medium\">{submission.score}%</span>
                              {submission.score >= selectedAssignment.passingScore ? (
                                <span className=\"text-green-600 text-sm\">Passed</span>
                              ) : (
                                <span className=\"text-red-600 text-sm\">Failed</span>
                              )}
                            </div>
                          )}
                          
                          {submission.feedback && (
                            <div className=\"mt-2 p-3 bg-muted rounded-lg\">
                              <h4 className=\"font-medium text-sm mb-1\">Mentor Feedback</h4>
                              <p className=\"text-sm\">{submission.feedback}</p>
                            </div>
                          )}
                          
                          {submission.submissionUrl && (
                            <div className=\"mt-2\">
                              <Button size=\"sm\" variant=\"outline\" asChild>
                                <a href={submission.submissionUrl} target=\"_blank\" rel=\"noopener noreferrer\">
                                  <ExternalLink size={14} className=\"mr-1\" />
                                  View Submission
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className=\"text-center py-12\">
                <FileText className=\"mx-auto h-12 w-12 text-muted-foreground mb-4\" />
                <h3 className=\"text-lg font-medium mb-2\">Select an Assignment</h3>
                <p className=\"text-muted-foreground\">
                  Choose an assignment from the list to view details and submit your work
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}