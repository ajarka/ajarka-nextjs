import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Queries
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("comments").collect();
  },
});

export const getById = query({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByTarget = query({
  args: {
    targetType: v.union(
      v.literal("course"),
      v.literal("mentor"),
      v.literal("session"),
      v.literal("booking")
    ),
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_target", (q) => q.eq("targetType", args.targetType).eq("targetId", args.targetId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();
  },
});

export const getByAuthor = query({
  args: { authorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .collect();
  },
});

export const getPendingReviews = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

export const getApprovedComments = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();
  },
});

export const getCommentReplies = query({
  args: { parentCommentId: v.id("comments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("parentCommentId"), args.parentCommentId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();
  },
});

// Mutations
export const create = mutation({
  args: {
    authorId: v.id("users"),
    targetType: v.union(
      v.literal("course"),
      v.literal("mentor"),
      v.literal("session"),
      v.literal("booking")
    ),
    targetId: v.string(),
    rating: v.optional(v.number()),
    comment: v.string(),
    isPublic: v.boolean(),
    parentCommentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    return await ctx.db.insert("comments", {
      ...args,
      isVerified: false,
      likes: 0,
      dislikes: 0,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("comments"),
    comment: v.optional(v.string()),
    rating: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
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
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const moderateComment = mutation({
  args: {
    id: v.id("comments"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("hidden")
    ),
    moderatorId: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, status, moderatorId } = args;
    const now = new Date().toISOString();

    return await ctx.db.patch(id, {
      status,
      moderatedBy: moderatorId,
      moderatedAt: now,
      updatedAt: now,
    });
  },
});

export const likeComment = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found");

    return await ctx.db.patch(args.id, {
      likes: (comment.likes || 0) + 1,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const dislikeComment = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found");

    return await ctx.db.patch(args.id, {
      dislikes: (comment.dislikes || 0) + 1,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const verifyComment = mutation({
  args: {
    id: v.id("comments"),
    verifierId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      isVerified: true,
      moderatedBy: args.verifierId,
      moderatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

// Utility functions
export const getAverageRating = query({
  args: {
    targetType: v.union(
      v.literal("course"),
      v.literal("mentor"),
      v.literal("session"),
      v.literal("booking")
    ),
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_target", (q) => q.eq("targetType", args.targetType).eq("targetId", args.targetId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    const ratingsWithValues = comments.filter(c => c.rating !== undefined && c.rating !== null);

    if (ratingsWithValues.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {},
      };
    }

    const totalRating = ratingsWithValues.reduce((sum, c) => sum + (c.rating || 0), 0);
    const averageRating = totalRating / ratingsWithValues.length;

    // Calculate rating distribution
    const distribution = ratingsWithValues.reduce((acc, c) => {
      const rating = c.rating || 0;
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      averageRating: Math.round(averageRating * 100) / 100,
      totalReviews: ratingsWithValues.length,
      ratingDistribution: distribution,
    };
  },
});

export const getCommentStats = query({
  args: { targetId: v.string() },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("targetId"), args.targetId))
      .collect();

    const approved = comments.filter(c => c.status === "approved").length;
    const pending = comments.filter(c => c.status === "pending").length;
    const rejected = comments.filter(c => c.status === "rejected").length;
    const totalLikes = comments.reduce((sum, c) => sum + (c.likes || 0), 0);

    return {
      total: comments.length,
      approved,
      pending,
      rejected,
      totalLikes,
    };
  },
});