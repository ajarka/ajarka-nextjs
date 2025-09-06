'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  Lock, 
  PlayCircle,
  Clock,
  Target,
  ChevronRight,
  Zap,
  Brain,
  Lightbulb
} from 'lucide-react'
import { motion } from 'framer-motion'

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
  isActive: boolean
}

interface InteractiveLearningPathProps {
  materials: LearningMaterial[]
  completedMaterials: string[]
  currentMaterialId?: string
  onMaterialSelect: (material: LearningMaterial) => void
}

// Learning path metadata
const pathMetadata = {
  frontend: {
    title: "Frontend Development Journey",
    description: "Master modern frontend development from HTML basics to advanced React patterns",
    color: "bg-blue-500",
    icon: <Brain className="w-6 h-6" />,
    phases: [
      {
        name: "Foundation",
        description: "HTML, CSS, and JavaScript fundamentals",
        color: "bg-green-500",
        levels: [1, 2, 3]
      },
      {
        name: "Advanced Styling",
        description: "Modern CSS techniques and frameworks",
        color: "bg-purple-500",
        levels: [4, 5, 6]
      },
      {
        name: "JavaScript Mastery",
        description: "Advanced JS concepts and ES6+",
        color: "bg-orange-500",
        levels: [7, 8, 9]
      },
      {
        name: "React Ecosystem",
        description: "React, state management, and tools",
        color: "bg-blue-500",
        levels: [10, 11, 12]
      }
    ]
  },
  backend: {
    title: "Backend Development Journey",
    description: "Build robust server-side applications and APIs",
    color: "bg-green-500",
    icon: <Zap className="w-6 h-6" />,
    phases: [
      {
        name: "Server Fundamentals",
        description: "Node.js, Express, and API basics",
        color: "bg-green-500",
        levels: [1, 2, 3]
      },
      {
        name: "Database Mastery",
        description: "SQL, NoSQL, and data modeling",
        color: "bg-blue-500",
        levels: [4, 5, 6]
      },
      {
        name: "Advanced Backend",
        description: "Authentication, security, and scaling",
        color: "bg-purple-500",
        levels: [7, 8, 9]
      },
      {
        name: "DevOps & Deployment",
        description: "CI/CD, containers, and cloud services",
        color: "bg-orange-500",
        levels: [10, 11, 12]
      }
    ]
  },
  fullstack: {
    title: "Full-Stack Development Journey",
    description: "Complete web development from frontend to backend",
    color: "bg-purple-500",
    icon: <Lightbulb className="w-6 h-6" />,
    phases: [
      {
        name: "Frontend Basics",
        description: "HTML, CSS, JavaScript essentials",
        color: "bg-blue-500",
        levels: [1, 2, 3]
      },
      {
        name: "Backend Basics",
        description: "Server-side programming fundamentals",
        color: "bg-green-500",
        levels: [4, 5, 6]
      },
      {
        name: "Integration",
        description: "Connecting frontend and backend",
        color: "bg-purple-500",
        levels: [7, 8, 9]
      },
      {
        name: "Advanced Topics",
        description: "Performance, security, and deployment",
        color: "bg-orange-500",
        levels: [10, 11, 12]
      }
    ]
  }
}

