import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all bookings
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bookings").collect();
  },
});

// Get bookings by mentor ID (supports both Convex ID and string)
export const getByMentor = query({
  args: { mentorId: v.string() },
  handler: async (ctx, args) => {
    // Try to find by mentorId as Convex ID
    try {
      const mentorConvexId = args.mentorId as Id<"users">;
      return await ctx.db
        .query("bookings")
        .withIndex("by_mentor", (q) => q.eq("mentorId", mentorConvexId))
        .collect();
    } catch {
      // If not a valid Convex ID, return empty array
      return [];
    }
  },
});

// Get bookings by student ID
export const getByStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
  },
});

// Get bookings by status
export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("confirmed"),
      v.literal("pending"),
      v.literal("cancelled"),
      v.literal("completed")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Get bookings by date
export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});

// Get booking by ID
export const getById = query({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new booking
export const create = mutation({
  args: {
    studentId: v.id("users"),
    mentorId: v.id("users"),
    scheduleId: v.string(),
    transactionId: v.optional(v.string()),
    sessionTitle: v.string(),
    date: v.string(),
    time: v.string(),
    endTime: v.optional(v.string()),
    duration: v.number(),
    meetingType: v.union(v.literal("online"), v.literal("offline")),
    materials: v.array(v.string()),
    notes: v.optional(v.string()),
    meetingLink: v.optional(v.string()),
    meetingId: v.optional(v.string()),
    meetingProvider: v.optional(v.string()),
    studentNotes: v.optional(v.string()),
    mentorNotes: v.optional(v.string()),
    price: v.number(),
    paymentStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const bookingId = await ctx.db.insert("bookings", {
      ...args,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
    return bookingId;
  },
});

// Update booking status
export const updateStatus = mutation({
  args: {
    id: v.id("bookings"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("pending"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const { id, status } = args;
    await ctx.db.patch(id, {
      status,
      updatedAt: new Date().toISOString(),
    });
    return id;
  },
});

// Update booking
export const update = mutation({
  args: {
    id: v.id("bookings"),
    studentId: v.optional(v.id("users")),
    mentorId: v.optional(v.id("users")),
    scheduleId: v.optional(v.string()),
    transactionId: v.optional(v.string()),
    sessionTitle: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    endTime: v.optional(v.string()),
    duration: v.optional(v.number()),
    meetingType: v.optional(v.union(v.literal("online"), v.literal("offline"))),
    materials: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("confirmed"),
      v.literal("pending"),
      v.literal("cancelled"),
      v.literal("completed")
    )),
    meetingLink: v.optional(v.string()),
    meetingId: v.optional(v.string()),
    meetingProvider: v.optional(v.string()),
    studentNotes: v.optional(v.string()),
    mentorNotes: v.optional(v.string()),
    price: v.optional(v.number()),
    paymentStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return id;
  },
});

// Delete booking
export const remove = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
