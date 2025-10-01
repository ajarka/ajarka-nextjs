import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";

// Queries
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const getByRole = query({
  args: { role: v.union(v.literal("admin"), v.literal("mentor"), v.literal("siswa")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

export const getMentors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "mentor"))
      .collect();
  },
});

export const getStudents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "siswa"))
      .collect();
  },
});

// Mutations
export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("mentor"), v.literal("siswa")),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
    provider: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),

    // Mentor specific fields
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    totalStudents: v.optional(v.number()),
    experienceYears: v.optional(v.number()),
    company: v.optional(v.string()),
    specialization: v.optional(v.array(v.string())),

    // Student specific fields
    level: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    studyGoals: v.optional(v.array(v.string())),

    // Additional fields
    age: v.optional(v.number()),
    location: v.optional(v.string()),
    timezone: v.optional(v.string()),
    preferredLanguage: v.optional(v.string()),
    socialMedia: v.optional(v.object({
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      portfolio: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const now = new Date().toISOString();

    const userId = await ctx.db.insert("users", {
      ...args,
      emailVerified: args.emailVerified ?? false,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    totalStudents: v.optional(v.number()),
    level: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    studyGoals: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    company: v.optional(v.string()),
    experienceYears: v.optional(v.number()),
    socialMedia: v.optional(v.object({
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      portfolio: v.optional(v.string()),
    })),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    // Check if user exists
    const existingUser = await ctx.db.get(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const now = new Date().toISOString();

    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: now,
    });

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db.get(args.id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const updateMentorStats = mutation({
  args: {
    mentorId: v.id("users"),
    rating: v.optional(v.number()),
    totalStudents: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { mentorId, ...stats } = args;

    // Check if mentor exists
    const mentor = await ctx.db.get(mentorId);
    if (!mentor || mentor.role !== "mentor") {
      throw new Error("Mentor not found");
    }

    const now = new Date().toISOString();

    await ctx.db.patch(mentorId, {
      ...stats,
      updatedAt: now,
    });

    return mentorId;
  },
});

// Authentication helpers
export const verifyEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date().toISOString();

    await ctx.db.patch(user._id, {
      emailVerified: true,
      updatedAt: now,
    });

    return user._id;
  },
});

// Internal query for authentication (only callable from other Convex functions)
export const getByEmailInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});