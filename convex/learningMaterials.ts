import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query all learning materials
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("learningMaterials").collect();
  },
});

// Query by ID
export const getById = query({
  args: { id: v.id("learningMaterials") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query by category
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("learningMaterials")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Query by level range
export const getByLevelRange = query({
  args: {
    minLevel: v.number(),
    maxLevel: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("learningMaterials")
      .filter((q) =>
        q.and(
          q.gte(q.field("level"), args.minLevel),
          q.lte(q.field("level"), args.maxLevel),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();
  },
});

// Query by difficulty
export const getByDifficulty = query({
  args: { difficulty: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("learningMaterials")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty))
      .collect();
  },
});

// Query active materials only
export const getActiveMaterials = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("learningMaterials")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Create learning material
export const create = mutation({
  args: {
    title: v.string(),
    category: v.union(
      v.literal("frontend"),
      v.literal("backend"),
      v.literal("fullstack"),
      v.literal("mobile"),
      v.literal("devops"),
      v.literal("data")
    ),
    subcategory: v.union(
      v.literal("fundamental"),
      v.literal("framework"),
      v.literal("advanced"),
      v.literal("specialization")
    ),
    level: v.number(),
    prerequisites: v.array(v.string()),
    estimatedHours: v.number(),
    meetingsRequired: v.number(),
    description: v.string(),
    learningObjectives: v.array(v.string()),
    resources: v.array(v.object({
      type: v.union(v.literal("video"), v.literal("article"), v.literal("documentation"), v.literal("tool")),
      title: v.string(),
      url: v.string(),
      duration: v.number(),
    })),
    assignments: v.array(v.string()),
    projects: v.array(v.string()),
    skills: v.array(v.string()),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("expert")
    ),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("learningMaterials", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update learning material
export const update = mutation({
  args: {
    id: v.id("learningMaterials"),
    title: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("frontend"),
      v.literal("backend"),
      v.literal("fullstack"),
      v.literal("mobile"),
      v.literal("devops"),
      v.literal("data")
    )),
    subcategory: v.optional(v.union(
      v.literal("fundamental"),
      v.literal("framework"),
      v.literal("advanced"),
      v.literal("specialization")
    )),
    level: v.optional(v.number()),
    prerequisites: v.optional(v.array(v.string())),
    estimatedHours: v.optional(v.number()),
    meetingsRequired: v.optional(v.number()),
    description: v.optional(v.string()),
    learningObjectives: v.optional(v.array(v.string())),
    resources: v.optional(v.array(v.object({
      type: v.union(v.literal("video"), v.literal("article"), v.literal("documentation"), v.literal("tool")),
      title: v.string(),
      url: v.string(),
      duration: v.number(),
    }))),
    assignments: v.optional(v.array(v.string())),
    projects: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    difficulty: v.optional(v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("expert")
    )),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Delete learning material
export const remove = mutation({
  args: { id: v.id("learningMaterials") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Search learning materials
export const searchMaterials = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const materials = await ctx.db.query("learningMaterials").collect();
    const searchTerm = args.searchTerm.toLowerCase();

    return materials.filter(material =>
      material.title.toLowerCase().includes(searchTerm) ||
      material.description.toLowerCase().includes(searchTerm) ||
      material.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );
  },
});

// Get materials by skills
export const getBySkills = query({
  args: { skills: v.array(v.string()) },
  handler: async (ctx, args) => {
    const materials = await ctx.db.query("learningMaterials").collect();

    return materials.filter(material =>
      args.skills.some(skill =>
        material.skills.some(materialSkill =>
          materialSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );
  },
});