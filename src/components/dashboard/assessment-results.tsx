'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Brain,
  Timer,
  Award,
  RefreshCw
} from 'lucide-react'
import { motion } from 'framer-motion'

interface AssessmentResult {
  id: string
  studentId: number
  assessmentId: string
  startTime: string
  endTime: string
  timeSpent: number
  status: 'completed' | 'timeout' | 'abandoned'
  totalScore: number
  answers: Array<{
    questionId: string
    type: 'multiple_choice' | 'essay'
    answer: number | string
    isCorrect?: boolean
    timeSpent: number
    score?: number
  }>
  feedback?: string
  createdAt: string
}

interface Assessment {
  id: string
  title: string
  passingScore: number
  totalQuestions: number
  timeLimit: number
  questions: Array<{
    id: string
    type: 'multiple_choice' | 'essay'
    question: string
    difficulty: 'easy' | 'medium' | 'hard'
    explanation?: string
  }>
}

interface AssessmentResultsProps {
  result: AssessmentResult
  assessment: Assessment
  onRetake?: () => void
  onNext?: () => void
  onExit: () => void
}

export default function AssessmentResults({
  result,
  assessment,
  onRetake,
  onNext,
  onExit
}: AssessmentResultsProps) {
  const [showDetails, setShowDetails] = useState(false)

  const isPassed = result.totalScore >= assessment.passingScore
  const efficiency = (result.timeSpent / assessment.timeLimit) * 100
  const averageTimePerQuestion = result.timeSpent / assessment.totalQuestions

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' }
    if (score >= 80) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (score >= 70) return { level: 'Satisfactory', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { level: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const getTimeEfficiency = (efficiency: number) => {
    if (efficiency <= 60) return { level: 'Lightning Fast ⚡', color: 'text-purple-600', bg: 'bg-purple-100' }
    if (efficiency <= 80) return { level: 'Efficient ⭐', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (efficiency <= 95) return { level: 'Good Pace 👍', color: 'text-green-600', bg: 'bg-green-100' }
    return { level: 'Just in Time ⏰', color: 'text-orange-600', bg: 'bg-orange-100' }
  }

  const performance = getPerformanceLevel(result.totalScore)
  const timePerf = getTimeEfficiency(efficiency)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getMCQStats = () => {
    const mcqAnswers = result.answers.filter(a => a.type === 'multiple_choice')
    const correct = mcqAnswers.filter(a => a.isCorrect).length
    return { total: mcqAnswers.length, correct, accuracy: mcqAnswers.length > 0 ? (correct / mcqAnswers.length) * 100 : 0 }
  }

  const getEssayStats = () => {
    const essayAnswers = result.answers.filter(a => a.type === 'essay')
    return essayAnswers.length
  }

  const mcqStats = getMCQStats()
  const essayCount = getEssayStats()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`border-2 ${isPassed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className={`mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center ${
                  isPassed ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {isPassed ? (
                  <Trophy className="w-10 h-10 text-white" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-white" />
                )}
              </motion.div>
              <CardTitle className={`text-3xl ${isPassed ? 'text-green-800' : 'text-red-800'}`}>
                {isPassed ? 'ASSESSMENT PASSED!' : 'ASSESSMENT NOT PASSED'}
              </CardTitle>
              <CardDescription className={`text-lg ${isPassed ? 'text-green-700' : 'text-red-700'}`}>
                {assessment.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${performance.color}`}>
                    {result.totalScore}%
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Final Score</div>
                  <Badge className={`${performance.bg} ${performance.color}`}>
                    {performance.level}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2 text-blue-600">
                    {formatTime(result.timeSpent)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Time Spent</div>
                  <Badge className={`${timePerf.bg} ${timePerf.color}`}>
                    {timePerf.level}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2 text-purple-600">
                    {Math.round(efficiency)}%
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Time Used</div>
                  <Badge variant="outline">
                    {formatTime(Math.round(averageTimePerQuestion))}/question
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Passing Score: {assessment.passingScore}%</span>
                  <span>{result.totalScore}%</span>
                </div>
                <Progress 
                  value={result.totalScore} 
                  className={`h-4 ${isPassed ? 'bg-green-100' : 'bg-red-100'}`}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span className="font-medium">
                    {isPassed ? `Passed by ${result.totalScore - assessment.passingScore}%` : `Need ${assessment.passingScore - result.totalScore}% more`}
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Performance Analysis
              </CardTitle>
              <CardDescription>
                Analisis performa Anda dalam kondisi deadline pressure - seperti di dunia kerja nyata!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Question Type Performance</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <span>Multiple Choice</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{mcqStats.correct}/{mcqStats.total}</div>
                        <div className="text-sm text-gray-600">{Math.round(mcqStats.accuracy)}% accuracy</div>
                      </div>
                    </div>
                    {essayCount > 0 && (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-green-600" />
                          <span>Essay Questions</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{essayCount}</div>
                          <div className="text-sm text-gray-600">completed</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Time Management</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Timer className="w-5 h-5 text-purple-600" />
                        <span>Avg per Question</span>
                      </div>
                      <div className="font-bold">{formatTime(Math.round(averageTimePerQuestion))}</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <span>Time Remaining</span>
                      </div>
                      <div className="font-bold">{formatTime(assessment.timeLimit - result.timeSpent)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Real-world Performance Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Award className="w-5 h-5" />
                Real-World Readiness Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {result.totalScore >= 85 ? '🔥' : result.totalScore >= 70 ? '👍' : '⚠️'}
                    </div>
                    <div className="text-sm font-medium">Technical Skills</div>
                    <div className="text-xs text-gray-600">
                      {result.totalScore >= 85 ? 'Ready for senior role' : 
                       result.totalScore >= 70 ? 'Good for junior role' : 'Needs more practice'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {efficiency <= 70 ? '⚡' : efficiency <= 90 ? '✅' : '⏰'}
                    </div>
                    <div className="text-sm font-medium">Time Management</div>
                    <div className="text-xs text-gray-600">
                      {efficiency <= 70 ? 'Excellent under pressure' : 
                       efficiency <= 90 ? 'Good pace' : 'Just made it!'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {isPassed ? '🏆' : '📚'}
                    </div>
                    <div className="text-sm font-medium">Overall Readiness</div>
                    <div className="text-xs text-gray-600">
                      {isPassed ? 'Ready for real projects!' : 'Keep practicing!'}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold mb-2 text-orange-800">💡 Feedback for Real-World Success:</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    {result.totalScore >= 85 ? (
                      <p>🎉 <strong>Excellent!</strong> Anda menunjukkan kemampuan yang kuat dalam kondisi tekanan. Ini adalah skill penting untuk deadline-driven environment seperti startup dan consulting.</p>
                    ) : result.totalScore >= 70 ? (
                      <p>👏 <strong>Good job!</strong> Anda memiliki pemahaman yang solid. Untuk meningkatkan confidence dalam situasi tekanan, coba latihan lebih sering dengan timer.</p>
                    ) : (
                      <p>📖 <strong>Keep learning!</strong> Ini adalah awal yang baik. Fokus pada pemahaman fundamental dulu, kemudian latih speed dan accuracy secara bertahap.</p>
                    )}
                    
                    {efficiency <= 60 && (
                      <p>⚡ <strong>Speed demon!</strong> Time management Anda excellent. Ini valuable skill untuk fast-paced development environment.</p>
                    )}
                    
                    {efficiency > 95 && (
                      <p>⏰ <strong>Time management tip:</strong> Dalam interview atau deadline nyata, usahakan reserve 10-15% waktu untuk review dan polish jawaban.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Question Details */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Detailed Question Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.answers.map((answer, index) => {
                    const question = assessment.questions.find(q => q.id === answer.questionId)
                    if (!question) return null

                    return (
                      <div key={answer.questionId} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={question.difficulty === 'easy' ? 'default' : question.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                              {question.difficulty}
                            </Badge>
                            <span className="text-sm text-gray-600">{formatTime(answer.timeSpent)}</span>
                            {answer.type === 'multiple_choice' && (
                              answer.isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{question.question}</p>
                        {answer.type === 'multiple_choice' && question.explanation && !answer.isCorrect && (
                          <div className="bg-blue-50 p-3 rounded-lg mt-2">
                            <p className="text-sm text-blue-800"><strong>Explanation:</strong> {question.explanation}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
                {!isPassed && onRetake && (
                  <Button
                    variant="outline"
                    onClick={onRetake}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retake Assessment
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={onExit}>
                  Back to Course
                </Button>
                {isPassed && onNext && (
                  <Button onClick={onNext} className="bg-green-600 hover:bg-green-700">
                    Continue Learning
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}