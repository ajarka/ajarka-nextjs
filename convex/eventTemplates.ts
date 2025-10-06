import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Queries
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("eventTemplates").collect();
  },
});

export const getById = query({
  args: { id: v.id("eventTemplates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("eventTemplates")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("eventTemplates")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Mutations
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    duration: v.number(),
    maxParticipants: v.number(),
    isOnline: v.boolean(),
    materials: v.array(v.string()),
    requirements: v.array(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    return await ctx.db.insert("eventTemplates", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("eventTemplates"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    duration: v.optional(v.number()),
    maxParticipants: v.optional(v.number()),
    isOnline: v.optional(v.boolean()),
    materials: v.optional(v.array(v.string())),
    requirements: v.optional(v.array(v.string())),
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
  args: { id: v.id("eventTemplates") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const toggleActive = mutation({
  args: { id: v.id("eventTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template) throw new Error("Event template not found");

    return await ctx.db.patch(args.id, {
      isActive: !template.isActive,
      updatedAt: new Date().toISOString(),
    });
  },
});
