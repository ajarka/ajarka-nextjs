// Student Level Management Service
export interface StudentProgress {
  id: string
  studentId: number
  journeyId: string
  currentLevel: number
  currentPhase: string
  status: 'active' | 'completed' | 'paused'
  startedAt: string
  completedMaterials: string[]
  completedAssignments: Array<{
    assignmentId: string
    score: number
    attempts: number
    completedAt: string
    feedback: string
    submissionUrl: string
  }>
  completedProjects: Array<{
    projectId: string
    score: number
    submissionUrl: string
    liveUrl?: string
    videoUrl?: string
    completedAt: string
    feedback: string
  }>
  skillsAcquired: string[]
  certificates: string[]
  nextMaterial?: string
  totalScore: number
  averageScore: number
  lastActivityAt: string
  createdAt: string
  updatedAt: string
}

export interface LevelVerification {
  id: string
  studentId: number
  journeyId: string
  currentLevel: number
  targetLevel: number
  type: 'level_jump' | 'regular_assessment'
  status: 'pending' | 'in_progress' | 'approved' | 'rejected'
  requirements: Array<{
    type: 'assignment' | 'project' | 'assessment'
    assignmentId?: string
    projectId?: string
    assessmentId?: string
    status: 'pending' | 'completed' | 'passed' | 'failed'
    score: number | null
  }>
  submissions: Array<{
    requirementId: string
    submissionUrl: string
    submittedAt: string
    feedback?: string
  }>
  reviewedBy?: number
  reviewedAt?: string
  feedback?: string
  approvedLevel?: number
  createdAt: string
  updatedAt: string
}

export interface MentorScheduleWithLevels extends MentorSchedule {
  materialIds?: string[]
  requiredLevel?: number
  maxLevelGap?: number
  verificationRequired?: boolean
  autoLevelCheck?: boolean
  allowLevelJumpers?: boolean
}

export interface MentorSchedule {
  id: number
  mentorId: number
  title: string
  description: string
  duration: number
  maxCapacity: number
  materials: string[]
  meetingType: 'online' | 'offline'
  meetingProvider: 'zoom' | 'google-meet'
  timezone: string
  isActive: boolean
}

export interface LevelCheckResult {
  canBook: boolean
  reason?: string
  suggestedAction?: string
  requiredLevel: number
  studentLevel: number
  hasVerification?: boolean
  verificationStatus?: string
}

export class StudentLevelService {
  private static readonly BASE_URL = 'http://localhost:3001'

