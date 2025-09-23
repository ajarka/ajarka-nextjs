import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createAdminUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if admin already exists
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "admin@ajarka.com"))
      .unique();

    if (existingAdmin) {
      return {
        message: "Admin user already exists",
        user: existingAdmin
      };
    }

    // Create admin user
    const now = new Date().toISOString();
    const adminId = await ctx.db.insert("users", {
      email: "admin@ajarka.com",
      name: "Admin Ajarka",
      // Password: "admin123" (hashed with bcrypt)
      password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeKKKGU/gdc9JqVrm",
      role: "admin",
      avatar: "https://ui-avatars.com/api/?name=Admin+Ajarka&background=0d47a1&color=fff",
      phone: "+62123456789",
      emailVerified: true,
      bio: "Administrator Ajarka - Platform pembelajaran coding terpercaya",
      skills: ["Management", "Teaching", "Technology"],
      createdAt: now,
      updatedAt: now,
    });

    // Also create a mentor user for testing
    const mentorId = await ctx.db.insert("users", {
      email: "mentor@ajarka.com",
      name: "Mentor Ajarka",
      // Password: "mentor123" (hashed with bcrypt)
      password: "$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      role: "mentor",
      avatar: "https://ui-avatars.com/api/?name=Mentor+Ajarka&background=4caf50&color=fff",
      phone: "+62123456790",
      emailVerified: true,
      bio: "Mentor berpengalaman di bidang full-stack development",
      skills: ["React", "Node.js", "JavaScript", "TypeScript", "Python"],
      rating: 4.8,
      totalStudents: 150,
      level: "Senior",
      createdAt: now,
      updatedAt: now,
    });

    // Create a student user for testing
    const studentId = await ctx.db.insert("users", {
      email: "student@ajarka.com",
      name: "Student Ajarka",
      // Password: "student123" (hashed with bcrypt)
      password: "$2a$12$N3Qm8fYoGqGiO5ZGKkL8Se7gHhJ2gJ7IYY5JZUgFYrB6QgGK8GQwu",
      role: "siswa",
      avatar: "https://ui-avatars.com/api/?name=Student+Ajarka&background=ff9800&color=fff",
      phone: "+62123456791",
      emailVerified: true,
      bio: "Siswa yang sedang belajar programming",
      level: "Beginner",
      interests: ["Web Development", "Mobile Development"],
      createdAt: now,
      updatedAt: now,
    });

    return {
      message: "Admin, mentor, and student users created successfully",
      adminId,
      mentorId,
      studentId,
      credentials: {
        admin: { email: "admin@ajarka.com", password: "admin123" },
        mentor: { email: "mentor@ajarka.com", password: "mentor123" },
        student: { email: "student@ajarka.com", password: "student123" }
      }
    };
  },
});