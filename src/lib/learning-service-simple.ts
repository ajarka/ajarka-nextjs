// Simple Learning Service - Working version using Convex DB
// This provides basic functionality to get the roadmap page working

export interface LearningMaterial {
  id: string;
  title: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'devops' | 'data';
  subcategory: 'fundamental' | 'framework' | 'advanced' | 'specialization';
  level: number;
  prerequisites: string[];
  estimatedHours: number;
  meetingsRequired: number;
  description: string;
  learningObjectives: string[];
  resources: {
    type: 'video' | 'article' | 'documentation' | 'tool';
    title: string;
    url: string;
    duration: number;
  }[];
  assignments: string[];
  projects: string[];
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LearningJourney {
  id: string;
  title: string;
  description: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'devops' | 'data';
  totalLevels: number;
  estimatedDuration: string;
  phases: {
    id: string;
    title: string;
    description: string;
    levels: [number, number];
    materials: string[];
    assignments: string[];
    projects: string[];
    estimatedDuration: string;
  }[];
  prerequisites: string[];
  skills: string[];
  certificationProject: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgress {
  id: string;
  studentId: number;
  journeyId: string;
  currentLevel: number;
  currentPhase: string;
  status: 'active' | 'paused' | 'completed' | 'dropped';
  startedAt: string;
  completedMaterials: string[];
  completedAssignments: {
    assignmentId: string;
    score: number;
    attempts: number;
    completedAt: string;
    feedback: string;
    submissionUrl?: string;
  }[];
  completedProjects: {
    projectId: string;
    score: number;
    submissionUrl: string;
    liveUrl?: string;
    videoUrl?: string;
    completedAt: string;
    feedback: string;
  }[];
  skillsAcquired: string[];
  certificates: string[];
  nextMaterial: string;
  estimatedCompletion: string;
  updatedAt: string;
}

class SimpleLearningService {
  // Mock data for now - in future these will come from Convex
  private mockLearningMaterials: LearningMaterial[] = [
    {
      id: 'MAT-FRONTEND-1',
      title: 'HTML & CSS Fundamentals',
      category: 'frontend',
      subcategory: 'fundamental',
      level: 1,
      prerequisites: [],
      estimatedHours: 40,
      meetingsRequired: 8,
      description: 'Learn the basics of HTML and CSS to create beautiful web pages',
      learningObjectives: [
        'Understand HTML structure and semantics',
        'Master CSS styling and layout',
        'Create responsive designs',
        'Build your first website'
      ],
      resources: [
        {
          type: 'video',
          title: 'HTML Crash Course',
          url: 'https://example.com/html-course',
          duration: 120
        }
      ],
      assignments: ['Build a personal portfolio page', 'Create a landing page'],
      projects: ['Personal Website Project'],
      skills: ['HTML', 'CSS', 'Responsive Design', 'Web Development'],
      difficulty: 'beginner',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'MAT-FRONTEND-2',
      title: 'JavaScript Fundamentals',
      category: 'frontend',
      subcategory: 'fundamental',
      level: 2,
      prerequisites: ['MAT-FRONTEND-1'],
      estimatedHours: 60,
      meetingsRequired: 12,
      description: 'Master JavaScript programming language for web development',
      learningObjectives: [
        'Understand JavaScript syntax and concepts',
        'Work with DOM manipulation',
        'Handle events and user interactions',
        'Build interactive web applications'
      ],
      resources: [
        {
          type: 'video',
          title: 'JavaScript Complete Course',
          url: 'https://example.com/js-course',
          duration: 180
        }
      ],
      assignments: ['Build a calculator', 'Create a todo app'],
      projects: ['Interactive Quiz Application'],
      skills: ['JavaScript', 'DOM Manipulation', 'Event Handling', 'ES6+'],
      difficulty: 'beginner',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  private mockLearningJourneys: LearningJourney[] = [
    {
      id: 'JOURNEY-FRONTEND-1',
      title: 'Frontend Development Mastery',
      description: 'Complete path to become a professional frontend developer',
      category: 'frontend',
      totalLevels: 30,
      estimatedDuration: '6-8 months',
      phases: [
        {
          id: 'phase-1',
          title: 'Web Fundamentals',
          description: 'Learn HTML, CSS, and basic web concepts',
          levels: [1, 10],
          materials: ['MAT-FRONTEND-1'],
          assignments: ['HTML/CSS Project'],
          projects: ['Personal Portfolio'],
          estimatedDuration: '40 hours'
        },
        {
          id: 'phase-2',
          title: 'JavaScript Programming',
          description: 'Master JavaScript for interactive web development',
          levels: [11, 20],
          materials: ['MAT-FRONTEND-2'],
          assignments: ['JavaScript Quiz App'],
          projects: ['Interactive Web App'],
          estimatedDuration: '60 hours'
        },
        {
          id: 'phase-3',
          title: 'Modern Frameworks',
          description: 'Build applications with React.js',
          levels: [21, 30],
          materials: [],
          assignments: ['React Components'],
          projects: ['React Portfolio Project'],
          estimatedDuration: '80 hours'
        }
      ],
      prerequisites: ['Basic computer skills', 'English proficiency'],
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Web APIs'],
      certificationProject: 'Full Frontend Portfolio with React',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'JOURNEY-FULLSTACK-1',
      title: 'Full-Stack Development Journey',
      description: 'Complete roadmap to become a full-stack developer with modern technologies',
      category: 'fullstack',
      totalLevels: 50,
      estimatedDuration: '12-15 months',
      phases: [
        {
          id: 'phase-1',
          title: 'Frontend Mastery',
          description: 'Advanced frontend development with React ecosystem',
          levels: [1, 20],
          materials: ['MAT-FRONTEND-1', 'MAT-FRONTEND-2'],
          assignments: ['Advanced React Project'],
          projects: ['React SPA'],
          estimatedDuration: '120 hours'
        },
        {
          id: 'phase-2',
          title: 'Backend Development',
          description: 'Server-side development with Node.js and databases',
          levels: [21, 35],
          materials: [],
          assignments: ['REST API Project'],
          projects: ['Full API Backend'],
          estimatedDuration: '100 hours'
        },
        {
          id: 'phase-3',
          title: 'Full-Stack Integration',
          description: 'Connect frontend and backend for complete applications',
          levels: [36, 50],
          materials: [],
          assignments: ['Full-Stack Capstone Project'],
          projects: ['Production App'],
          estimatedDuration: '80 hours'
        }
      ],
      prerequisites: ['Basic programming knowledge', 'HTML/CSS/JavaScript'],
      skills: ['React', 'Node.js', 'Database Design', 'API Development', 'DevOps', 'Testing'],
      certificationProject: 'Production Full-Stack Application',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  async getLearningMaterials(): Promise<LearningMaterial[]> {
    // Simulate async operation
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.mockLearningMaterials), 100);
    });
  }

  async getLearningMaterial(id: string): Promise<LearningMaterial | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const material = this.mockLearningMaterials.find(m => m.id === id);
        resolve(material || null);
      }, 100);
    });
  }

  async getLearningJourneys(): Promise<LearningJourney[]> {
    // Simulate async operation
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.mockLearningJourneys), 100);
    });
  }

  async getLearningJourney(id: string): Promise<LearningJourney | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const journey = this.mockLearningJourneys.find(j => j.id === id);
        resolve(journey || null);
      }, 100);
    });
  }

  async getStudentProgress(studentId: number): Promise<StudentProgress[]> {
    // Return empty array for now
    return [];
  }

  async getJourneyProgress(studentId: number, journeyId: string): Promise<StudentProgress | null> {
    // Return null for now
    return null;
  }

  async startJourney(studentId: number, journeyId: string): Promise<StudentProgress | null> {
    // Mock implementation
    const newProgress: StudentProgress = {
      id: `PROGRESS-${studentId}-${journeyId}`,
      studentId,
      journeyId,
      currentLevel: 1,
      currentPhase: 'phase-1',
      status: 'active',
      startedAt: new Date().toISOString(),
      completedMaterials: [],
      completedAssignments: [],
      completedProjects: [],
      skillsAcquired: [],
      certificates: [],
      nextMaterial: '',
      estimatedCompletion: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve) => {
      setTimeout(() => resolve(newProgress), 100);
    });
  }

  // Utility methods
  async getMaterialsByCategory(category: string): Promise<LearningMaterial[]> {
    const materials = await this.getLearningMaterials();
    return materials.filter(material => material.category === category && material.isActive);
  }

  async getMaterialsByLevel(minLevel: number, maxLevel: number): Promise<LearningMaterial[]> {
    const materials = await this.getLearningMaterials();
    return materials.filter(material =>
      material.level >= minLevel &&
      material.level <= maxLevel &&
      material.isActive
    );
  }

  async getNextMaterials(studentId: number, journeyId: string): Promise<LearningMaterial[]> {
    // Return empty array for now
    return [];
  }

  async canAccessMaterial(studentId: number, materialId: string): Promise<boolean> {
    // Always return true for now
    return true;
  }

  async calculateJourneyProgress(studentId: number, journeyId: string): Promise<{
    completionPercentage: number;
    currentLevel: number;
    totalLevels: number;
    skillsAcquired: string[];
    estimatedCompletion: string;
  }> {
    return {
      completionPercentage: 0,
      currentLevel: 0,
      totalLevels: 1,
      skillsAcquired: [],
      estimatedCompletion: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
}

export const learningService = new SimpleLearningService();
export default learningService;