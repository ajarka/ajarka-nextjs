import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Queries
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("discountRules").collect();
  },
});

export const getById = query({
  args: { id: v.id("discountRules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getActiveRules = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("discountRules")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getByType = query({
  args: { type: v.union(v.literal("percentage"), v.literal("fixed_amount")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("discountRules")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

export const getApplicableRules = query({
  args: {
    sessionCount: v.number(),
    amount: v.optional(v.number()),
    userRole: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const allRules = await ctx.db
      .query("discountRules")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return allRules.filter(rule => {
      // Check session count requirements
      if (rule.minSessions && args.sessionCount < rule.minSessions) return false;
      if (rule.maxSessions && args.sessionCount > rule.maxSessions) return false;

      // Check amount requirements
      if (rule.minAmount && args.amount && args.amount < rule.minAmount) return false;

      // Check role requirements
      if (rule.applicableRoles && args.userRole && !rule.applicableRoles.includes(args.userRole)) return false;

      // Check validity dates
      const now = new Date().toISOString();
      if (rule.validFrom && now < rule.validFrom) return false;
      if (rule.validUntil && now > rule.validUntil) return false;

      return true;
    });
  },
});

// Mutations
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    type: v.union(v.literal("percentage"), v.literal("fixed_amount")),
    value: v.number(),
    minSessions: v.optional(v.number()),
    maxSessions: v.optional(v.number()),
    minAmount: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    isActive: v.boolean(),
    validFrom: v.optional(v.string()),
    validUntil: v.optional(v.string()),
    applicableRoles: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    return await ctx.db.insert("discountRules", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("discountRules"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(v.literal("percentage"), v.literal("fixed_amount"))),
    value: v.optional(v.number()),
    minSessions: v.optional(v.number()),
    maxSessions: v.optional(v.number()),
    minAmount: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    validFrom: v.optional(v.string()),
    validUntil: v.optional(v.string()),
    applicableRoles: v.optional(v.array(v.string())),
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
  args: { id: v.id("discountRules") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const toggleActive = mutation({
  args: { id: v.id("discountRules") },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.id);
    if (!rule) throw new Error("Discount rule not found");

    return await ctx.db.patch(args.id, {
      isActive: !rule.isActive,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Utility functions
export const calculateDiscount = query({
  args: {
    ruleId: v.id("discountRules"),
    originalAmount: v.number(),
    sessionCount: v.number(),
  },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.ruleId);
    if (!rule || !rule.isActive) return { discountAmount: 0, finalAmount: args.originalAmount };

    let discountAmount = 0;

    if (rule.type === "percentage") {
      discountAmount = (args.originalAmount * rule.value) / 100;
    } else if (rule.type === "fixed_amount") {
      discountAmount = rule.value;
    }

    // Apply max discount limit if exists
    if (rule.maxDiscount && discountAmount > rule.maxDiscount) {
      discountAmount = rule.maxDiscount;
    }

    const finalAmount = Math.max(0, args.originalAmount - discountAmount);

    return {
      discountAmount,
      finalAmount,
      ruleName: rule.name,
      ruleType: rule.type,
    };
  },
});