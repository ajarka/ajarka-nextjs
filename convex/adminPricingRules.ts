import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Queries
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("adminPricingRules").collect();
  },
});

export const getById = query({
  args: { id: v.id("adminPricingRules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getActiveRules = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("adminPricingRules")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getByCategory = query({
  args: {
    category: v.union(
      v.literal("session_pricing"),
      v.literal("bundle_discount"),
      v.literal("mentor_commission"),
      v.literal("platform_fee")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("adminPricingRules")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const getCurrentPricing = query({
  handler: async (ctx) => {
    const rules = await ctx.db
      .query("adminPricingRules")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return rules.reduce((acc, rule) => {
      acc[rule.category] = rule;
      return acc;
    }, {} as Record<string, any>);
  },
});

// Mutations
export const create = mutation({
  args: {
    ruleName: v.string(),
    category: v.union(
      v.literal("session_pricing"),
      v.literal("bundle_discount"),
      v.literal("mentor_commission"),
      v.literal("platform_fee")
    ),
    basePrice: v.number(),
    mentorShare: v.number(),
    platformFee: v.number(),
    discountTiers: v.array(v.object({
      sessionCount: v.number(),
      discountPercentage: v.number(),
    })),
    specialRates: v.optional(v.object({
      newStudentDiscount: v.number(),
      loyaltyDiscount: v.number(),
      referralDiscount: v.number(),
    })),
    isActive: v.boolean(),
    effectiveDate: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    return await ctx.db.insert("adminPricingRules", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("adminPricingRules"),
    ruleName: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("session_pricing"),
      v.literal("bundle_discount"),
      v.literal("mentor_commission"),
      v.literal("platform_fee")
    )),
    basePrice: v.optional(v.number()),
    mentorShare: v.optional(v.number()),
    platformFee: v.optional(v.number()),
    discountTiers: v.optional(v.array(v.object({
      sessionCount: v.number(),
      discountPercentage: v.number(),
    }))),
    specialRates: v.optional(v.object({
      newStudentDiscount: v.number(),
      loyaltyDiscount: v.number(),
      referralDiscount: v.number(),
    })),
    isActive: v.optional(v.boolean()),
    effectiveDate: v.optional(v.string()),
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
  args: { id: v.id("adminPricingRules") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const toggleActive = mutation({
  args: { id: v.id("adminPricingRules") },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.id);
    if (!rule) throw new Error("Pricing rule not found");

    return await ctx.db.patch(args.id, {
      isActive: !rule.isActive,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Utility functions
export const calculateSessionPrice = query({
  args: {
    sessionCount: v.number(),
    isNewStudent: v.optional(v.boolean()),
    isLoyalCustomer: v.optional(v.boolean()),
    isReferral: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const pricingRule = await ctx.db
      .query("adminPricingRules")
      .withIndex("by_category", (q) => q.eq("category", "session_pricing"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!pricingRule) throw new Error("No active pricing rule found");

    let basePrice = pricingRule.basePrice;
    let totalPrice = basePrice * args.sessionCount;

    // Apply tier discounts
    const applicableTier = pricingRule.discountTiers
      .filter(tier => args.sessionCount >= tier.sessionCount)
      .sort((a, b) => b.sessionCount - a.sessionCount)[0];

    if (applicableTier) {
      const discountAmount = (totalPrice * applicableTier.discountPercentage) / 100;
      totalPrice -= discountAmount;
    }

    // Apply special rates
    if (pricingRule.specialRates) {
      if (args.isNewStudent) {
        totalPrice -= (totalPrice * pricingRule.specialRates.newStudentDiscount) / 100;
      }
      if (args.isLoyalCustomer) {
        totalPrice -= (totalPrice * pricingRule.specialRates.loyaltyDiscount) / 100;
      }
      if (args.isReferral) {
        totalPrice -= (totalPrice * pricingRule.specialRates.referralDiscount) / 100;
      }
    }

    const mentorEarnings = (totalPrice * pricingRule.mentorShare) / 100;
    const platformEarnings = (totalPrice * pricingRule.platformFee) / 100;

    return {
      basePrice,
      totalPrice: Math.round(totalPrice),
      mentorEarnings: Math.round(mentorEarnings),
      platformEarnings: Math.round(platformEarnings),
      discountApplied: applicableTier ? applicableTier.discountPercentage : 0,
      tierUsed: applicableTier || null,
    };
  },
});