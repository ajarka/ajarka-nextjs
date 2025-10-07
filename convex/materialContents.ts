import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Queries
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("materialContents").collect();
  },
});

export const getById = query({
  args: { id: v.id("materialContents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPublished = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("materialContents")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getByAuthor = query({
  args: { authorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("materialContents")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .collect();
  },
});

export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("materialContents")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const getPendingReview = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("materialContents")
      .withIndex("by_status", (q) => q.eq("status", "pending_review"))
      .collect();
  },
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("materialContents")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("status"), "published"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getByLevel = query({
  args: { minLevel: v.number(), maxLevel: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("materialContents")
      .withIndex("by_level")
      .filter((q) =>
        q.and(
          q.gte(q.field("level"), args.minLevel),
          q.lte(q.field("level"), args.maxLevel),
          q.eq(q.field("status"), "published"),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();
  },
});

// Mutations
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    level: v.number(),
    difficulty: v.string(),
    estimatedHours: v.number(),
    content: v.string(),
    videoUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    attachments: v.array(v.object({
      name: v.string(),
      url: v.string(),
      type: v.string(),
    })),
    tags: v.array(v.string()),
    prerequisites: v.array(v.string()),
    objectives: v.array(v.string()),
    authorId: v.string(),
    authorRole: v.string(),
    status: v.string(),
    isPublic: v.boolean(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    return await ctx.db.insert("materialContents", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("materialContents"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    level: v.optional(v.number()),
    difficulty: v.optional(v.string()),
    estimatedHours: v.optional(v.number()),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    attachments: v.optional(v.array(v.object({
      name: v.string(),
      url: v.string(),
      type: v.string(),
    }))),
    tags: v.optional(v.array(v.string())),
    prerequisites: v.optional(v.array(v.string())),
    objectives: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = new Date().toISOString();

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("materialContents") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Review workflow mutations
export const submitForReview = mutation({
  args: { id: v.id("materialContents") },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.id);
    if (!material) throw new Error("Material not found");

    const now = new Date().toISOString();

    // Update material status
    await ctx.db.patch(args.id, {
      status: "pending_review",
      updatedAt: now,
    });

    // Create review record
    await ctx.db.insert("materialReviews", {
      materialId: args.id,
      reviewerId: "", // Will be assigned by admin
      action: "submitted",
      notes: "Material submitted for review",
      createdAt: now,
    });

    return args.id;
  },
});

export const approveMaterial = mutation({
  args: {
    id: v.id("materialContents"),
    reviewerId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.id);
    if (!material) throw new Error("Material not found");

    const now = new Date().toISOString();

    // Update material status
    await ctx.db.patch(args.id, {
      status: "published",
      reviewerId: args.reviewerId,
      reviewNotes: args.notes || "Approved",
      reviewedAt: now,
      publishedAt: now,
      isPublic: true,
      updatedAt: now,
    });

    // Create review record
    await ctx.db.insert("materialReviews", {
      materialId: args.id,
      reviewerId: args.reviewerId,
      action: "approved",
      notes: args.notes || "Material approved and published",
      createdAt: now,
    });

    return args.id;
  },
});

export const rejectMaterial = mutation({
  args: {
    id: v.id("materialContents"),
    reviewerId: v.string(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.id);
    if (!material) throw new Error("Material not found");

    const now = new Date().toISOString();

    // Update material status
    await ctx.db.patch(args.id, {
      status: "rejected",
      reviewerId: args.reviewerId,
      reviewNotes: args.notes,
      reviewedAt: now,
      updatedAt: now,
    });

    // Create review record
    await ctx.db.insert("materialReviews", {
      materialId: args.id,
      reviewerId: args.reviewerId,
      action: "rejected",
      notes: args.notes,
      createdAt: now,
    });

    return args.id;
  },
});

export const requestRevision = mutation({
  args: {
    id: v.id("materialContents"),
    reviewerId: v.string(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.id);
    if (!material) throw new Error("Material not found");

    const now = new Date().toISOString();

    // Update material status back to draft
    await ctx.db.patch(args.id, {
      status: "draft",
      reviewerId: args.reviewerId,
      reviewNotes: args.notes,
      reviewedAt: now,
      updatedAt: now,
    });

    // Create review record
    await ctx.db.insert("materialReviews", {
      materialId: args.id,
      reviewerId: args.reviewerId,
      action: "revision_requested",
      notes: args.notes,
      createdAt: now,
    });

    return args.id;
  },
});

export const toggleActive = mutation({
  args: { id: v.id("materialContents") },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.id);
    if (!material) throw new Error("Material not found");

    const now = new Date().toISOString();

    return await ctx.db.patch(args.id, {
      isActive: !material.isActive,
      updatedAt: now,
    });
  },
});
