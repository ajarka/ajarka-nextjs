'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  Brain,
  Timer,
  Zap,
  Flag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Question {
  id: string
  type: 'multiple_choice' | 'essay'
  timeLimit: number
  question: string
  code?: string
  options?: string[]
  correctAnswer?: number
  explanation?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  maxWords?: number
  gradingCriteria?: string[]
}

interface Assessment {
  id: string
  materialId: string
  title: string
  description: string
  type: string
  totalQuestions: number
  passingScore: number
  timeLimit: number
  instructions: string
  questions: Question[]
  isActive: boolean
}

interface AssessmentInterfaceProps {
  assessment: Assessment
  onComplete: (answers: any[], totalScore: number, timeSpent: number) => void
  onExit: () => void
}

interface Answer {
  questionId: string
  type: 'multiple_choice' | 'essay'
  answer: number | string
  timeSpent: number
  isCorrect?: boolean
}

export default function AssessmentInterface({
  assessment,
  onComplete,
  onExit
}: AssessmentInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState<string | number>('')
  const [totalTimeLeft, setTotalTimeLeft] = useState(assessment.timeLimit)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(assessment.questions[0]?.timeLimit || 0)
  const [startTime] = useState(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [isStarted, setIsStarted] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  const currentQuestion = assessment.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1

  // Timer effects
  useEffect(() => {
    if (!isStarted || isSubmitted) return

    const interval = setInterval(() => {
      setTotalTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isStarted, isSubmitted])

  useEffect(() => {
    if (!isStarted || isSubmitted || !currentQuestion) return

    const interval = setInterval(() => {
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          handleQuestionTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentQuestionIndex, isStarted, isSubmitted])

  const handleTimeUp = useCallback(() => {
    if (isSubmitted) return
    setIsSubmitted(true)
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    
    // Auto-submit with current answers
    const finalAnswers = [...answers]
    if (currentAnswer && !answers.find(a => a.questionId === currentQuestion.id)) {
      const questionTimeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
      finalAnswers.push({
        questionId: currentQuestion.id,
        type: currentQuestion.type,
        answer: currentAnswer,
        timeSpent: questionTimeSpent
      })
    }
    
    onComplete(finalAnswers, calculateScore(finalAnswers), timeSpent)
  }, [answers, currentAnswer, currentQuestion, isSubmitted, startTime, questionStartTime, onComplete])

  const handleQuestionTimeUp = () => {
    if (currentAnswer) {
      saveCurrentAnswer()
    }
    if (!isLastQuestion) {
      nextQuestion()
    } else {
      handleSubmit()
    }
  }

  const calculateScore = (finalAnswers: Answer[]) => {
    let totalScore = 0
    const pointsPerQuestion = 100 / assessment.totalQuestions

    finalAnswers.forEach(answer => {
      const question = assessment.questions.find(q => q.id === answer.questionId)
      if (!question) return

      if (question.type === 'multiple_choice') {
        if (answer.answer === question.correctAnswer) {
          totalScore += pointsPerQuestion
        }
      } else {
        // Essay questions - simplified auto-scoring based on word count and content
        const wordCount = typeof answer.answer === 'string' ? answer.answer.split(' ').length : 0
        const hasMinWords = wordCount >= (question.maxWords || 50) * 0.5
        const hasMaxWords = wordCount <= (question.maxWords || 300)
        
        if (hasMinWords && hasMaxWords) {
          totalScore += pointsPerQuestion * 0.7 // 70% for meeting word requirements
        }
      }
    })

    return Math.round(totalScore)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsStarted(true)
    setQuestionStartTime(Date.now())
    setQuestionTimeLeft(currentQuestion.timeLimit)
  }

  const saveCurrentAnswer = () => {
    const questionTimeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    const existingAnswerIndex = answers.findIndex(a => a.questionId === currentQuestion.id)
    
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      type: currentQuestion.type,
      answer: currentAnswer,
      timeSpent: questionTimeSpent
    }

    if (currentQuestion.type === 'multiple_choice') {
      newAnswer.isCorrect = currentAnswer === currentQuestion.correctAnswer
    }

    if (existingAnswerIndex >= 0) {
      const newAnswers = [...answers]
      newAnswers[existingAnswerIndex] = newAnswer
      setAnswers(newAnswers)
    } else {
      setAnswers([...answers, newAnswer])
    }
  }

  const nextQuestion = () => {
    if (currentAnswer) {
      saveCurrentAnswer()
    }
    
    setCurrentQuestionIndex(prev => prev + 1)
    setCurrentAnswer('')
    setQuestionStartTime(Date.now())
    setQuestionTimeLeft(assessment.questions[currentQuestionIndex + 1]?.timeLimit || 0)
    setWordCount(0)
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      if (currentAnswer) {
        saveCurrentAnswer()
      }
      
      setCurrentQuestionIndex(prev => prev - 1)
      const prevAnswer = answers.find(a => a.questionId === assessment.questions[currentQuestionIndex - 1].id)
      setCurrentAnswer(prevAnswer?.answer || '')
      
      // Reset timer for previous question
      setQuestionStartTime(Date.now())
      setQuestionTimeLeft(assessment.questions[currentQuestionIndex - 1]?.timeLimit || 0)
    }
  }

  const handleSubmit = () => {
    if (!showWarning) {
      setShowWarning(true)
      return
    }

    if (currentAnswer) {
      saveCurrentAnswer()
    }

    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    const finalAnswers = [...answers]
    
    if (currentAnswer && !answers.find(a => a.questionId === currentQuestion.id)) {
      const questionTimeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
      finalAnswers.push({
        questionId: currentQuestion.id,
        type: currentQuestion.type,
        answer: currentAnswer,
        timeSpent: questionTimeSpent
      })
    }

    setIsSubmitted(true)
    onComplete(finalAnswers, calculateScore(finalAnswers), timeSpent)
  }

  const handleTextChange = (value: string) => {
    setCurrentAnswer(value)
    setWordCount(value.split(' ').filter(word => word.length > 0).length)
  }

  // Warning when time is running low
  const isTimeWarning = totalTimeLeft <= 300 // 5 minutes
  const isQuestionTimeWarning = questionTimeLeft <= 30 // 30 seconds

  if (!isStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-orange-800">{assessment.title}</CardTitle>
              <CardDescription className="text-base text-orange-700">
                {assessment.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <Timer className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <div className="font-bold text-xl">{formatTime(assessment.timeLimit)}</div>
                  <div className="text-sm text-gray-600">Total Time</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <Brain className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="font-bold text-xl">{assessment.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="font-bold text-xl">{assessment.passingScore}%</div>
                  <div className="text-sm text-gray-600">Pass Score</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-500" />
                  SITUASI REAL-WORLD PRESSURE
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {assessment.instructions}
                </p>
                <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-semibold mb-2">PERHATIAN PENTING:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Timer akan berjalan otomatis setelah Anda klik "Mulai Assessment"</li>
                        <li>Setiap pertanyaan memiliki waktu terbatas</li>
                        <li>Tidak ada jeda waktu - ini simulasi deadline nyata!</li>
                        <li>Assessment akan auto-submit jika waktu habis</li>
                        <li>Persiapkan mental untuk bekerja di bawah tekanan</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={onExit}>
                  Keluar
                </Button>
                <Button 
                  onClick={handleStart}
                  className="bg-orange-600 hover:bg-orange-700 px-8"
                >
                  <Timer className="w-4 h-4 mr-2" />
                  Mulai Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Timer Bar */}
        <Card className={`${isTimeWarning ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${isTimeWarning ? 'text-red-600' : 'text-gray-700'}`}>
                  <Clock className="w-5 h-5" />
                  <span className="font-mono text-lg">
                    {formatTime(totalTimeLeft)}
                  </span>
                  <span className="text-sm">total</span>
                </div>
                <div className={`flex items-center gap-2 ${isQuestionTimeWarning ? 'text-orange-600' : 'text-blue-600'}`}>
                  <Timer className="w-4 h-4" />
                  <span className="font-mono">
                    {formatTime(questionTimeLeft)}
                  </span>
                  <span className="text-xs">question</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {currentQuestionIndex + 1} of {assessment.totalQuestions}
                </span>
                <Badge variant={currentQuestion.difficulty === 'easy' ? 'default' : currentQuestion.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                  {currentQuestion.difficulty}
                </Badge>
              </div>
            </div>
            <Progress 
              value={(totalTimeLeft / assessment.timeLimit) * 100} 
              className={`h-2 ${isTimeWarning ? 'bg-red-100' : 'bg-gray-100'}`}
            />
          </CardContent>
        </Card>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-3">
                      Question {currentQuestionIndex + 1}
                    </CardTitle>
                    <div className="prose max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                        {currentQuestion.question}
                      </p>
                    </div>
                  </div>
                  <Flag className={`w-5 h-5 ml-4 flex-shrink-0 ${
                    currentQuestion.difficulty === 'easy' ? 'text-green-500' :
                    currentQuestion.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                </div>
                
                {currentQuestion.code && (
                  <div className="mt-4">
                    <SyntaxHighlighter
                      language="javascript"
                      style={tomorrow}
                      customStyle={{
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      {currentQuestion.code}
                    </SyntaxHighlighter>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {currentQuestion.type === 'multiple_choice' ? (
                  <RadioGroup 
                    value={currentAnswer.toString()} 
                    onValueChange={(value) => setCurrentAnswer(parseInt(value))}
                  >
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label 
                            htmlFor={`option-${index}`} 
                            className="flex-1 cursor-pointer font-mono text-sm"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Tuliskan jawaban Anda di sini... Ingat: ini simulasi kondisi deadline nyata!"
                      value={currentAnswer as string}
                      onChange={(e) => handleTextChange(e.target.value)}
                      rows={12}
                      className="resize-none"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className={`${wordCount > (currentQuestion.maxWords || 300) ? 'text-red-600' : 'text-gray-600'}`}>
                        Word count: {wordCount} / {currentQuestion.maxWords || 300}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500">Time pressure building...</span>
                        <Timer className={`w-4 h-4 ${isQuestionTimeWarning ? 'text-red-500' : 'text-gray-400'}`} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {assessment.questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentQuestionIndex
                        ? 'bg-blue-500'
                        : answers.find(a => a.questionId === assessment.questions[index].id)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  className={`${showWarning ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                >
                  {showWarning ? 'Confirm Submit' : 'Submit Assessment'}
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  disabled={!currentAnswer}
                >
                  Next Question
                </Button>
              )}
            </div>
            
            {showWarning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-red-100 border border-red-200 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold">Ready to submit?</p>
                    <p>Seperti di dunia nyata, sekali submit tidak bisa diubah lagi. Yakin dengan jawaban Anda?</p>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}