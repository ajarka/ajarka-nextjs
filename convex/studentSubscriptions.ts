import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all student subscriptions
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("studentSubscriptions").collect();
  },
});

// Get subscriptions by student ID
export const getByStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studentSubscriptions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
  },
});

// Get subscriptions by student ID (string version for compatibility)
export const getByStudentString = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    try {
      const studentConvexId = args.studentId as Id<"users">;
      return await ctx.db
        .query("studentSubscriptions")
        .withIndex("by_student", (q) => q.eq("studentId", studentConvexId))
        .collect();
    } catch {
      return [];
    }
  },
});

// Get active subscription for a student
export const getActiveSubscription = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("studentSubscriptions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    // Find active subscription with remaining sessions and not expired
    const now = new Date().toISOString();
    const activeSubscription = subscriptions.find(
      (sub) =>
        sub.status === "active" &&
        sub.remainingSessions > 0 &&
        sub.expiryDate > now
    );

    return activeSubscription || null;
  },
});

// Get active subscription by string student ID
export const getActiveSubscriptionString = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    try {
      const studentConvexId = args.studentId as Id<"users">;
      const subscriptions = await ctx.db
        .query("studentSubscriptions")
        .withIndex("by_student", (q) => q.eq("studentId", studentConvexId))
        .collect();

      // Find active subscription with remaining sessions and not expired
      const now = new Date().toISOString();
      const activeSubscription = subscriptions.find(
        (sub) =>
          sub.status === "active" &&
          sub.remainingSessions > 0 &&
          sub.expiryDate > now
      );

      return activeSubscription || null;
    } catch {
      return null;
    }
  },
});

// Get subscriptions by bundle ID
export const getByBundle = query({
  args: { bundleId: v.id("bundlePackages") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studentSubscriptions")
      .withIndex("by_bundle", (q) => q.eq("bundleId", args.bundleId))
      .collect();
  },
});

// Get subscriptions by status
export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("cancelled"),
      v.literal("suspended")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studentSubscriptions")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Get subscription by ID
export const getById = query({
  args: { id: v.id("studentSubscriptions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new subscription
export const create = mutation({
  args: {
    studentId: v.id("users"),
    bundleId: v.id("bundlePackages"),
    bundleName: v.string(),
    totalSessions: v.number(),
    originalPrice: v.number(),
    paidPrice: v.number(),
    discountAmount: v.number(),
    purchaseDate: v.string(),
    validityDays: v.number(),
    transactionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + args.validityDays);

    const subscriptionId = await ctx.db.insert("studentSubscriptions", {
      studentId: args.studentId,
      bundleId: args.bundleId,
      bundleName: args.bundleName,
      totalSessions: args.totalSessions,
      usedSessions: 0,
      remainingSessions: args.totalSessions,
      originalPrice: args.originalPrice,
      paidPrice: args.paidPrice,
      discountAmount: args.discountAmount,
      purchaseDate: args.purchaseDate,
      expiryDate: expiryDate.toISOString(),
      status: "active",
      transactions: args.transactionId ? [args.transactionId] : [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    return subscriptionId;
  },
});

// Use a session from subscription
export const useSession = mutation({
  args: {
    id: v.id("studentSubscriptions"),
    transactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.id);

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== "active") {
      throw new Error("Subscription is not active");
    }

    if (subscription.remainingSessions <= 0) {
      throw new Error("No remaining sessions in subscription");
    }

    const now = new Date();
    if (new Date(subscription.expiryDate) < now) {
      throw new Error("Subscription has expired");
    }

    // Update subscription
    await ctx.db.patch(args.id, {
      usedSessions: subscription.usedSessions + 1,
      remainingSessions: subscription.remainingSessions - 1,
      transactions: [...subscription.transactions, args.transactionId],
      updatedAt: now.toISOString(),
    });

    return args.id;
  },
});

// Update subscription status
export const updateStatus = mutation({
  args: {
    id: v.id("studentSubscriptions"),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("cancelled"),
      v.literal("suspended")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });
    return args.id;
  },
});

// Cancel subscription
export const cancel = mutation({
  args: { id: v.id("studentSubscriptions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    });
    return args.id;
  },
});

// Delete subscription
export const remove = mutation({
  args: { id: v.id("studentSubscriptions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Check and update expired subscriptions
export const checkExpiredSubscriptions = mutation({
  args: {},
  handler: async (ctx) => {
    const activeSubscriptions = await ctx.db
      .query("studentSubscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const now = new Date().toISOString();
    const expiredCount = 0;

    for (const subscription of activeSubscriptions) {
      if (subscription.expiryDate < now) {
        await ctx.db.patch(subscription._id, {
          status: "expired",
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return { expiredCount };
  },
});
