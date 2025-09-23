import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createAdminWithPassword = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete existing admin if exists
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "admin@ajarka.com"))
      .unique();

    if (existingAdmin) {
      await ctx.db.delete(existingAdmin._id);
    }

    // Create new admin with known password
    const now = new Date().toISOString();

    // Password: "admin123" hashed with bcrypt
    const hashedPassword = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeKKKGU/gdc9JqVrm";

    const adminId = await ctx.db.insert("users", {
      email: "admin@ajarka.com",
      name: "Admin Ajarka",
      password: hashedPassword,
      role: "admin",
      avatar: "https://ui-avatars.com/api/?name=Admin+Ajarka&background=dc2626&color=fff",
      phone: "+62123456789",
      emailVerified: true,
      bio: "Administrator Ajarka - Platform pembelajaran coding terpercaya",
      skills: ["Management", "Teaching", "Technology"],
      createdAt: now,
      updatedAt: now,
    });

    return {
      message: "Admin user created successfully",
      adminId,
      credentials: {
        email: "admin@ajarka.com",
        password: "admin123"
      }
    };
  },
});