import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Queries
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("mentorSchedules").collect();
  },
});

export const getById = query({
  args: { id: v.id("mentorSchedules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByMentor = query({
  args: { mentorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mentorSchedules")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .collect();
  },
});

// Support string mentorId for compatibility
export const getByMentorString = query({
  args: { mentorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mentorSchedules")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .collect();
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mentorSchedules")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getMentorScheduleByDate = query({
  args: {
    mentorId: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mentorSchedules")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();
  },
});

export const getAvailableSlots = query({
  args: {
    mentorId: v.optional(v.id("users")),
    date: v.string(),
    sessionType: v.optional(v.union(v.literal("online"), v.literal("offline"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("mentorSchedules")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .filter((q) => q.eq(q.field("isActive"), true));

    if (args.mentorId) {
      query = query.filter((q) => q.eq(q.field("mentorId"), args.mentorId));
    }

    const schedules = await query.collect();

    return schedules.map(schedule => ({
      ...schedule,
      availableSlots: schedule.timeSlots.filter(slot =>
        slot.isAvailable &&
        !slot.isBooked &&
        (!args.sessionType || slot.sessionType === args.sessionType)
      )
    })).filter(schedule => schedule.availableSlots.length > 0);
  },
});

export const getMentorWeeklySchedule = query({
  args: {
    mentorId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mentorSchedules")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .filter((q) => q.gte(q.field("date"), args.startDate))
      .filter((q) => q.lte(q.field("date"), args.endDate))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Mutations
export const create = mutation({
  args: {
    mentorId: v.id("users"),
    date: v.string(),
    timeSlots: v.array(v.object({
      startTime: v.string(),
      endTime: v.string(),
      isAvailable: v.boolean(),
      isBooked: v.boolean(),
      bookingId: v.optional(v.string()),
      sessionType: v.union(v.literal("online"), v.literal("offline")),
      maxStudents: v.number(),
      currentStudents: v.number(),
      materials: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
    })),
    recurringType: v.optional(v.union(
      v.literal("none"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    )),
    recurringUntil: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    return await ctx.db.insert("mentorSchedules", {
      ...args,
      lastModified: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("mentorSchedules"),
    timeSlots: v.optional(v.array(v.object({
      startTime: v.string(),
      endTime: v.string(),
      isAvailable: v.boolean(),
      isBooked: v.boolean(),
      bookingId: v.optional(v.string()),
      sessionType: v.union(v.literal("online"), v.literal("offline")),
      maxStudents: v.number(),
      currentStudents: v.number(),
      materials: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
    }))),
    recurringType: v.optional(v.union(
      v.literal("none"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    )),
    recurringUntil: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = new Date().toISOString();

    return await ctx.db.patch(id, {
      ...updates,
      lastModified: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("mentorSchedules") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const bookSlot = mutation({
  args: {
    scheduleId: v.id("mentorSchedules"),
    slotIndex: v.number(),
    bookingId: v.string(),
    studentCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    const updatedSlots = [...schedule.timeSlots];
    const slot = updatedSlots[args.slotIndex];

    if (!slot || !slot.isAvailable || slot.isBooked) {
      throw new Error("Slot not available for booking");
    }

    if (slot.currentStudents + (args.studentCount || 1) > slot.maxStudents) {
      throw new Error("Slot capacity exceeded");
    }

    updatedSlots[args.slotIndex] = {
      ...slot,
      isBooked: true,
      bookingId: args.bookingId,
      currentStudents: slot.currentStudents + (args.studentCount || 1),
    };

    return await ctx.db.patch(args.scheduleId, {
      timeSlots: updatedSlots,
      lastModified: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

export const cancelBooking = mutation({
  args: {
    scheduleId: v.id("mentorSchedules"),
    bookingId: v.string(),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    const updatedSlots = schedule.timeSlots.map(slot => {
      if (slot.bookingId === args.bookingId) {
        return {
          ...slot,
          isBooked: false,
          bookingId: undefined,
          currentStudents: Math.max(0, slot.currentStudents - 1),
        };
      }
      return slot;
    });

    return await ctx.db.patch(args.scheduleId, {
      timeSlots: updatedSlots,
      lastModified: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

export const toggleSlotAvailability = mutation({
  args: {
    scheduleId: v.id("mentorSchedules"),
    slotIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    const updatedSlots = [...schedule.timeSlots];
    const slot = updatedSlots[args.slotIndex];

    if (!slot) throw new Error("Slot not found");

    updatedSlots[args.slotIndex] = {
      ...slot,
      isAvailable: !slot.isAvailable,
    };

    return await ctx.db.patch(args.scheduleId, {
      timeSlots: updatedSlots,
      lastModified: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

// Utility functions
export const getMentorAvailabilityStats = query({
  args: {
    mentorId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const schedules = await ctx.db
      .query("mentorSchedules")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .filter((q) => q.gte(q.field("date"), args.startDate))
      .filter((q) => q.lte(q.field("date"), args.endDate))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    let totalSlots = 0;
    let availableSlots = 0;
    let bookedSlots = 0;

    schedules.forEach(schedule => {
      schedule.timeSlots.forEach(slot => {
        totalSlots++;
        if (slot.isAvailable && !slot.isBooked) availableSlots++;
        if (slot.isBooked) bookedSlots++;
      });
    });

    const utilizationRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

    return {
      totalSlots,
      availableSlots,
      bookedSlots,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      scheduleDays: schedules.length,
    };
  },
});

export const getUpcomingSchedules = query({
  args: { mentorId: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];

    return await ctx.db
      .query("mentorSchedules")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .filter((q) => q.gte(q.field("date"), today))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .take(10);
  },
});