import { BaseService } from './base/base-service';
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export interface LearningMaterial {
  _id: Id<"learningMaterials">;
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
  _id: Id<"roadmaps">;
  title: string;
  description: string;
  targetAudience: string[];
  estimatedDuration: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  skills: string[];
  prerequisites: string[];
  learningPath: {
    stepNumber: number;
    title: string;
    description: string;
    estimatedHours: number;
    materials: string[];
    courses?: string[];
    assessments?: string[];
  }[];
  createdBy: Id<"users">;
  isPublic: boolean;
  isActive: boolean;
  tags?: string[];
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy interfaces for backward compatibility
export interface Assignment {
  id: string;
  title: string;
  description: string;
  materialId: string;
  journeyId: string;
  level: number;
  type: 'coding' | 'quiz' | 'project' | 'essay';
  instructions: string;
  requirements: string[];
  submissionFormat: 'github_repo' | 'file_upload' | 'text' | 'video';
  maxAttempts: number;
  passingScore: number;
  timeLimit: number;
  resources: string[];
  rubric: {
    criteria: string;
    points: number;
    description: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'group' | 'capstone';
  level: number;
  journeyId: string;
  prerequisites: string[];
  estimatedHours: number;
  requirements: string[];
  submissionRequirements: {
    githubRepo: boolean;
    liveDemo: boolean;
    videoExplanation: {
      required: boolean;
      maxDuration: number;
      topics: string[];
    };
    documentation: boolean;
  };
  evaluationCriteria: {
    name: string;
    weight: number;
    description: string;
  }[];
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

class LearningService extends BaseService {
  // Learning Materials
  useLearningMaterials() {
    return this.provider.useQuery(api.learningMaterials.getAll, {});
  }

  useLearningMaterial(id: Id<"learningMaterials">) {
    return this.provider.useQuery(api.learningMaterials.getById, { id });
  }

  useLearningMaterialsByCategory(category: LearningMaterial['category']) {
    return this.provider.useQuery(api.learningMaterials.getByCategory, { category });
  }

  useLearningMaterialsByLevel(minLevel: number, maxLevel: number) {
    return this.provider.useQuery(api.learningMaterials.getByLevelRange, { minLevel, maxLevel });
  }

  useLearningMaterialsByDifficulty(difficulty: LearningMaterial['difficulty']) {
    return this.provider.useQuery(api.learningMaterials.getByDifficulty, { difficulty });
  }

  useActiveLearningMaterials() {
    return this.provider.useQuery(api.learningMaterials.getActiveMaterials, {});
  }

  useSearchLearningMaterials(searchTerm: string) {
    return this.provider.useQuery(api.learningMaterials.searchMaterials, { searchTerm });
  }

  useLearningMaterialsBySkills(skills: string[]) {
    return this.provider.useQuery(api.learningMaterials.getBySkills, { skills });
  }

  async createLearningMaterial(data: Omit<LearningMaterial, '_id' | 'createdAt' | 'updatedAt'>) {
    return await this.provider.useMutation(api.learningMaterials.create, data);
  }

  async updateLearningMaterial(id: Id<"learningMaterials">, updates: Partial<LearningMaterial>) {
    return await this.provider.useMutation(api.learningMaterials.update, { id, ...updates });
  }

  async deleteLearningMaterial(id: Id<"learningMaterials">) {
    return await this.provider.useMutation(api.learningMaterials.remove, { id });
  }

  // Learning Journeys (Roadmaps)
  useLearningJourneys() {
    return this.provider.useQuery(api.roadmaps.getActiveRoadmaps, {});
  }

  useLearningJourney(id: Id<"roadmaps">) {
    return this.provider.useQuery(api.roadmaps.getById, { id });
  }

  usePublicLearningJourneys() {
    return this.provider.useQuery(api.roadmaps.getPublicRoadmaps, {});
  }

  useLearningJourneysByCreator(creatorId: Id<"users">) {
    return this.provider.useQuery(api.roadmaps.getByCreator, { creatorId });
  }

  useLearningJourneysByDifficulty(difficulty: LearningJourney['difficultyLevel']) {
    return this.provider.useQuery(api.roadmaps.getByDifficulty, { difficulty });
  }

  useSearchLearningJourneys(searchTerm: string) {
    return this.provider.useQuery(api.roadmaps.searchRoadmaps, { searchTerm });
  }

  useLearningJourneysBySkills(skills: string[]) {
    return this.provider.useQuery(api.roadmaps.getBySkills, { skills });
  }

  useLearningJourneyStats(roadmapId: Id<"roadmaps">) {
    return this.provider.useQuery(api.roadmaps.getRoadmapStats, { roadmapId });
  }

  async createLearningJourney(data: Omit<LearningJourney, '_id' | 'createdAt' | 'updatedAt'>) {
    return await this.provider.useMutation(api.roadmaps.create, data);
  }

  async updateLearningJourney(id: Id<"roadmaps">, updates: Partial<LearningJourney>) {
    return await this.provider.useMutation(api.roadmaps.update, { id, ...updates });
  }

  async deleteLearningJourney(id: Id<"roadmaps">) {
    return await this.provider.useMutation(api.roadmaps.remove, { id });
  }

  async toggleLearningJourneyActive(id: Id<"roadmaps">) {
    return await this.provider.useMutation(api.roadmaps.toggleActive, { id });
  }

  async toggleLearningJourneyPublic(id: Id<"roadmaps">) {
    return await this.provider.useMutation(api.roadmaps.togglePublic, { id });
  }

  // Legacy methods for backward compatibility
  async getLearningMaterials(): Promise<any[]> {
    const materials = await this.provider.useQuery(api.learningMaterials.getAll, {});
    return (materials || []).map(material => ({
      ...material,
      id: material._id // Add legacy id field
    }));
  }

  async getLearningMaterial(id: string): Promise<any | null> {
    try {
      const material = await this.provider.useQuery(api.learningMaterials.getById, { id: id as Id<"learningMaterials"> });
      if (!material) return null;
      return {
        ...material,
        id: material._id // Add legacy id field
      };
    } catch (error) {
      console.error('Error fetching learning material:', error);
      return null;
    }
  }

  async getLearningJourneys(): Promise<any[]> {
    const journeys = await this.provider.useQuery(api.roadmaps.getActiveRoadmaps, {});
    return (journeys || []).map(journey => ({
      ...journey,
      id: journey._id, // Add legacy id field
      category: journey.difficultyLevel, // Map difficultyLevel to category for backward compatibility
      totalLevels: journey.learningPath.length * 10, // Estimate total levels from learning path
      phases: journey.learningPath.map((step, index) => ({
        id: `phase-${index + 1}`,
        title: step.title,
        description: step.description,
        levels: [index * 10 + 1, (index + 1) * 10] as [number, number],
        materials: step.materials,
        assignments: step.assessments || [],
        projects: step.assessments || [],
        estimatedDuration: `${step.estimatedHours} hours`
      }))
    }));
  }

  async getLearningJourney(id: string): Promise<any | null> {
    try {
      const journey = await this.provider.useQuery(api.roadmaps.getById, { id: id as Id<"roadmaps"> });
      if (!journey) return null;
      return {
        ...journey,
        id: journey._id, // Add legacy id field
        category: journey.difficultyLevel, // Map difficultyLevel to category for backward compatibility
        totalLevels: journey.learningPath.length * 10, // Estimate total levels from learning path
        phases: journey.learningPath.map((step, index) => ({
          id: `phase-${index + 1}`,
          title: step.title,
          description: step.description,
          levels: [index * 10 + 1, (index + 1) * 10] as [number, number],
          materials: step.materials,
          assignments: step.assessments || [],
          projects: step.assessments || [],
          estimatedDuration: `${step.estimatedHours} hours`
        }))
      };
    } catch (error) {
      console.error('Error fetching learning journey:', error);
      return null;
    }
  }

  // Mock methods for assignments and projects (would need separate implementation)
  async getAssignments(): Promise<Assignment[]> {
    // This would need a separate assignments table in Convex
    return [];
  }

  async getAssignment(id: string): Promise<Assignment | null> {
    // This would need a separate assignments table in Convex
    return null;
  }

  async createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assignment | null> {
    // This would need a separate assignments table in Convex
    return null;
  }

  async getProjects(): Promise<Project[]> {
    // This would need a separate projects table in Convex
    return [];
  }

  async getProject(id: string): Promise<Project | null> {
    // This would need a separate projects table in Convex
    return null;
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project | null> {
    // This would need a separate projects table in Convex
    return null;
  }

  // Mock methods for student progress (would need separate implementation)
  async getStudentProgress(studentId: number): Promise<StudentProgress[]> {
    // This would need a separate student progress table in Convex
    return [];
  }

  async getJourneyProgress(studentId: number, journeyId: string): Promise<StudentProgress | null> {
    // This would need a separate student progress table in Convex
    return null;
  }

  async updateStudentProgress(progressId: string, updates: Partial<StudentProgress>): Promise<StudentProgress | null> {
    // This would need a separate student progress table in Convex
    return null;
  }

  async startJourney(studentId: number, journeyId: string): Promise<StudentProgress | null> {
    // This would need a separate student progress table in Convex
    return null;
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
    // This would need student progress implementation
    return [];
  }

  async canAccessMaterial(studentId: number, materialId: string): Promise<boolean> {
    // This would need student progress implementation
    return true;
  }

  async calculateJourneyProgress(studentId: number, journeyId: string): Promise<{
    completionPercentage: number;
    currentLevel: number;
    totalLevels: number;
    skillsAcquired: string[];
    estimatedCompletion: string;
  }> {
    // This would need student progress implementation
    return {
      completionPercentage: 0,
      currentLevel: 0,
      totalLevels: 1,
      skillsAcquired: [],
      estimatedCompletion: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
}

export const learningService = new LearningService();