import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Queries
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bundlePackages").collect();
  },
});

export const getById = query({
  args: { id: v.id("bundlePackages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByType = query({
  args: {
    type: v.union(
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("session_pack"),
      v.literal("custom")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bundlePackages")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("bundlePackages")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Mutations
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("session_pack"),
      v.literal("custom")
    ),
    sessionCount: v.number(),
    originalPrice: v.number(),
    discountPercentage: v.number(),
    validityDays: v.number(),
    features: v.array(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const finalPrice = args.originalPrice - (args.originalPrice * args.discountPercentage / 100);
    const now = new Date().toISOString();

    const bundleId = await ctx.db.insert("bundlePackages", {
      ...args,
      finalPrice,
      isActive: args.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });

    return bundleId;
  },
});

export const update = mutation({
  args: {
    id: v.id("bundlePackages"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    sessionCount: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    discountPercentage: v.optional(v.number()),
    validityDays: v.optional(v.number()),
    features: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    const existingBundle = await ctx.db.get(id);
    if (!existingBundle) {
      throw new Error("Bundle package not found");
    }

    // Recalculate final price if needed
    const originalPrice = updateData.originalPrice ?? existingBundle.originalPrice;
    const discountPercentage = updateData.discountPercentage ?? existingBundle.discountPercentage;
    const finalPrice = originalPrice - (originalPrice * discountPercentage / 100);

    await ctx.db.patch(id, {
      ...updateData,
      finalPrice,
      updatedAt: new Date().toISOString(),
    });

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("bundlePackages") },
  handler: async (ctx, args) => {
    const existingBundle = await ctx.db.get(args.id);
    if (!existingBundle) {
      throw new Error("Bundle package not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const toggleActive = mutation({
  args: { id: v.id("bundlePackages"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const existingBundle = await ctx.db.get(args.id);
    if (!existingBundle) {
      throw new Error("Bundle package not found");
    }

    await ctx.db.patch(args.id, {
      isActive: args.isActive,
      updatedAt: new Date().toISOString(),
    });

    return args.id;
  },
});