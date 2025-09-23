import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Queries
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notifications").collect();
  },
});

export const getById = query({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByRecipient = query({
  args: {
    recipientId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", args.recipientId))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

export const getUnreadByRecipient = query({
  args: { recipientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", args.recipientId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();
  },
});

export const getUnreadCountByRecipient = query({
  args: { recipientId: v.string() },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", args.recipientId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    return unreadNotifications.length;
  },
});

export const getByType = query({
  args: {
    type: v.union(
      v.literal("schedule_created"),
      v.literal("booking_created"),
      v.literal("booking_confirmed"),
      v.literal("booking_cancelled"),
      v.literal("meeting_link_generated"),
      v.literal("availability_updated"),
      v.literal("availability_deleted")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .order("desc")
      .collect();
  },
});

// Mutations
export const create = mutation({
  args: {
    recipientId: v.string(),
    recipientType: v.union(v.literal("siswa"), v.literal("mentor"), v.literal("admin")),
    senderId: v.string(),
    senderType: v.union(v.literal("siswa"), v.literal("mentor"), v.literal("admin")),
    type: v.union(
      v.literal("schedule_created"),
      v.literal("booking_created"),
      v.literal("booking_confirmed"),
      v.literal("booking_cancelled"),
      v.literal("meeting_link_generated"),
      v.literal("availability_updated"),
      v.literal("availability_deleted")
    ),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    read: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    const notificationId = await ctx.db.insert("notifications", {
      ...args,
      read: args.read ?? false,
      createdAt: now,
      updatedAt: now,
    });

    return notificationId;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    // Check if notification exists
    const existingNotification = await ctx.db.get(args.id);
    if (!existingNotification) {
      throw new Error("Notification not found");
    }

    const now = new Date().toISOString();

    await ctx.db.patch(args.id, {
      read: true,
      updatedAt: now,
    });

    return args.id;
  },
});

export const markAllAsReadByRecipient = mutation({
  args: { recipientId: v.string() },
  handler: async (ctx, args) => {
    // Get all unread notifications for this recipient
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", args.recipientId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    const now = new Date().toISOString();

    // Mark all as read
    const promises = unreadNotifications.map(notification =>
      ctx.db.patch(notification._id, {
        read: true,
        updatedAt: now,
      })
    );

    await Promise.all(promises);

    return { updated: unreadNotifications.length };
  },
});

export const remove = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    // Check if notification exists
    const existingNotification = await ctx.db.get(args.id);
    if (!existingNotification) {
      throw new Error("Notification not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const update = mutation({
  args: {
    id: v.id("notifications"),
    title: v.optional(v.string()),
    message: v.optional(v.string()),
    data: v.optional(v.any()),
    read: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    // Check if notification exists
    const existingNotification = await ctx.db.get(id);
    if (!existingNotification) {
      throw new Error("Notification not found");
    }

    const now = new Date().toISOString();

    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: now,
    });

    return id;
  },
});

// Bulk operations
export const createBulk = mutation({
  args: {
    notifications: v.array(v.object({
      recipientId: v.string(),
      recipientType: v.union(v.literal("siswa"), v.literal("mentor"), v.literal("admin")),
      senderId: v.string(),
      senderType: v.union(v.literal("siswa"), v.literal("mentor"), v.literal("admin")),
      type: v.union(
        v.literal("schedule_created"),
        v.literal("booking_created"),
        v.literal("booking_confirmed"),
        v.literal("booking_cancelled"),
        v.literal("meeting_link_generated"),
        v.literal("availability_updated"),
        v.literal("availability_deleted")
      ),
      title: v.string(),
      message: v.string(),
      data: v.optional(v.any()),
      read: v.optional(v.boolean()),
    }))
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    const promises = args.notifications.map(notification =>
      ctx.db.insert("notifications", {
        ...notification,
        read: notification.read ?? false,
        createdAt: now,
        updatedAt: now,
      })
    );

    const notificationIds = await Promise.all(promises);
    return notificationIds;
  },
});

// Analytics
export const getNotificationStats = query({
  args: { recipientId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let query = ctx.db.query("notifications");

    if (args.recipientId) {
      query = query.withIndex("by_recipient", (q) => q.eq("recipientId", args.recipientId));
    }

    const notifications = await query.collect();

    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const read = total - unread;

    const byType = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      read,
      unread,
      byType
    };
  },
});