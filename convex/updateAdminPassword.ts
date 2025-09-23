import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateAdminPassword = mutation({
  args: {},
  handler: async (ctx) => {
    // Find admin user
    const admin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "admin@ajarka.com"))
      .unique();

    if (!admin) {
      throw new Error("Admin user not found");
    }

    // Update with new password hash
    const newHashedPassword = "$2b$12$TEqsin1b4xoSdln3exW2QOSYEEStg31OsOMwBJLOjG1JQu1U7EHAa";

    await ctx.db.patch(admin._id, {
      password: newHashedPassword,
      updatedAt: new Date().toISOString(),
    });

    return {
      message: "Admin password updated successfully",
      email: "admin@ajarka.com",
      password: "admin123"
    };
  },
});