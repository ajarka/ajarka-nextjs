import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Queries
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getActiveCategories = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("asc")
      .collect();
  },
});

export const getRootCategories = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("parentCategoryId"), undefined))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

export const getSubCategories = query({
  args: { parentId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parentCategoryId", args.parentId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

export const getCategoryHierarchy = query({
  handler: async (ctx) => {
    const allCategories = await ctx.db
      .query("categories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Build hierarchy
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create map
    allCategories.forEach(cat => {
      categoryMap.set(cat._id, { ...cat, children: [] });
    });

    // Second pass: build hierarchy
    allCategories.forEach(cat => {
      if (cat.parentCategoryId) {
        const parent = categoryMap.get(cat.parentCategoryId);
        if (parent) {
          parent.children.push(categoryMap.get(cat._id));
        }
      } else {
        rootCategories.push(categoryMap.get(cat._id));
      }
    });

    return rootCategories.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const getCategoryByLevel = query({
  args: { level: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_level", (q) => q.eq("level", args.level))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Mutations
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    parentCategoryId: v.optional(v.id("categories")),
    level: v.number(),
    displayOrder: v.number(),
    isActive: v.boolean(),
    metadata: v.optional(v.object({
      prerequisites: v.optional(v.array(v.string())),
      estimatedDuration: v.optional(v.string()),
      difficulty: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // Check if slug already exists
    const existingCategory = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existingCategory) {
      throw new Error("Category with this slug already exists");
    }

    return await ctx.db.insert("categories", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    parentCategoryId: v.optional(v.id("categories")),
    level: v.optional(v.number()),
    displayOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    metadata: v.optional(v.object({
      prerequisites: v.optional(v.array(v.string())),
      estimatedDuration: v.optional(v.string()),
      difficulty: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { id, slug, ...otherUpdates } = args;
    const now = new Date().toISOString();

    // Check if new slug conflicts with existing category
    if (slug) {
      const existingCategory = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();

      if (existingCategory && existingCategory._id !== id) {
        throw new Error("Category with this slug already exists");
      }
    }

    return await ctx.db.patch(id, {
      ...(slug && { slug }),
      ...otherUpdates,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    // Check if category has children
    const children = await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parentCategoryId", args.id))
      .collect();

    if (children.length > 0) {
      throw new Error("Cannot delete category with subcategories");
    }

    return await ctx.db.delete(args.id);
  },
});

export const toggleActive = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) throw new Error("Category not found");

    return await ctx.db.patch(args.id, {
      isActive: !category.isActive,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const reorderCategories = mutation({
  args: {
    categoryUpdates: v.array(v.object({
      id: v.id("categories"),
      displayOrder: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    for (const update of args.categoryUpdates) {
      await ctx.db.patch(update.id, {
        displayOrder: update.displayOrder,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Utility functions
export const getCategoryPath = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const path: any[] = [];
    let currentId = args.categoryId;

    while (currentId) {
      const category = await ctx.db.get(currentId);
      if (!category) break;

      path.unshift({
        id: category._id,
        name: category.name,
        slug: category.slug,
      });

      currentId = category.parentCategoryId;
    }

    return path;
  },
});

export const getCategoryStats = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    // Get category
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");

    // Get subcategories count
    const subcategoriesCount = await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parentCategoryId", args.categoryId))
      .collect();

    // This would typically integrate with courses table to get course counts
    // For now returning basic stats
    return {
      category,
      subcategoriesCount: subcategoriesCount.length,
      coursesCount: 0, // Would query courses by category
      totalStudents: 0, // Would calculate from course enrollments
    };
  },
});

export const searchCategories = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allCategories = await ctx.db
      .query("categories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const searchLower = args.searchTerm.toLowerCase();

    return allCategories.filter(category =>
      category.name.toLowerCase().includes(searchLower) ||
      category.description.toLowerCase().includes(searchLower) ||
      category.slug.toLowerCase().includes(searchLower)
    ).sort((a, b) => a.displayOrder - b.displayOrder);
  },
});