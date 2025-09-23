import { BaseService } from './base/base-service';
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export interface Category {
  _id: Id<"categories">;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  parentCategoryId?: Id<"categories">;
  level: number;
  displayOrder: number;
  isActive: boolean;
  metadata?: {
    prerequisites?: string[];
    estimatedDuration?: string;
    difficulty?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CategoryHierarchy extends Category {
  children: CategoryHierarchy[];
}

class CategoryService extends BaseService {
  // Basic CRUD
  useCategories() {
    return this.provider.useQuery(api.categories.getAll, {});
  }

  useCategoryById(id: Id<"categories">) {
    return this.provider.useQuery(api.categories.getById, { id });
  }

  useCategoryBySlug(slug: string) {
    return this.provider.useQuery(api.categories.getBySlug, { slug });
  }

  useActiveCategories() {
    return this.provider.useQuery(api.categories.getActiveCategories, {});
  }

  useRootCategories() {
    return this.provider.useQuery(api.categories.getRootCategories, {});
  }

  useSubCategories(parentId: Id<"categories">) {
    return this.provider.useQuery(api.categories.getSubCategories, { parentId });
  }

  useCategoryHierarchy() {
    return this.provider.useQuery(api.categories.getCategoryHierarchy, {});
  }

  useCategoriesByLevel(level: number) {
    return this.provider.useQuery(api.categories.getCategoryByLevel, { level });
  }

  // Mutations
  async createCategory(data: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) {
    return await this.provider.useMutation(api.categories.create, data);
  }

  async updateCategory(id: Id<"categories">, updates: Partial<Category>) {
    return await this.provider.useMutation(api.categories.update, { id, ...updates });
  }

  async deleteCategory(id: Id<"categories">) {
    return await this.provider.useMutation(api.categories.remove, { id });
  }

  async toggleCategoryActive(id: Id<"categories">) {
    return await this.provider.useMutation(api.categories.toggleActive, { id });
  }

  async reorderCategories(categoryUpdates: Array<{ id: Id<"categories">; displayOrder: number }>) {
    return await this.provider.useMutation(api.categories.reorderCategories, { categoryUpdates });
  }

  // Utility functions
  useCategoryPath(categoryId: Id<"categories">) {
    return this.provider.useQuery(api.categories.getCategoryPath, { categoryId });
  }

  useCategoryStats(categoryId: Id<"categories">) {
    return this.provider.useQuery(api.categories.getCategoryStats, { categoryId });
  }

  useSearchCategories(searchTerm: string) {
    return this.provider.useQuery(api.categories.searchCategories, { searchTerm });
  }

  // Helper methods for frontend
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  buildCategoryBreadcrumb(categoryPath: any[]) {
    return categoryPath.map((cat, index) => ({
      ...cat,
      isLast: index === categoryPath.length - 1,
      url: `/categories/${cat.slug}`
    }));
  }

  // Category management utilities
  async createSubcategory(parentId: Id<"categories">, data: Omit<Category, '_id' | 'parentCategoryId' | 'level' | 'createdAt' | 'updatedAt'>) {
    const parent = await this.provider.useQuery(api.categories.getById, { id: parentId });
    if (!parent) throw new Error("Parent category not found");

    return await this.createCategory({
      ...data,
      parentCategoryId: parentId,
      level: parent.level + 1
    });
  }

  async moveCategory(categoryId: Id<"categories">, newParentId?: Id<"categories">) {
    const category = await this.provider.useQuery(api.categories.getById, { id: categoryId });
    if (!category) throw new Error("Category not found");

    let newLevel = 1;
    if (newParentId) {
      const newParent = await this.provider.useQuery(api.categories.getById, { id: newParentId });
      if (!newParent) throw new Error("New parent category not found");
      newLevel = newParent.level + 1;
    }

    return await this.updateCategory(categoryId, {
      parentCategoryId: newParentId,
      level: newLevel
    });
  }

  // Category filtering and search
  filterCategoriesByDifficulty(categories: Category[], difficulty: string) {
    return categories.filter(cat =>
      cat.metadata?.difficulty === difficulty ||
      !cat.metadata?.difficulty
    );
  }

  filterCategoriesByPrerequisites(categories: Category[], userSkills: string[]) {
    return categories.filter(cat => {
      if (!cat.metadata?.prerequisites?.length) return true;
      return cat.metadata.prerequisites.every(prereq =>
        userSkills.some(skill => skill.toLowerCase().includes(prereq.toLowerCase()))
      );
    });
  }

  // Category analytics
  async getCategoryUsageStats() {
    const categories = await this.provider.useQuery(api.categories.getActiveCategories, {});
    // This would typically integrate with courses and user data
    return categories?.map(cat => ({
      ...cat,
      courseCount: 0, // Would get from courses
      studentCount: 0, // Would get from enrollments
      popularityScore: 0 // Would calculate based on usage
    })) || [];
  }

  // Bulk operations
  async bulkUpdateCategories(updates: Array<{ id: Id<"categories">; updates: Partial<Category> }>) {
    const results = [];
    for (const update of updates) {
      const result = await this.updateCategory(update.id, update.updates);
      results.push(result);
    }
    return results;
  }

  async bulkToggleCategories(categoryIds: Id<"categories">[]) {
    const results = [];
    for (const id of categoryIds) {
      const result = await this.toggleCategoryActive(id);
      results.push(result);
    }
    return results;
  }

  // Category validation
  validateCategoryData(data: Partial<Category>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.name && data.name.length < 2) {
      errors.push("Category name must be at least 2 characters long");
    }

    if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
      errors.push("Category slug must contain only lowercase letters, numbers, and hyphens");
    }

    if (data.level && data.level < 1) {
      errors.push("Category level must be at least 1");
    }

    if (data.displayOrder && data.displayOrder < 0) {
      errors.push("Display order must be non-negative");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Export/Import functions
  async exportCategories() {
    const categories = await this.provider.useQuery(api.categories.getAll, {});
    return {
      exportDate: new Date().toISOString(),
      categories: categories || [],
      count: categories?.length || 0
    };
  }

  async importCategories(categoryData: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>[]) {
    const results = [];
    for (const category of categoryData) {
      try {
        const result = await this.createCategory(category);
        results.push({ success: true, category: result });
      } catch (error) {
        results.push({ success: false, error: error.message, category });
      }
    }
    return results;
  }
}

export const categoryService = new CategoryService();