  // Get student's current progress and level
  static async getStudentProgress(studentId: number): Promise<StudentProgress | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/student_progress?studentId=${studentId}`)
      const progressData = await response.json()
      
      if (progressData.length === 0) {
        // If no progress exists, return default beginner level
        return {
          id: `PROGRESS-STUDENT-${studentId}`,
          studentId,
          journeyId: 'JOURNEY-DEFAULT-001',
          currentLevel: 1,
          currentPhase: 'PHASE-0',
          status: 'active',
          startedAt: new Date().toISOString(),
          completedMaterials: [],
          completedAssignments: [],
          completedProjects: [],
          skillsAcquired: [],
          certificates: [],
          totalScore: 0,
          averageScore: 0,
          lastActivityAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
      
      return progressData[0]
    } catch (error) {
      console.error('Error fetching student progress:', error)
      return null
    }
  }

  // Check if student meets level requirements for a schedule
  static async checkLevelRequirement(
    studentId: number, 
    schedule: MentorScheduleWithLevels
  ): Promise<LevelCheckResult> {
    try {
      // If no level requirements are set, allow booking
      if (!schedule.requiredLevel || !schedule.autoLevelCheck) {
        return {
          canBook: true,
          requiredLevel: schedule.requiredLevel || 1,
          studentLevel: 1
        }
      }

      const studentProgress = await this.getStudentProgress(studentId)
      if (!studentProgress) {
        return {
          canBook: false,
          reason: 'Student progress not found',
          suggestedAction: 'Complete your learning profile setup',
          requiredLevel: schedule.requiredLevel,
          studentLevel: 0
        }
      }

      const studentLevel = studentProgress.currentLevel
      const requiredLevel = schedule.requiredLevel

      // Check if student meets minimum level requirement
      if (studentLevel < requiredLevel) {
        // Check if level verification is allowed for jumpers
        if (schedule.allowLevelJumpers) {
          const verification = await this.getLevelVerification(studentId, requiredLevel)
          if (verification && verification.status === 'approved') {
            return {
              canBook: true,
              requiredLevel,
              studentLevel,
              hasVerification: true,
              verificationStatus: verification.status
            }
          } else if (verification && verification.status === 'pending') {
            return {
              canBook: false,
              reason: 'Level verification is pending review',
              suggestedAction: 'Wait for verification approval or improve your level',
              requiredLevel,
              studentLevel,
              hasVerification: true,
              verificationStatus: verification.status
            }
          } else {
            return {
              canBook: false,
              reason: `You need level ${requiredLevel} or higher (current: level ${studentLevel})`,
              suggestedAction: 'Complete more materials to reach the required level or request level verification',
              requiredLevel,
              studentLevel
            }
          }
        } else {
          return {
            canBook: false,
            reason: `Minimum level ${requiredLevel} required (current: level ${studentLevel})`,
            suggestedAction: 'Complete more learning materials to reach the required level',
            requiredLevel,
            studentLevel
          }
        }
      }

      return {
        canBook: true,
        requiredLevel,
        studentLevel
      }
    } catch (error) {
      console.error('Error checking level requirement:', error)
      return {
        canBook: false,
        reason: 'Error verifying level requirements',
        suggestedAction: 'Try again later',
        requiredLevel: schedule.requiredLevel || 1,
        studentLevel: 0
      }
    }
  }

  // Get level verification for student
  static async getLevelVerification(studentId: number, targetLevel: number): Promise<LevelVerification | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/level_verifications?studentId=${studentId}&targetLevel=${targetLevel}`)
      const verifications = await response.json()
      
      if (verifications.length === 0) return null
      
      // Return the most recent verification
      return verifications.sort((a: LevelVerification, b: LevelVerification) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
    } catch (error) {
      console.error('Error fetching level verification:', error)
      return null
    }
  }

  // Create level verification request
  static async requestLevelVerification(
    studentId: number, 
    targetLevel: number, 
    journeyId: string = 'JOURNEY-DEFAULT-001'
  ): Promise<LevelVerification> {
    try {
      const studentProgress = await this.getStudentProgress(studentId)
      const currentLevel = studentProgress?.currentLevel || 1

      const verification: Omit<LevelVerification, 'id'> = {
        studentId,
        journeyId,
        currentLevel,
        targetLevel,
        type: 'level_jump',
        status: 'pending',
        requirements: [
          {
            type: 'assignment',
            assignmentId: `ASS-VERIFICATION-${targetLevel}`,
            status: 'pending',
            score: null
          },
          {
            type: 'project',
            projectId: `PROJ-VERIFICATION-${targetLevel}`,
            status: 'pending',
            score: null
          }
        ],
        submissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await fetch(`${this.BASE_URL}/level_verifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...verification,
          id: `VERIFICATION-${studentId}-${targetLevel}-${Date.now()}`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create level verification')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating level verification:', error)
      throw error
    }
  }

  // Filter schedules based on student level
  static async filterSchedulesByLevel(
    studentId: number, 
    schedules: MentorScheduleWithLevels[]
  ): Promise<Array<{ schedule: MentorScheduleWithLevels, levelCheck: LevelCheckResult }>> {
    const results = []
    
    for (const schedule of schedules) {
      const levelCheck = await this.checkLevelRequirement(studentId, schedule)
      results.push({ schedule, levelCheck })
    }
    
    return results
  }

  // Get recommended schedules for student's level
  static async getRecommendedSchedules(
    studentId: number, 
    allSchedules: MentorScheduleWithLevels[]
  ): Promise<MentorScheduleWithLevels[]> {
    const studentProgress = await this.getStudentProgress(studentId)
    if (!studentProgress) return []
    
    const studentLevel = studentProgress.currentLevel
    
    // Filter schedules that are appropriate for student's level
    const recommended = []
    
    for (const schedule of allSchedules) {
      const levelCheck = await this.checkLevelRequirement(studentId, schedule)
      
      // Include schedules that:
      // 1. Student can book immediately
      // 2. Are within reasonable level range (+/- 2 levels)
      if (levelCheck.canBook || 
          (schedule.requiredLevel && Math.abs(schedule.requiredLevel - studentLevel) <= 2)) {
        recommended.push(schedule)
      }
    }
    
    // Sort by relevance to student's level
    return recommended.sort((a, b) => {
      const aLevelDiff = Math.abs((a.requiredLevel || 1) - studentLevel)
      const bLevelDiff = Math.abs((b.requiredLevel || 1) - studentLevel)
      return aLevelDiff - bLevelDiff
    })
  }

  // Check level compatibility between students for group sessions
  static async checkGroupLevelCompatibility(
    studentIds: number[], 
    schedule: MentorScheduleWithLevels
  ): Promise<{ compatible: boolean, reason?: string, levels: number[] }> {
    try {
      const studentLevels = []
      
      for (const studentId of studentIds) {
        const progress = await this.getStudentProgress(studentId)
        studentLevels.push(progress?.currentLevel || 1)
      }
      
      const maxLevel = Math.max(...studentLevels)
      const minLevel = Math.min(...studentLevels)
      const levelGap = maxLevel - minLevel
      const maxAllowedGap = schedule.maxLevelGap || 2
      
      if (levelGap > maxAllowedGap) {
        return {
          compatible: false,
          reason: `Level gap too large: ${levelGap} (max allowed: ${maxAllowedGap})`,
          levels: studentLevels
        }
      }
      
      return {
        compatible: true,
        levels: studentLevels
      }
    } catch (error) {
      console.error('Error checking group level compatibility:', error)
      return {
        compatible: false,
        reason: 'Error checking level compatibility',
        levels: []
      }
    }
  }
}