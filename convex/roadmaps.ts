import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query all roadmaps
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("roadmaps").collect();
  },
});

// Query by ID
export const getById = query({
  args: { id: v.id("roadmaps") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query by creator
export const getByCreator = query({
  args: { creatorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("roadmaps")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.creatorId))
      .collect();
  },
});

// Query by difficulty
export const getByDifficulty = query({
  args: { difficulty: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("roadmaps")
      .withIndex("by_difficulty", (q) => q.eq("difficultyLevel", args.difficulty))
      .collect();
  },
});

// Query public roadmaps only
export const getPublicRoadmaps = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("roadmaps")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Query active roadmaps only
export const getActiveRoadmaps = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("roadmaps")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Create roadmap
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    targetAudience: v.array(v.string()),
    estimatedDuration: v.string(),
    difficultyLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("expert")
    ),
    skills: v.array(v.string()),
    prerequisites: v.array(v.string()),
    learningPath: v.array(v.object({
      stepNumber: v.number(),
      title: v.string(),
      description: v.string(),
      estimatedHours: v.number(),
      materials: v.array(v.string()),
      courses: v.optional(v.array(v.string())),
      assessments: v.optional(v.array(v.string())),
    })),
    createdBy: v.id("users"),
    isPublic: v.boolean(),
    isActive: v.boolean(),
    tags: v.optional(v.array(v.string())),
    thumbnail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("roadmaps", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update roadmap
export const update = mutation({
  args: {
    id: v.id("roadmaps"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    targetAudience: v.optional(v.array(v.string())),
    estimatedDuration: v.optional(v.string()),
    difficultyLevel: v.optional(v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("expert")
    )),
    skills: v.optional(v.array(v.string())),
    prerequisites: v.optional(v.array(v.string())),
    learningPath: v.optional(v.array(v.object({
      stepNumber: v.number(),
      title: v.string(),
      description: v.string(),
      estimatedHours: v.number(),
      materials: v.array(v.string()),
      courses: v.optional(v.array(v.string())),
      assessments: v.optional(v.array(v.string())),
    }))),
    isPublic: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    thumbnail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Delete roadmap
export const remove = mutation({
  args: { id: v.id("roadmaps") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Search roadmaps
export const searchRoadmaps = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const roadmaps = await ctx.db.query("roadmaps").collect();
    const searchTerm = args.searchTerm.toLowerCase();

    return roadmaps.filter(roadmap =>
      roadmap.title.toLowerCase().includes(searchTerm) ||
      roadmap.description.toLowerCase().includes(searchTerm) ||
      roadmap.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
      roadmap.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  },
});

// Get roadmaps by skills
export const getBySkills = query({
  args: { skills: v.array(v.string()) },
  handler: async (ctx, args) => {
    const roadmaps = await ctx.db.query("roadmaps").collect();

    return roadmaps.filter(roadmap =>
      args.skills.some(skill =>
        roadmap.skills.some(roadmapSkill =>
          roadmapSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );
  },
});

// Get roadmap stats
export const getRoadmapStats = query({
  args: { roadmapId: v.id("roadmaps") },
  handler: async (ctx, args) => {
    const roadmap = await ctx.db.get(args.roadmapId);
    if (!roadmap) return null;

    // Calculate total estimated hours
    const totalHours = roadmap.learningPath.reduce((sum, step) => sum + step.estimatedHours, 0);

    // Count total materials
    const totalMaterials = roadmap.learningPath.reduce((sum, step) => sum + step.materials.length, 0);

    return {
      totalSteps: roadmap.learningPath.length,
      totalHours,
      totalMaterials,
      difficultyLevel: roadmap.difficultyLevel,
      skillsCount: roadmap.skills.length,
    };
  },
});

// Toggle roadmap active status
export const toggleActive = mutation({
  args: { id: v.id("roadmaps") },
  handler: async (ctx, args) => {
    const roadmap = await ctx.db.get(args.id);
    if (!roadmap) throw new Error("Roadmap not found");

    return await ctx.db.patch(args.id, {
      isActive: !roadmap.isActive,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Toggle roadmap public status
export const togglePublic = mutation({
  args: { id: v.id("roadmaps") },
  handler: async (ctx, args) => {
    const roadmap = await ctx.db.get(args.id);
    if (!roadmap) throw new Error("Roadmap not found");

    return await ctx.db.patch(args.id, {
      isPublic: !roadmap.isPublic,
      updatedAt: new Date().toISOString(),
    });
  },
});