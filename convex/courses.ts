import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Queries
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
  },
});

export const getById = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const getByMentor = query({
  args: { mentorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .collect();
  },
});

export const getByLevel = query({
  args: { level: v.union(v.literal("Beginner"), v.literal("Intermediate"), v.literal("Advanced")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_level", (q) => q.eq("level", args.level))
      .collect();
  },
});

export const getActiveCourses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Mutations
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    duration: v.string(),
    level: v.union(v.literal("Beginner"), v.literal("Intermediate"), v.literal("Advanced")),
    category: v.string(),
    mentorId: v.id("users"),
    syllabus: v.array(v.string()),
    thumbnail: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    const courseId = await ctx.db.insert("courses", {
      ...args,
      isActive: args.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });

    return courseId;
  },
});

export const update = mutation({
  args: {
    id: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    duration: v.optional(v.string()),
    level: v.optional(v.union(v.literal("Beginner"), v.literal("Intermediate"), v.literal("Advanced"))),
    category: v.optional(v.string()),
    syllabus: v.optional(v.array(v.string())),
    thumbnail: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    const existingCourse = await ctx.db.get(id);
    if (!existingCourse) {
      throw new Error("Course not found");
    }

    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const existingCourse = await ctx.db.get(args.id);
    if (!existingCourse) {
      throw new Error("Course not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const toggleActive = mutation({
  args: { id: v.id("courses"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const existingCourse = await ctx.db.get(args.id);
    if (!existingCourse) {
      throw new Error("Course not found");
    }

    await ctx.db.patch(args.id, {
      isActive: args.isActive,
      updatedAt: new Date().toISOString(),
    });

    return args.id;
  },
});