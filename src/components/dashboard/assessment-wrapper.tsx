'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Clock, 
  Target, 
  AlertTriangle, 
  Trophy, 
  Timer,
  CheckCircle,
  Lock,
  Zap,
  BookOpen
} from 'lucide-react'
import { motion } from 'framer-motion'
import AssessmentInterface from './assessment-interface'
import AssessmentResults from './assessment-results'

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
  questions: Array<{
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
  }>
  isActive: boolean
}

interface AssessmentAttempt {
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

interface AssessmentWrapperProps {
  materialId: string
  isCompleted: boolean
  onAssessmentComplete: (passed: boolean, score: number) => void
}

// Mock assessments data - in real app this would come from API
const mockAssessments: Assessment[] = [
  {
    id: "ASSESS-HTML-001",
    materialId: "MAT-FE-HTML-001",
    title: "HTML5 Semantic Elements Assessment",
    description: "Test your understanding of HTML5 semantic elements under time pressure",
    type: "mixed",
    totalQuestions: 3,
    passingScore: 70,
    timeLimit: 1200, // 20 minutes
    instructions: "Anda memiliki 20 menit untuk menyelesaikan assessment ini. Ini mensimulasikan kondisi nyata dimana developer harus mengerjakan task dengan deadline ketat. Tetap tenang dan fokus!",
    questions: [
      {
        id: "Q1",
        type: "multiple_choice",
        timeLimit: 90,
        question: "Situasi: Anda sedang membuat website berita dan harus segera menyelesaikan struktur artikel. Element HTML5 mana yang PALING tepat untuk membungkus konten artikel utama?",
        code: "<div class=\"news-content\">\n  <h1>Breaking News: Tech Industry Update</h1>\n  <p>Published on March 15, 2024</p>\n  <p>Content of the news article...</p>\n</div>",
        options: [
          "<section>",
          "<article>",
          "<main>",
          "<div>"
        ],
        correctAnswer: 1,
        explanation: "Element <article> adalah pilihan tepat untuk konten yang mandiri dan dapat didistribusikan secara terpisah seperti artikel berita.",
        difficulty: "medium"
      },
      {
        id: "Q2",
        type: "multiple_choice",
        timeLimit: 60,
        question: "DEADLINE KETAT! Client meminta navigasi website selesai dalam 2 jam. Element mana yang harus Anda gunakan untuk menu navigasi?",
        options: [
          "<nav>",
          "<menu>",
          "<ul>",
          "<div class=\"navigation\">"
        ],
        correctAnswer: 0,
        explanation: "Element <nav> adalah element semantic khusus untuk navigasi website.",
        difficulty: "easy"
      },
      {
        id: "Q3",
        type: "essay",
        timeLimit: 600,
        question: "SITUASI REAL: Anda adalah frontend developer di startup yang sedang berkembang pesat. CEO meminta Anda menjelaskan kepada tim marketing (yang tidak technical) mengapa menggunakan HTML semantic penting untuk SEO dan accessibility website mereka.\n\nTuliskan penjelasan Anda dalam 200-300 kata yang mudah dipahami oleh non-technical people. Anda punya 10 menit - persis seperti meeting dadakan yang sering terjadi di startup!",
        maxWords: 300,
        gradingCriteria: [
          "Penjelasan SEO benefit (25%)",
          "Penjelasan accessibility benefit (25%)",
          "Bahasa yang mudah dipahami non-technical (25%)",
          "Struktur penjelasan yang logis (25%)"
        ]
      }
    ],
    isActive: true
  },
  {
    id: "ASSESS-CSS-001",
    materialId: "MAT-FE-CSS-001",
    title: "CSS Flexbox Under Pressure Assessment",
    description: "Master CSS Flexbox dalam kondisi deadline ketat - seperti di dunia nyata!",
    type: "mixed",
    totalQuestions: 2,
    passingScore: 75,
    timeLimit: 900, // 15 minutes
    instructions: "15 menit untuk membuktikan kemampuan Flexbox Anda! Bayangkan ini adalah technical interview atau urgent project deadline.",
    questions: [
      {
        id: "Q1",
        type: "multiple_choice",
        timeLimit: 75,
        question: "URGENT! Layout website client rusak di mobile. Untuk membuat 3 item dalam container flex rata tengah horizontal dan vertikal, properti apa yang diperlukan?",
        code: ".container {\n  display: flex;\n  height: 200px;\n  /* Properti apa yang dibutuhkan? */\n}",
        options: [
          "justify-content: center; align-items: center;",
          "align-content: center; justify-items: center;",
          "place-items: center; place-content: center;",
          "text-align: center; vertical-align: middle;"
        ],
        correctAnswer: 0,
        explanation: "justify-content mengatur alignment horizontal (main axis), align-items mengatur alignment vertikal (cross axis).",
        difficulty: "medium"
      },
      {
        id: "Q2",
        type: "essay",
        timeLimit: 420,
        question: "PRODUCTION EMERGENCY! E-commerce website client memiliki masalah layout yang urgent. Navigation bar mereka terlihat seperti ini di mobile:\n\n[BRAND] [Menu1] [Menu2] [Menu3] [Cart]\n\nSemua item menumpuk dan tidak responsive. Client kehilangan sales!\n\nTugas Anda (7 menit):\n1. Buat CSS Flexbox solution yang membuat BRAND di kiri, Cart di kanan, dan menu di tengah\n2. Buat responsive: di mobile, sembunyikan menu dan tampilkan hamburger button\n3. Berikan code lengkap dengan media query\n\nINI REAL EMERGENCY - setiap menit delay = lost revenue!",
        maxWords: 300,
        gradingCriteria: [
          "Flexbox implementation untuk desktop (40%)",
          "Responsive solution untuk mobile (35%)",
          "Code quality dan struktur (25%)"
        ]
      }
    ],
    isActive: true
  },
  {
    id: "ASSESS-JS-001",
    materialId: "MAT-FE-JS-001",
    title: "JavaScript ES6+ Deadline Challenge",
    description: "Prove your JavaScript skills under real-world pressure!",
    type: "mixed",
    totalQuestions: 2,
    passingScore: 70,
    timeLimit: 1000, // 16+ minutes
    instructions: "16 menit untuk membuktikan skill JavaScript ES6+ Anda! Situasi ini mensimulasikan technical interview atau sprint deadline yang ketat.",
    questions: [
      {
        id: "Q1",
        type: "multiple_choice",
        timeLimit: 60,
        question: "SPRINT DEADLINE! Anda perlu filter array users yang berusia > 18 dengan cepat. Syntax ES6+ mana yang paling efisien?",
        code: "const users = [{name: 'John', age: 25}, {name: 'Jane', age: 16}];",
        options: [
          "users.filter(user => user.age > 18)",
          "users.find(user => user.age > 18)",
          "users.map(user => user.age > 18)",
          "users.forEach(user => user.age > 18)"
        ],
        correctAnswer: 0,
        explanation: "filter() returns new array dengan elements yang pass test, perfect untuk filtering data.",
        difficulty: "easy"
      },
      {
        id: "Q2",
        type: "essay",
        timeLimit: 600,
        question: "PRODUCTION BUG ALERT! 🚨\n\nUser melaporkan form registration tidak berfungsi. Code yang bermasalah:\n\n```javascript\nvar userForm = document.getElementById('form');\nvar userName = document.getElementById('name').value;\n\nsetTimeout(function() {\n  if (userName.length > 0) {\n    submitForm(userName);\n  }\n}, 2000);\n```\n\nMasalah: userName selalu empty string, bahkan setelah user mengisi form!\n\nTugas Anda (10 menit):\n1. Identifikasi root cause masalah\n2. Refactor ke ES6+ dengan proper event handling\n3. Tambahkan error handling untuk edge cases\n4. Ensure code is production-ready\n\nUser sudah complain di social media - fix this ASAP!",
        maxWords: 350,
        gradingCriteria: [
          "Problem identification (25%)",
          "ES6+ refactoring (35%)",
          "Event handling implementation (25%)",
          "Error handling dan edge cases (15%)"
        ]
      }
    ],
    isActive: true
  }
]

export default function AssessmentWrapper({
  materialId,
  isCompleted,
  onAssessmentComplete
}: AssessmentWrapperProps) {
  const [currentView, setCurrentView] = useState<'overview' | 'assessment' | 'results'>('overview')
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [lastAttempt, setLastAttempt] = useState<AssessmentAttempt | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Find assessment for this material
    const foundAssessment = mockAssessments.find(a => a.materialId === materialId)
    setAssessment(foundAssessment || null)
    
    // In real app, fetch last attempt from API
    // For now, we'll use mock data
    setLastAttempt(null)
    setIsLoading(false)
  }, [materialId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAssessmentComplete = (answers: any[], totalScore: number, timeSpent: number) => {
    const newAttempt: AssessmentAttempt = {
      id: `ATTEMPT-${Date.now()}`,
      studentId: 3, // Mock student ID
      assessmentId: assessment!.id,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      timeSpent,
      status: 'completed',
      totalScore,
      answers: answers.map(answer => ({
        questionId: answer.questionId,
        type: answer.type,
        answer: answer.answer,
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent
      })),
      createdAt: new Date().toISOString()
    }

    setLastAttempt(newAttempt)
    setCurrentView('results')
    onAssessmentComplete(totalScore >= assessment!.passingScore, totalScore)
  }

  const handleRetake = () => {
    setCurrentView('assessment')
  }

  const handleExit = () => {
    setCurrentView('overview')
  }

  if (isLoading) {
    return <div className="text-center p-8">Loading assessment...</div>
  }

  if (!assessment) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Assessment Available</h3>
          <p className="text-gray-600">Complete the learning material to unlock the assessment.</p>
        </CardContent>
      </Card>
    )
  }

  if (currentView === 'assessment') {
    return (
      <AssessmentInterface
        assessment={assessment}
        onComplete={handleAssessmentComplete}
        onExit={handleExit}
      />
    )
  }

  if (currentView === 'results' && lastAttempt) {
    return (
      <AssessmentResults
        result={lastAttempt}
        assessment={assessment}
        onRetake={handleRetake}
        onExit={handleExit}
      />
    )
  }

  // Assessment Overview
  const canTakeAssessment = isCompleted
  const hasAttempted = lastAttempt !== null
  const hasPassed = lastAttempt && lastAttempt.totalScore >= assessment.passingScore

  return (
    <div className="space-y-6">
      {/* Assessment Card */}
      <Card className={`border-2 ${
        hasPassed ? 'border-green-500 bg-green-50' : 
        hasAttempted ? 'border-orange-500 bg-orange-50' : 
        'border-blue-500 bg-blue-50'
      }`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  hasPassed ? 'bg-green-500' : 
                  hasAttempted ? 'bg-orange-500' : 
                  'bg-blue-500'
                }`}>
                  {hasPassed ? (
                    <Trophy className="w-6 h-6 text-white" />
                  ) : hasAttempted ? (
                    <AlertTriangle className="w-6 h-6 text-white" />
                  ) : (
                    <Brain className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle className={`text-xl ${
                    hasPassed ? 'text-green-800' : 
                    hasAttempted ? 'text-orange-800' : 
                    'text-blue-800'
                  }`}>
                    {assessment.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {assessment.description}
                  </CardDescription>
                </div>
              </div>
            </div>
            {hasPassed && (
              <Badge className="bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Passed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-lg">
              <Timer className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="font-bold">{formatTime(assessment.timeLimit)}</div>
              <div className="text-sm text-gray-600">Time Limit</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Brain className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="font-bold">{assessment.totalQuestions}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="font-bold">{assessment.passingScore}%</div>
              <div className="text-sm text-gray-600">Pass Score</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Zap className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="font-bold">{assessment.type.toUpperCase()}</div>
              <div className="text-sm text-gray-600">Format</div>
            </div>
          </div>

          {/* Last Attempt Info */}
          {lastAttempt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg mb-4 ${
                hasPassed ? 'bg-green-100 border border-green-200' : 'bg-orange-100 border border-orange-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-semibold ${hasPassed ? 'text-green-800' : 'text-orange-800'}`}>
                    Last Attempt: {lastAttempt.totalScore}%
                  </h4>
                  <p className={`text-sm ${hasPassed ? 'text-green-700' : 'text-orange-700'}`}>
                    Completed in {formatTime(lastAttempt.timeSpent)} • {
                      hasPassed ? `Passed by ${lastAttempt.totalScore - assessment.passingScore}%` : 
                      `Need ${assessment.passingScore - lastAttempt.totalScore}% more to pass`
                    }
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentView('results')}
                  className={hasPassed ? 'border-green-500 text-green-700' : 'border-orange-500 text-orange-700'}
                >
                  View Results
                </Button>
              </div>
            </motion.div>
          )}

          {/* Real-world Simulation Notice */}
          <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">⚠️ REAL-WORLD SIMULATION</p>
                <p>
                  Assessment ini dirancang untuk mensimulasikan tekanan waktu seperti di dunia kerja nyata:
                  technical interviews, sprint deadlines, dan situasi emergency debugging.
                  <strong> Tidak ada pause button - seperti kondisi nyata!</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            {!canTakeAssessment ? (
              <div className="flex items-center justify-center gap-3 text-gray-600">
                <Lock className="w-5 h-5" />
                <span>Complete the learning material first to unlock assessment</span>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => setCurrentView('assessment')}
                  className={`px-8 py-3 text-lg ${
                    hasAttempted ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Timer className="w-5 h-5 mr-2" />
                  {hasAttempted ? 'Retake Assessment' : 'Start Assessment'}
                </Button>
                {hasAttempted && !hasPassed && (
                  <p className="text-sm text-orange-600">
                    💡 Tip: Review the material again before retaking. Focus on areas you found challenging.
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}