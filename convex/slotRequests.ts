import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Queries
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("slotRequests").collect();
  },
});

export const getById = query({
  args: { id: v.id("slotRequests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByStudent = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("slotRequests")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
  },
});

export const getByMentor = query({
  args: { mentorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("slotRequests")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .collect();
  },
});

export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("slotRequests")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const getPendingByMentor = query({
  args: { mentorId: v.string() },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("slotRequests")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .collect();

    return requests.filter(r => r.status === "pending");
  },
});

// Mutations
export const create = mutation({
  args: {
    studentId: v.string(),
    studentName: v.string(),
    studentEmail: v.string(),
    mentorId: v.string(),
    scheduleId: v.string(),
    scheduleTitle: v.string(),
    requestedDate: v.string(),
    requestedTime: v.string(),
    duration: v.number(),
    preferredMeetingType: v.union(v.literal("online"), v.literal("offline")),
    materials: v.array(v.string()),
    notes: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    const requestId = await ctx.db.insert("slotRequests", {
      ...args,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return requestId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("slotRequests"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled")
    ),
    responseMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    const existingRequest = await ctx.db.get(id);
    if (!existingRequest) {
      throw new Error("Slot request not found");
    }

    const now = new Date().toISOString();

    await ctx.db.patch(id, {
      ...updateData,
      respondedAt: now,
      updatedAt: now,
    });

    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("slotRequests"),
    requestedDate: v.optional(v.string()),
    requestedTime: v.optional(v.string()),
    preferredMeetingType: v.optional(v.union(v.literal("online"), v.literal("offline"))),
    materials: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    const existingRequest = await ctx.db.get(id);
    if (!existingRequest) {
      throw new Error("Slot request not found");
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
  args: { id: v.id("slotRequests") },
  handler: async (ctx, args) => {
    const existingRequest = await ctx.db.get(args.id);
    if (!existingRequest) {
      throw new Error("Slot request not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const bulkUpdateStatus = mutation({
  args: {
    ids: v.array(v.id("slotRequests")),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled")
    ),
    responseMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    for (const id of args.ids) {
      const existingRequest = await ctx.db.get(id);
      if (existingRequest) {
        await ctx.db.patch(id, {
          status: args.status,
          responseMessage: args.responseMessage,
          respondedAt: now,
          updatedAt: now,
        });
      }
    }

    return { success: true, updated: args.ids.length };
  },
});
