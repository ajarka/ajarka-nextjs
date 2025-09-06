'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  Eye,
  Code,
  ChevronRight,
  ChevronLeft,
  Target,
  Lightbulb,
  Terminal,
  Clipboard,
  ExternalLink,
  Zap,
  Brain
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import AssessmentWrapper from './assessment-wrapper'

interface Resource {
  type: string
  title: string
  url?: string
  content?: string
  duration?: number
  code?: string
  language?: string
  example?: string
  interactive?: boolean
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
  resources: Resource[]
  isActive: boolean
  createdAt: string
  content?: {
    introduction: string
    visualExample?: {
      title: string
      before: string
      after: string
    }
    interactiveDemo?: {
      title: string
      instructions: string
      template: string
      solution: string
    }
    keyElements?: Array<{
      element?: string
      concept?: string
      property?: string
      description: string
      example: string
      useCase: string
    }>
  }
}

interface CourseMaterialViewerProps {
  material: LearningMaterial
  isCompleted: boolean
  onComplete: () => void
  onNext: () => void
  onPrevious: () => void
  hasNext: boolean
  hasPrevious: boolean
}

// Get rich content from API - if no content field, use fallback
const getRichContent = (material: LearningMaterial) => {
  // If material has content field, use it
  if (material.content) {
    return material.content
  }
  
  // Fallback for materials without content field
  return {
    introduction: `# ${material.title}\n\n${material.description}`,
    keyElements: []
  }
}

