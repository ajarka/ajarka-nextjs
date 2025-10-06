import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Queries
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("availabilitySlots").collect();
  },
});

export const getById = query({
  args: { id: v.id("availabilitySlots") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByMentor = query({
  args: { mentorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("availabilitySlots")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .collect();
  },
});

export const getBySchedule = query({
  args: { scheduleId: v.id("mentorSchedules") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("availabilitySlots")
      .withIndex("by_schedule", (q) => q.eq("scheduleId", args.scheduleId))
      .collect();
  },
});

export const getActiveByMentor = query({
  args: { mentorId: v.string() },
  handler: async (ctx, args) => {
    const slots = await ctx.db
      .query("availabilitySlots")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .collect();

    return slots.filter(s => s.isActive);
  },
});

// Mutations
export const create = mutation({
  args: {
    mentorId: v.string(),
    scheduleId: v.optional(v.id("mentorSchedules")),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    isRecurring: v.boolean(),
    specificDate: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    const slotId = await ctx.db.insert("availabilitySlots", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    return slotId;
  },
});

export const update = mutation({
  args: {
    id: v.id("availabilitySlots"),
    dayOfWeek: v.optional(v.number()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
    specificDate: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    const existingSlot = await ctx.db.get(id);
    if (!existingSlot) {
      throw new Error("Availability slot not found");
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
  args: { id: v.id("availabilitySlots") },
  handler: async (ctx, args) => {
    const existingSlot = await ctx.db.get(args.id);
    if (!existingSlot) {
      throw new Error("Availability slot not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const bulkCreate = mutation({
  args: {
    slots: v.array(v.object({
      mentorId: v.string(),
      scheduleId: v.optional(v.id("mentorSchedules")),
      dayOfWeek: v.number(),
      startTime: v.string(),
      endTime: v.string(),
      isRecurring: v.boolean(),
      specificDate: v.optional(v.string()),
      isActive: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const slotIds = [];

    for (const slot of args.slots) {
      const slotId = await ctx.db.insert("availabilitySlots", {
        ...slot,
        createdAt: now,
        updatedAt: now,
      });
      slotIds.push(slotId);
    }

    return { success: true, ids: slotIds };
  },
});

export const deleteBySchedule = mutation({
  args: { scheduleId: v.id("mentorSchedules") },
  handler: async (ctx, args) => {
    const slots = await ctx.db
      .query("availabilitySlots")
      .withIndex("by_schedule", (q) => q.eq("scheduleId", args.scheduleId))
      .collect();

    for (const slot of slots) {
      await ctx.db.delete(slot._id);
    }

    return { success: true, deleted: slots.length };
  },
});