export default function InteractiveLearningPath({
  materials,
  completedMaterials,
  currentMaterialId,
  onMaterialSelect
}: InteractiveLearningPathProps) {
  const [selectedPhase, setSelectedPhase] = useState<number>(0)

  // Determine the category based on materials
  const category = materials.length > 0 ? materials[0].category : 'frontend'
  const pathData = pathMetadata[category as keyof typeof pathMetadata] || pathMetadata.frontend

  // Group materials by phases based on level
  const groupedMaterials = pathData.phases.map(phase => ({
    ...phase,
    materials: materials.filter(material => 
      phase.levels.includes(material.level)
    ).sort((a, b) => a.level - b.level)
  }))

  const calculatePhaseProgress = (phaseMaterials: LearningMaterial[]) => {
    if (phaseMaterials.length === 0) return 0
    const completed = phaseMaterials.filter(material => 
      completedMaterials.includes(material.id)
    ).length
    return Math.round((completed / phaseMaterials.length) * 100)
  }

  const isUnlocked = (material: LearningMaterial) => {
    // Check if all prerequisites are completed
    if (material.prerequisites.length === 0) return true
    
    const materialIndex = materials.findIndex(m => m.id === material.id)
    if (materialIndex === 0) return true
    
    // Check if previous material is completed
    const prevMaterial = materials[materialIndex - 1]
    return prevMaterial ? completedMaterials.includes(prevMaterial.id) : true
  }

  const getMaterialStatus = (material: LearningMaterial) => {
    const completed = completedMaterials.includes(material.id)
    const current = currentMaterialId === material.id
    const unlocked = isUnlocked(material)

    return { completed, current, unlocked }
  }

  const overallProgress = materials.length > 0 
    ? Math.round((completedMaterials.length / materials.length) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Path Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className={`${pathData.color} text-white overflow-hidden`}>
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-4">
              {pathData.icon}
              <div>
                <h2 className="text-2xl font-bold">{pathData.title}</h2>
                <p className="text-white/90">{pathData.description}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">{materials.length}</div>
                <div className="text-sm opacity-90">Total Materials</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">{completedMaterials.length}</div>
                <div className="text-sm opacity-90">Completed</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">{overallProgress}%</div>
                <div className="text-sm opacity-90">Progress</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3 bg-white/20" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Phase Navigation */}
      <div className="flex flex-wrap gap-2">
        {pathData.phases.map((phase, index) => {
          const phaseMaterials = groupedMaterials[index].materials
          const phaseProgress = calculatePhaseProgress(phaseMaterials)
          
          return (
            <Button
              key={index}
              variant={selectedPhase === index ? "default" : "outline"}
              onClick={() => setSelectedPhase(index)}
              className="flex items-center gap-2"
            >
              <div className={`w-3 h-3 rounded-full ${phase.color}`} />
              {phase.name}
              <Badge variant="secondary" className="ml-1">
                {phaseProgress}%
              </Badge>
            </Button>
          )
        })}
      </div>

      {/* Selected Phase Content */}
      <motion.div
        key={selectedPhase}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-4 h-4 rounded-full ${pathData.phases[selectedPhase].color}`} />
                <h3 className="text-xl font-semibold">{pathData.phases[selectedPhase].name}</h3>
              </div>
              <p className="text-gray-600">{pathData.phases[selectedPhase].description}</p>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Phase Progress</span>
                  <span>{calculatePhaseProgress(groupedMaterials[selectedPhase].materials)}%</span>
                </div>
                <Progress 
                  value={calculatePhaseProgress(groupedMaterials[selectedPhase].materials)} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Materials in Selected Phase */}
            <div className="space-y-4">
              {groupedMaterials[selectedPhase].materials.map((material, index) => {
                const { completed, current, unlocked } = getMaterialStatus(material)
                
                return (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative border rounded-lg p-4 transition-all duration-200 ${
                      current 
                        ? 'border-blue-500 bg-blue-50' 
                        : completed
                        ? 'border-green-500 bg-green-50'
                        : unlocked
                        ? 'border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer'
                        : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                    onClick={() => unlocked && onMaterialSelect(material)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {completed ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : current ? (
                          <PlayCircle className="w-6 h-6 text-blue-500" />
                        ) : unlocked ? (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                            <span className="text-xs font-bold">{material.level}</span>
                          </div>
                        ) : (
                          <Lock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className={`font-semibold mb-1 ${
                              unlocked ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {material.title}
                            </h4>
                            <p className={`text-sm ${
                              unlocked ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {material.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" size="sm">
                              Level {material.level}
                            </Badge>
                            {completed && (
                              <Badge className="bg-green-600" size="sm">
                                Completed
                              </Badge>
                            )}
                            {current && (
                              <Badge className="bg-blue-600" size="sm">
                                Current
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {material.estimatedHours}h
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {material.learningObjectives.length} objectives
                          </div>
                          {material.prerequisites.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span>Prerequisites: {material.prerequisites.length}</span>
                            </div>
                          )}
                        </div>

                        {!unlocked && material.prerequisites.length > 0 && (
                          <div className="mt-2 text-xs text-orange-600">
                            Complete previous materials to unlock
                          </div>
                        )}
                      </div>

                      {/* Action Arrow */}
                      {unlocked && (
                        <div className="flex-shrink-0">
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Connection Line */}
                    {index < groupedMaterials[selectedPhase].materials.length - 1 && (
                      <div className="absolute left-7 top-full w-0.5 h-4 bg-gray-200" />
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Phase Completion Message */}
            {calculatePhaseProgress(groupedMaterials[selectedPhase].materials) === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-green-100 border border-green-200 rounded-lg text-center"
              >
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800">Phase Completed! 🎉</h4>
                <p className="text-sm text-green-700">
                  You've mastered all materials in the {pathData.phases[selectedPhase].name} phase.
                  {selectedPhase < pathData.phases.length - 1 && " Ready for the next phase?"}
                </p>
                {selectedPhase < pathData.phases.length - 1 && (
                  <Button
                    onClick={() => setSelectedPhase(selectedPhase + 1)}
                    className="mt-3"
                    size="sm"
                  >
                    Continue to {pathData.phases[selectedPhase + 1].name}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}