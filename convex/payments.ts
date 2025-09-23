import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Queries
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("paymentTransactions").collect();
  },
});

export const getById = query({
  args: { id: v.id("paymentTransactions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByOrderId = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paymentTransactions")
      .withIndex("by_order_id", (q) => q.eq("orderId", args.orderId))
      .unique();
  },
});

export const getByStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paymentTransactions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
  },
});

export const getByMentor = query({
  args: { mentorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paymentTransactions")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .collect();
  },
});

export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("cancelled"),
      v.literal("expired")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paymentTransactions")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Mutations
export const create = mutation({
  args: {
    orderId: v.string(),
    studentId: v.id("users"),
    mentorId: v.id("users"),
    scheduleId: v.optional(v.string()),
    sessionTitle: v.string(),
    amount: v.number(),
    mentorFee: v.number(),
    adminFee: v.number(),
    bookingDetails: v.object({
      date: v.string(),
      time: v.string(),
      duration: v.number(),
      meetingType: v.union(v.literal("online"), v.literal("offline")),
      materials: v.array(v.string()),
      notes: v.optional(v.string()),
    }),
    expiredAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const expiredAt = args.expiredAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const transactionId = await ctx.db.insert("paymentTransactions", {
      ...args,
      status: "pending",
      expiredAt,
      createdAt: now,
      updatedAt: now,
    });

    return transactionId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("paymentTransactions"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("cancelled"),
      v.literal("expired")
    ),
    paymentMethod: v.optional(v.string()),
    midtransTransactionId: v.optional(v.string()),
    midtransToken: v.optional(v.string()),
    paidAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    const existingTransaction = await ctx.db.get(id);
    if (!existingTransaction) {
      throw new Error("Payment transaction not found");
    }

    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });

    return id;
  },
});

export const markAsPaid = mutation({
  args: {
    orderId: v.string(),
    paymentMethod: v.string(),
    midtransTransactionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db
      .query("paymentTransactions")
      .withIndex("by_order_id", (q) => q.eq("orderId", args.orderId))
      .unique();

    if (!transaction) {
      throw new Error("Payment transaction not found");
    }

    await ctx.db.patch(transaction._id, {
      status: "paid",
      paymentMethod: args.paymentMethod,
      midtransTransactionId: args.midtransTransactionId,
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return transaction._id;
  },
});

export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const transactions = await ctx.db.query("paymentTransactions").collect();

    const analytics = {
      totalRevenue: 0,
      totalTransactions: transactions.length,
      successfulTransactions: 0,
      pendingTransactions: 0,
      failedTransactions: 0,
      totalMentorPayouts: 0,
      totalAdminRevenue: 0,
      averageTransactionValue: 0,
    };

    transactions.forEach((t) => {
      switch (t.status) {
        case "paid":
          analytics.successfulTransactions++;
          analytics.totalRevenue += t.amount;
          analytics.totalMentorPayouts += t.mentorFee;
          analytics.totalAdminRevenue += t.adminFee;
          break;
        case "pending":
          analytics.pendingTransactions++;
          break;
        case "failed":
        case "cancelled":
        case "expired":
          analytics.failedTransactions++;
          break;
      }
    });

    analytics.averageTransactionValue =
      analytics.successfulTransactions > 0
        ? analytics.totalRevenue / analytics.successfulTransactions
        : 0;

    return analytics;
  },
});