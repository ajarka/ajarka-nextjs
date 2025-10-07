import { BaseService } from './base/base-service';
import { Id } from "../../convex/_generated/dataModel";

export interface MaterialAttachment {
  name: string;
  url: string;
  type: string;
}

export interface MaterialContent {
  _id: Id<"materialContents">;
  title: string;
  description: string;
  category: string;
  level: number;
  difficulty: string;
  estimatedHours: number;
  content: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  attachments: MaterialAttachment[];
  tags: string[];
  prerequisites: string[];
  objectives: string[];
  authorId: string;
  authorRole: string;
  status: string;
  reviewerId?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface MaterialReview {
  _id: Id<"materialReviews">;
  materialId: Id<"materialContents">;
  reviewerId: string;
  action: string;
  notes: string;
  createdAt: string;
}

export class MaterialContentService extends BaseService {
  // Hook methods for React components
  static useMaterialContents() {
    return this.useQuery<MaterialContent[]>('materialContents.getAll', {});
  }

  static usePublishedMaterials() {
    return this.useQuery<MaterialContent[]>('materialContents.getPublished', {});
  }

  static useMaterialsByAuthor(authorId: string) {
    return this.useQuery<MaterialContent[]>('materialContents.getByAuthor', { authorId });
  }

  static usePendingReviewMaterials() {
    return this.useQuery<MaterialContent[]>('materialContents.getPendingReview', {});
  }

  static useMaterialsByStatus(status: string) {
    return this.useQuery<MaterialContent[]>('materialContents.getByStatus', { status });
  }

  static useMaterialsByCategory(category: string) {
    return this.useQuery<MaterialContent[]>('materialContents.getByCategory', { category });
  }

  static useMaterialById(id: Id<"materialContents">) {
    return this.useQuery<MaterialContent | null>('materialContents.getById', { id });
  }

  static useCreateMaterial() {
    return this.useMutation<Id<"materialContents">>('materialContents.create');
  }

  static useUpdateMaterial() {
    return this.useMutation<Id<"materialContents">>('materialContents.update');
  }

  static useDeleteMaterial() {
    return this.useMutation<void>('materialContents.remove');
  }

  static useSubmitForReview() {
    return this.useMutation<Id<"materialContents">>('materialContents.submitForReview');
  }

  static useApproveMaterial() {
    return this.useMutation<Id<"materialContents">>('materialContents.approveMaterial');
  }

  static useRejectMaterial() {
    return this.useMutation<Id<"materialContents">>('materialContents.rejectMaterial');
  }

  static useRequestRevision() {
    return this.useMutation<Id<"materialContents">>('materialContents.requestRevision');
  }

  static useToggleActive() {
    return this.useMutation<Id<"materialContents">>('materialContents.toggleActive');
  }

  static useAdminUsers() {
    return this.useQuery<any[]>('users.getByRole', { role: 'admin' });
  }

  // Async methods for server-side/non-React usage
  static async getAllMaterials(): Promise<MaterialContent[]> {
    try {
      return await this.query("materialContents:getAll") || []
    } catch (error) {
      console.error('Error fetching materials:', error)
      return []
    }
  }

  static async getPublishedMaterials(): Promise<MaterialContent[]> {
    try {
      return await this.query("materialContents:getPublished") || []
    } catch (error) {
      console.error('Error fetching published materials:', error)
      return []
    }
  }

  static async getMaterialsByAuthor(authorId: string): Promise<MaterialContent[]> {
    try {
      return await this.query("materialContents:getByAuthor", { authorId }) || []
    } catch (error) {
      console.error('Error fetching materials by author:', error)
      return []
    }
  }
}

export const materialContentService = new MaterialContentService();
