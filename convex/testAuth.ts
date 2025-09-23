import { query } from "./_generated/server";
import { v } from "convex/values";

export const testGetUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique();

      return {
        success: true,
        user: user || null,
        message: user ? "User found" : "User not found"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Error occurred"
      };
    }
  },
});