export default function CourseMaterialViewer({
  material,
  isCompleted,
  onComplete,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: CourseMaterialViewerProps) {
  const [activeTab, setActiveTab] = useState('learn')
  const [showSolution, setShowSolution] = useState(false)
  const [userCode, setUserCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [assessmentPassed, setAssessmentPassed] = useState(false)

  const richContent = getRichContent(material)

  useEffect(() => {
    if (richContent.interactiveDemo) {
      setUserCode(richContent.interactiveDemo.template)
    }
  }, [material.id])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderMarkdown = (content: string) => {
    // Simple markdown renderer for demo purposes
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold mb-4 text-gray-900">{line.slice(2)}</h1>
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold mb-3 text-gray-800">{line.slice(3)}</h2>
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold mb-2 text-gray-700">{line.slice(4)}</h3>
        }
        if (line.startsWith('🎯') || line.startsWith('🔍') || line.startsWith('🧠') || line.startsWith('📱') || line.startsWith('🎨') || line.startsWith('📐') || line.startsWith('🔧') || line.startsWith('⚡') || line.startsWith('🧩')) {
          return <div key={index} className="flex items-start gap-2 mb-2 text-gray-700">{line}</div>
        }
        if (line.includes('`') && !line.includes('```')) {
          const parts = line.split('`')
          return (
            <p key={index} className="mb-2 text-gray-700 leading-relaxed">
              {parts.map((part, i) => 
                i % 2 === 0 ? part : <code key={i} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-blue-600">{part}</code>
              )}
            </p>
          )
        }
        if (line.trim() === '') {
          return <br key={index} />
        }
        return <p key={index} className="mb-2 text-gray-700 leading-relaxed">{line}</p>
      })
  }

  return (
    <div className="space-y-6">
      {/* Material Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="text-xs">
                  Level {material.level}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {material.category.toUpperCase()}
                </Badge>
                {isCompleted && (
                  <Badge variant="default" className="text-xs bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl mb-2">{material.title}</CardTitle>
              <CardDescription className="text-base">
                {material.description}
              </CardDescription>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {material.estimatedHours}h estimated
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {material.learningObjectives.length} objectives
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {material.learningObjectives.map((objective, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{objective}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="learn" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Learn
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Examples
          </TabsTrigger>
          <TabsTrigger value="practice" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Practice
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Assessment
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* Learn Tab */}
        <TabsContent value="learn" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                {renderMarkdown(richContent.introduction)}
              </div>
            </CardContent>
          </Card>

          {richContent.keyElements && richContent.keyElements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Key Concepts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {richContent.keyElements.map((element: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
                          <Terminal className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-mono text-lg font-semibold text-blue-600 mb-2">
                            {element.element || element.concept || element.property}
                          </h4>
                          <p className="text-gray-700 mb-3">{element.description}</p>
                          <div className="bg-gray-50 rounded-lg p-3 mb-2">
                            <SyntaxHighlighter
                              language={material.category === 'frontend' && material.level <= 2 ? 'html' : material.category === 'frontend' && material.level <= 5 ? 'css' : 'javascript'}
                              style={tomorrow}
                              customStyle={{
                                background: 'transparent',
                                padding: 0,
                                margin: 0,
                                fontSize: '14px'
                              }}
                            >
                              {element.example}
                            </SyntaxHighlighter>
                          </div>
                          <p className="text-sm text-gray-600">
                            <strong>Use case:</strong> {element.useCase}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          {richContent.visualExample && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-500" />
                  {richContent.visualExample.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">❌ Before</h4>
                    <div className="relative">
                      <SyntaxHighlighter
                        language={material.category === 'frontend' && material.level <= 2 ? 'html' : material.category === 'frontend' && material.level <= 5 ? 'css' : 'javascript'}
                        style={tomorrow}
                        customStyle={{
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      >
                        {richContent.visualExample.before}
                      </SyntaxHighlighter>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(richContent.visualExample.before)}
                      >
                        <Clipboard className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">✅ After</h4>
                    <div className="relative">
                      <SyntaxHighlighter
                        language={material.category === 'frontend' && material.level <= 2 ? 'html' : material.category === 'frontend' && material.level <= 5 ? 'css' : 'javascript'}
                        style={tomorrow}
                        customStyle={{
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      >
                        {richContent.visualExample.after}
                      </SyntaxHighlighter>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(richContent.visualExample.after)}
                      >
                        <Clipboard className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice" className="space-y-6">
          {richContent.interactiveDemo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  {richContent.interactiveDemo.title}
                </CardTitle>
                <CardDescription>
                  {richContent.interactiveDemo.instructions}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Your Code:</h4>
                    <div className="relative">
                      <SyntaxHighlighter
                        language={material.category === 'frontend' && material.level <= 2 ? 'html' : material.category === 'frontend' && material.level <= 5 ? 'css' : 'javascript'}
                        style={tomorrow}
                        customStyle={{
                          borderRadius: '8px',
                          fontSize: '14px',
                          maxHeight: '300px'
                        }}
                      >
                        {userCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowSolution(!showSolution)}
                    >
                      {showSolution ? 'Hide' : 'Show'} Solution
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setUserCode(richContent.interactiveDemo.template)}
                    >
                      Reset
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showSolution && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-2 text-green-600">✅ Solution:</h4>
                          <SyntaxHighlighter
                            language={material.category === 'frontend' && material.level <= 2 ? 'html' : material.category === 'frontend' && material.level <= 5 ? 'css' : 'javascript'}
                            style={tomorrow}
                            customStyle={{
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}
                          >
                            {richContent.interactiveDemo.solution}
                          </SyntaxHighlighter>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment" className="space-y-6">
          <AssessmentWrapper
            materialId={material.id}
            isCompleted={isCompleted}
            onAssessmentComplete={(passed, score) => {
              setAssessmentPassed(passed)
              if (passed && !isCompleted) {
                onComplete()
              }
            }}
          />
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
              <CardDescription>
                External links and materials to deepen your understanding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {material.resources.map((resource, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
                      {resource.type === 'video' && <PlayCircle className="w-5 h-5 text-blue-600" />}
                      {resource.type === 'article' && <BookOpen className="w-5 h-5 text-blue-600" />}
                      {resource.type === 'documentation' && <Terminal className="w-5 h-5 text-blue-600" />}
                      {resource.type === 'interactive' && <Zap className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{resource.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</p>
                      {resource.duration && (
                        <p className="text-xs text-gray-500">{resource.duration} minutes</p>
                      )}
                    </div>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation & Completion */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={onNext}
                disabled={!hasNext}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              onClick={onComplete}
              disabled={isCompleted}
              className={`flex items-center gap-2 ${
                isCompleted 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}