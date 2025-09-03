export interface LearningMaterial {
  id: string
  title: string
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'devops' | 'data'
  subcategory: 'fundamental' | 'framework' | 'advanced' | 'specialization'
  level: number
  prerequisites: string[]
  estimatedHours: number
  meetingsRequired: number
  description: string
  learningObjectives: string[]
  resources: {
    type: 'video' | 'article' | 'documentation' | 'tool'
    title: string
    url: string
    duration: number
  }[]
  assignments: string[]
  projects: string[]
  skills: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LearningJourney {
  id: string
  title: string
  description: string
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'devops' | 'data'
  totalLevels: number
  estimatedDuration: string
  phases: {
    id: string
    title: string
    description: string
    levels: [number, number]
    materials: string[]
    assignments: string[]
    projects: string[]
    estimatedDuration: string
  }[]
  prerequisites: string[]
  skills: string[]
  certificationProject: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  materialId: string
  journeyId: string
  level: number
  type: 'coding' | 'quiz' | 'project' | 'essay'
  instructions: string
  requirements: string[]
  submissionFormat: 'github_repo' | 'file_upload' | 'text' | 'video'
  maxAttempts: number
  passingScore: number
  timeLimit: number
  resources: string[]
  rubric: {
    criteria: string
    points: number
    description: string
  }[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  type: 'individual' | 'group' | 'capstone'
  level: number
  journeyId: string
  prerequisites: string[]
  estimatedHours: number
  requirements: string[]
  submissionRequirements: {
    githubRepo: boolean
    liveDemo: boolean
    videoExplanation: {
      required: boolean
      maxDuration: number
      topics: string[]
    }
    documentation: boolean
  }
  evaluationCriteria: {
    name: string
    weight: number
    description: string
  }[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StudentProgress {
  id: string
  studentId: number
  journeyId: string
  currentLevel: number
  currentPhase: string
  status: 'active' | 'paused' | 'completed' | 'dropped'
  startedAt: string
  completedMaterials: string[]
  completedAssignments: {
    assignmentId: string
    score: number
    attempts: number
    completedAt: string
    feedback: string
    submissionUrl?: string
  }[]
  completedProjects: {
    projectId: string
    score: number
    submissionUrl: string
    liveUrl?: string
    videoUrl?: string
    completedAt: string
    feedback: string
  }[]
  skillsAcquired: string[]
  certificates: string[]
  nextMaterial: string
  estimatedCompletion: string
  updatedAt: string
}

export interface LevelVerification {
  id: string
  studentId: number
  journeyId: string
  currentLevel: number
  targetLevel: number
  type: 'level_jump' | 'skill_assessment'
  status: 'pending' | 'in_review' | 'approved' | 'rejected'
  requirements: {
    type: 'assignment' | 'project'
    assignmentId?: string
    projectId?: string
    status: 'pending' | 'completed'
    score: number | null
  }[]
  submissions: {
    type: 'github_project' | 'video_explanation' | 'documentation'
    url: string
    liveUrl?: string
    duration?: number
    submittedAt: string
  }[]
  reviewedBy: number | null
  reviewedAt: string | null
  feedback: string | null
  approvedLevel: number | null
  createdAt: string
  updatedAt: string
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: number
  submissionUrl: string
  submissionContent?: string
  status: 'pending' | 'graded' | 'revision_needed'
  score: number | null
  feedback: string | null
  attempt: number
  submittedAt: string
  gradedAt: string | null
  gradedBy: number | null
}

export interface ProjectSubmission {
  id: string
  projectId: string
  studentId: number
  githubUrl: string
  liveUrl?: string
  videoUrl?: string
  documentationUrl?: string
  status: 'pending' | 'graded' | 'revision_needed'
  score: number | null
  feedback: string | null
  submittedAt: string
  gradedAt: string | null
  gradedBy: number | null
}

class LearningService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  }

  // Learning Materials
  async getLearningMaterials(): Promise<LearningMaterial[]> {
    const response = await fetch(`${this.baseUrl}/learning_materials`)
    if (!response.ok) throw new Error('Failed to fetch learning materials')
    return response.json()
  }

  async getLearningMaterial(id: string): Promise<LearningMaterial> {
    const response = await fetch(`${this.baseUrl}/learning_materials/${id}`)
    if (!response.ok) throw new Error('Failed to fetch learning material')
    return response.json()
  }

  async createLearningMaterial(material: Omit<LearningMaterial, 'id' | 'createdAt' | 'updatedAt'>): Promise<LearningMaterial> {
    const newMaterial = {
      ...material,
      id: `MAT-${material.category.toUpperCase()}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${this.baseUrl}/learning_materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMaterial)
    })

    if (!response.ok) throw new Error('Failed to create learning material')
    return response.json()
  }

  async updateLearningMaterial(id: string, updates: Partial<LearningMaterial>): Promise<LearningMaterial> {
    const response = await fetch(`${this.baseUrl}/learning_materials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, updatedAt: new Date().toISOString() })
    })

    if (!response.ok) throw new Error('Failed to update learning material')
    return response.json()
  }

  async deleteLearningMaterial(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/learning_materials/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) throw new Error('Failed to delete learning material')
  }

  // Learning Journeys
  async getLearningJourneys(): Promise<LearningJourney[]> {
    const response = await fetch(`${this.baseUrl}/learning_journeys`)
    if (!response.ok) throw new Error('Failed to fetch learning journeys')
    return response.json()
  }

  async getLearningJourney(id: string): Promise<LearningJourney> {
    const response = await fetch(`${this.baseUrl}/learning_journeys/${id}`)
    if (!response.ok) throw new Error('Failed to fetch learning journey')
    return response.json()
  }

  async createLearningJourney(journey: Omit<LearningJourney, 'id' | 'createdAt' | 'updatedAt'>): Promise<LearningJourney> {
    const newJourney = {
      ...journey,
      id: `JOURNEY-${journey.category.toUpperCase()}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${this.baseUrl}/learning_journeys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJourney)
    })

    if (!response.ok) throw new Error('Failed to create learning journey')
    return response.json()
  }

  // Assignments
  async getAssignments(): Promise<Assignment[]> {
    const response = await fetch(`${this.baseUrl}/assignments`)
    if (!response.ok) throw new Error('Failed to fetch assignments')
    return response.json()
  }

  async getAssignment(id: string): Promise<Assignment> {
    const response = await fetch(`${this.baseUrl}/assignments/${id}`)
    if (!response.ok) throw new Error('Failed to fetch assignment')
    return response.json()
  }

  async createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assignment> {
    const newAssignment = {
      ...assignment,
      id: `ASS-${assignment.materialId.split('-')[1]}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${this.baseUrl}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssignment)
    })

    if (!response.ok) throw new Error('Failed to create assignment')
    return response.json()
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${this.baseUrl}/projects`)
    if (!response.ok) throw new Error('Failed to fetch projects')
    return response.json()
  }

  async getProject(id: string): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`)
    if (!response.ok) throw new Error('Failed to fetch project')
    return response.json()
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const newProject = {
      ...project,
      id: `PROJ-${project.journeyId.split('-')[1]}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${this.baseUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject)
    })

    if (!response.ok) throw new Error('Failed to create project')
    return response.json()
  }

  // Student Progress
  async getStudentProgress(studentId: number): Promise<StudentProgress[]> {
    const response = await fetch(`${this.baseUrl}/student_progress?studentId=${studentId}`)
    if (!response.ok) throw new Error('Failed to fetch student progress')
    return response.json()
  }

  async getJourneyProgress(studentId: number, journeyId: string): Promise<StudentProgress | null> {
    const progressList = await this.getStudentProgress(studentId)
    return progressList.find(p => p.journeyId === journeyId) || null
  }

  async updateStudentProgress(progressId: string, updates: Partial<StudentProgress>): Promise<StudentProgress> {
    const response = await fetch(`${this.baseUrl}/student_progress/${progressId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, updatedAt: new Date().toISOString() })
    })

    if (!response.ok) throw new Error('Failed to update student progress')
    return response.json()
  }

  async startJourney(studentId: number, journeyId: string): Promise<StudentProgress> {
    const newProgress = {
      id: `PROGRESS-STUDENT-${studentId}`,
      studentId,
      journeyId,
      currentLevel: 1,
      currentPhase: 'PHASE-1',
      status: 'active' as const,
      startedAt: new Date().toISOString(),
      completedMaterials: [],
      completedAssignments: [],
      completedProjects: [],
      skillsAcquired: [],
      certificates: [],
      nextMaterial: '',
      estimatedCompletion: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 4 months
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${this.baseUrl}/student_progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProgress)
    })

    if (!response.ok) throw new Error('Failed to start journey')
    return response.json()
  }

  // Level Verification
  async getLevelVerifications(studentId?: number): Promise<LevelVerification[]> {
    const url = studentId 
      ? `${this.baseUrl}/level_verifications?studentId=${studentId}`
      : `${this.baseUrl}/level_verifications`
    
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch level verifications')
    return response.json()
  }

  async createLevelVerification(verification: Omit<LevelVerification, 'id' | 'createdAt' | 'updatedAt'>): Promise<LevelVerification> {
    const newVerification = {
      ...verification,
      id: `VERIFICATION-${verification.studentId}-${verification.journeyId.split('-')[1]}-${verification.targetLevel}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${this.baseUrl}/level_verifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVerification)
    })

    if (!response.ok) throw new Error('Failed to create level verification')
    return response.json()
  }

  async updateLevelVerification(id: string, updates: Partial<LevelVerification>): Promise<LevelVerification> {
    const response = await fetch(`${this.baseUrl}/level_verifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, updatedAt: new Date().toISOString() })
    })

    if (!response.ok) throw new Error('Failed to update level verification')
    return response.json()
  }

  // Assignment Submissions
  async submitAssignment(submission: Omit<AssignmentSubmission, 'id' | 'submittedAt'>): Promise<AssignmentSubmission> {
    const newSubmission = {
      ...submission,
      id: `SUB-ASS-${submission.assignmentId}-${submission.studentId}-${Date.now()}`,
      submittedAt: new Date().toISOString()
    }

    const response = await fetch(`${this.baseUrl}/assignment_submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubmission)
    })

    if (!response.ok) throw new Error('Failed to submit assignment')
    return response.json()
  }

  // Project Submissions
  async submitProject(submission: Omit<ProjectSubmission, 'id' | 'submittedAt'>): Promise<ProjectSubmission> {
    const newSubmission = {
      ...submission,
      id: `SUB-PROJ-${submission.projectId}-${submission.studentId}-${Date.now()}`,
      submittedAt: new Date().toISOString()
    }

    const response = await fetch(`${this.baseUrl}/project_submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubmission)
    })

    if (!response.ok) throw new Error('Failed to submit project')
    return response.json()
  }

  // Utility Methods
  async getMaterialsByCategory(category: string): Promise<LearningMaterial[]> {
    const materials = await this.getLearningMaterials()
    return materials.filter(material => material.category === category && material.isActive)
  }

  async getMaterialsByLevel(minLevel: number, maxLevel: number): Promise<LearningMaterial[]> {
    const materials = await this.getLearningMaterials()
    return materials.filter(material => 
      material.level >= minLevel && 
      material.level <= maxLevel && 
      material.isActive
    )
  }

  async getNextMaterials(studentId: number, journeyId: string): Promise<LearningMaterial[]> {
    const progress = await this.getJourneyProgress(studentId, journeyId)
    if (!progress) return []

    const journey = await this.getLearningJourney(journeyId)
    const allMaterials = await this.getLearningMaterials()

    // Find current phase
    const currentPhase = journey.phases.find(phase => phase.id === progress.currentPhase)
    if (!currentPhase) return []

    // Get materials not yet completed in current phase
    const nextMaterials = currentPhase.materials
      .filter(materialId => !progress.completedMaterials.includes(materialId))
      .map(materialId => allMaterials.find(m => m.id === materialId))
      .filter(Boolean) as LearningMaterial[]

    return nextMaterials
  }

  async canAccessMaterial(studentId: number, materialId: string): Promise<boolean> {
    const material = await this.getLearningMaterial(materialId)
    if (!material.prerequisites.length) return true

    const progressList = await this.getStudentProgress(studentId)
    const completedMaterials = progressList.flatMap(p => p.completedMaterials)

    return material.prerequisites.every(prerequisite => 
      completedMaterials.includes(prerequisite)
    )
  }

  async calculateJourneyProgress(studentId: number, journeyId: string): Promise<{
    completionPercentage: number
    currentLevel: number
    totalLevels: number
    skillsAcquired: string[]
    estimatedCompletion: string
  }> {
    const progress = await this.getJourneyProgress(studentId, journeyId)
    const journey = await this.getLearningJourney(journeyId)

    if (!progress) {
      return {
        completionPercentage: 0,
        currentLevel: 0,
        totalLevels: journey.totalLevels,
        skillsAcquired: [],
        estimatedCompletion: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString()
      }
    }

    const completionPercentage = (progress.currentLevel / journey.totalLevels) * 100

    return {
      completionPercentage,
      currentLevel: progress.currentLevel,
      totalLevels: journey.totalLevels,
      skillsAcquired: progress.skillsAcquired,
      estimatedCompletion: progress.estimatedCompletion
    }
  }
}

export const learningService = new LearningService()