import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - unified untuk admin, mentor, siswa
  users: defineTable({
    email: v.string(),
    name: v.string(),
    password: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("mentor"), v.literal("siswa")),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
    provider: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),

    // Mentor specific fields
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    totalStudents: v.optional(v.number()),
    experienceYears: v.optional(v.number()),
    company: v.optional(v.string()),
    specialization: v.optional(v.array(v.string())),

    // Student specific fields
    level: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    studyGoals: v.optional(v.array(v.string())),

    // Additional fields from JSON server
    age: v.optional(v.number()),
    location: v.optional(v.string()),
    timezone: v.optional(v.string()),
    preferredLanguage: v.optional(v.string()),
    socialMedia: v.optional(v.object({
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      portfolio: v.optional(v.string()),
    })),

    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_email", ["email"])
  .index("by_role", ["role"])
  .index("by_skills", ["skills"])
  .index("by_specialization", ["specialization"]),

  // Courses table
  courses: defineTable({
    title: v.string(),
    description: v.string(),
    price: v.number(),
    duration: v.string(),
    level: v.union(v.literal("Beginner"), v.literal("Intermediate"), v.literal("Advanced")),
    category: v.string(),
    mentorId: v.id("users"),
    syllabus: v.array(v.string()),
    thumbnail: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_mentor", ["mentorId"])
  .index("by_category", ["category"])
  .index("by_level", ["level"]),

  // Bundle Packages table
  bundlePackages: defineTable({
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("session_pack"),
      v.literal("custom")
    ),
    sessionCount: v.number(),
    originalPrice: v.number(),
    discountPercentage: v.number(),
    finalPrice: v.number(),
    validityDays: v.number(),
    isActive: v.boolean(),
    features: v.array(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_type", ["type"])
  .index("by_active", ["isActive"]),

  // Student Subscriptions table
  studentSubscriptions: defineTable({
    studentId: v.id("users"),
    bundleId: v.id("bundlePackages"),
    bundleName: v.string(),
    totalSessions: v.number(),
    usedSessions: v.number(),
    remainingSessions: v.number(),
    originalPrice: v.number(),
    paidPrice: v.number(),
    discountAmount: v.number(),
    purchaseDate: v.string(),
    expiryDate: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("cancelled"),
      v.literal("suspended")
    ),
    transactions: v.array(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_student", ["studentId"])
  .index("by_bundle", ["bundleId"])
  .index("by_status", ["status"]),

  // Payment Transactions table
  paymentTransactions: defineTable({
    orderId: v.string(),
    studentId: v.id("users"),
    mentorId: v.id("users"),
    scheduleId: v.optional(v.string()),
    sessionTitle: v.string(),
    amount: v.number(),
    mentorFee: v.number(),
    adminFee: v.number(),
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
    expiredAt: v.string(),
    bookingDetails: v.object({
      date: v.string(),
      time: v.string(),
      duration: v.number(),
      meetingType: v.union(v.literal("online"), v.literal("offline")),
      materials: v.array(v.string()),
      notes: v.optional(v.string()),
    }),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_student", ["studentId"])
  .index("by_mentor", ["mentorId"])
  .index("by_status", ["status"])
  .index("by_order_id", ["orderId"]),

  // Bookings table
  bookings: defineTable({
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
    status: v.union(
      v.literal("confirmed"),
      v.literal("pending"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    meetingLink: v.optional(v.string()),
    meetingId: v.optional(v.string()),
    meetingProvider: v.optional(v.string()),
    studentNotes: v.optional(v.string()),
    mentorNotes: v.optional(v.string()),
    price: v.number(),
    paymentStatus: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_student", ["studentId"])
  .index("by_mentor", ["mentorId"])
  .index("by_date", ["date"])
  .index("by_status", ["status"]),

  // Learning Materials table
  learningMaterials: defineTable({
    title: v.string(),
    category: v.union(
      v.literal("frontend"),
      v.literal("backend"),
      v.literal("fullstack"),
      v.literal("mobile"),
      v.literal("devops"),
      v.literal("data")
    ),
    subcategory: v.union(
      v.literal("fundamental"),
      v.literal("framework"),
      v.literal("advanced"),
      v.literal("specialization")
    ),
    level: v.number(),
    prerequisites: v.array(v.string()),
    estimatedHours: v.number(),
    meetingsRequired: v.number(),
    description: v.string(),
    learningObjectives: v.array(v.string()),
    resources: v.array(v.object({
      type: v.union(v.literal("video"), v.literal("article"), v.literal("documentation"), v.literal("tool")),
      title: v.string(),
      url: v.string(),
      duration: v.number(),
    })),
    assignments: v.array(v.string()),
    projects: v.array(v.string()),
    skills: v.array(v.string()),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("expert")
    ),
    isActive: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_category", ["category"])
  .index("by_level", ["level"])
  .index("by_difficulty", ["difficulty"]),

  // Notifications table
  notifications: defineTable({
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
    read: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_recipient", ["recipientId"])
  .index("by_type", ["type"])
  .index("by_read", ["read"]),

  // Discount Rules - rules untuk discount calculation
  discountRules: defineTable({
    name: v.string(),
    description: v.string(),
    type: v.union(v.literal("percentage"), v.literal("fixed_amount")),
    value: v.number(),
    minSessions: v.optional(v.number()),
    maxSessions: v.optional(v.number()),
    minAmount: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    isActive: v.boolean(),
    validFrom: v.optional(v.string()),
    validUntil: v.optional(v.string()),
    applicableRoles: v.optional(v.array(v.string())),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_type", ["type"])
  .index("by_active", ["isActive"]),

  // Admin Pricing Rules - admin controlled pricing
  adminPricingRules: defineTable({
    ruleName: v.string(),
    category: v.union(
      v.literal("session_pricing"),
      v.literal("bundle_discount"),
      v.literal("mentor_commission"),
      v.literal("platform_fee")
    ),
    basePrice: v.number(),
    mentorShare: v.number(),
    platformFee: v.number(),
    discountTiers: v.array(v.object({
      sessionCount: v.number(),
      discountPercentage: v.number(),
    })),
    specialRates: v.optional(v.object({
      newStudentDiscount: v.number(),
      loyaltyDiscount: v.number(),
      referralDiscount: v.number(),
    })),
    isActive: v.boolean(),
    effectiveDate: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_category", ["category"])
  .index("by_active", ["isActive"]),

  // Admin Office Locations - lokasi kantor untuk offline meeting
  adminOfficeLocations: defineTable({
    name: v.string(),
    address: v.string(),
    city: v.string(),
    province: v.string(),
    postalCode: v.string(),
    coordinates: v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
    facilities: v.array(v.string()),
    capacity: v.number(),
    operatingHours: v.object({
      weekdays: v.string(),
      weekends: v.string(),
    }),
    contactPerson: v.string(),
    contactPhone: v.string(),
    isActive: v.boolean(),
    photos: v.optional(v.array(v.string())),
    amenities: v.optional(v.array(v.string())),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_city", ["city"])
  .index("by_active", ["isActive"]),

  // Admin Event Templates - template untuk event/workshop
  adminEventTemplates: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("workshop"),
      v.literal("webinar"),
      v.literal("bootcamp"),
      v.literal("masterclass")
    ),
    duration: v.number(),
    maxParticipants: v.number(),
    minParticipants: v.number(),
    materials: v.array(v.string()),
    requirements: v.array(v.string()),
    price: v.number(),
    instructorRequirements: v.array(v.string()),
    learningObjectives: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_category", ["category"])
  .index("by_active", ["isActive"]),

  // Admin Settings - global system settings
  adminSettings: defineTable({
    settingGroup: v.string(),
    settingKey: v.string(),
    settingValue: v.any(),
    settingType: v.union(
      v.literal("string"),
      v.literal("number"),
      v.literal("boolean"),
      v.literal("object"),
      v.literal("array")
    ),
    description: v.string(),
    isEditable: v.boolean(),
    lastModifiedBy: v.string(),
    lastModifiedAt: v.string(),
    createdAt: v.string(),
  })
  .index("by_group", ["settingGroup"])
  .index("by_key", ["settingKey"]),

  // Mentor Payouts - pembayaran ke mentor
  mentorPayouts: defineTable({
    mentorId: v.id("users"),
    payoutPeriod: v.string(),
    totalEarnings: v.number(),
    platformFee: v.number(),
    netPayout: v.number(),
    sessionsCount: v.number(),
    transactions: v.array(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("processed"),
      v.literal("paid"),
      v.literal("cancelled")
    ),
    paymentMethod: v.optional(v.string()),
    paymentDetails: v.optional(v.object({
      bankName: v.string(),
      accountNumber: v.string(),
      accountName: v.string(),
    })),
    processedAt: v.optional(v.string()),
    paidAt: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_mentor", ["mentorId"])
  .index("by_status", ["status"])
  .index("by_period", ["payoutPeriod"]),

  // General Transactions - transaksi umum selain payment
  transactions: defineTable({
    transactionId: v.string(),
    userId: v.id("users"),
    type: v.union(
      v.literal("course_purchase"),
      v.literal("bundle_purchase"),
      v.literal("session_booking"),
      v.literal("refund"),
      v.literal("payout"),
      v.literal("fee")
    ),
    amount: v.number(),
    description: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    metadata: v.optional(v.any()),
    referenceId: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_user", ["userId"])
  .index("by_type", ["type"])
  .index("by_status", ["status"])
  .index("by_transaction_id", ["transactionId"]),

  // Comments/Reviews - ulasan dan komentar
  comments: defineTable({
    authorId: v.id("users"),
    targetType: v.union(
      v.literal("course"),
      v.literal("mentor"),
      v.literal("session"),
      v.literal("booking")
    ),
    targetId: v.string(),
    rating: v.optional(v.number()),
    comment: v.string(),
    isPublic: v.boolean(),
    isVerified: v.boolean(),
    parentCommentId: v.optional(v.id("comments")),
    likes: v.optional(v.number()),
    dislikes: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("hidden")
    ),
    moderatedBy: v.optional(v.string()),
    moderatedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_author", ["authorId"])
  .index("by_target", ["targetType", "targetId"])
  .index("by_status", ["status"]),

  // Categories - kategori untuk courses dan content
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    parentCategoryId: v.optional(v.id("categories")),
    level: v.number(),
    displayOrder: v.number(),
    isActive: v.boolean(),
    metadata: v.optional(v.object({
      prerequisites: v.optional(v.array(v.string())),
      estimatedDuration: v.optional(v.string()),
      difficulty: v.optional(v.string()),
    })),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_slug", ["slug"])
  .index("by_parent", ["parentCategoryId"])
  .index("by_level", ["level"])
  .index("by_active", ["isActive"]),

  // Roadmaps - learning path/roadmap
  roadmaps: defineTable({
    title: v.string(),
    description: v.string(),
    targetAudience: v.array(v.string()),
    estimatedDuration: v.string(),
    difficultyLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("expert")
    ),
    skills: v.array(v.string()),
    prerequisites: v.array(v.string()),
    learningPath: v.array(v.object({
      stepNumber: v.number(),
      title: v.string(),
      description: v.string(),
      estimatedHours: v.number(),
      materials: v.array(v.string()),
      courses: v.optional(v.array(v.string())),
      assessments: v.optional(v.array(v.string())),
    })),
    createdBy: v.id("users"),
    isPublic: v.boolean(),
    isActive: v.boolean(),
    tags: v.optional(v.array(v.string())),
    thumbnail: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_creator", ["createdBy"])
  .index("by_difficulty", ["difficultyLevel"])
  .index("by_public", ["isPublic"])
  .index("by_active", ["isActive"]),

  // Email Verifications - untuk email verification process
  emailVerifications: defineTable({
    userId: v.id("users"),
    email: v.string(),
    verificationCode: v.string(),
    isUsed: v.boolean(),
    expiresAt: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    verifiedAt: v.optional(v.string()),
    createdAt: v.string(),
  })
  .index("by_user", ["userId"])
  .index("by_email", ["email"])
  .index("by_code", ["verificationCode"])
  .index("by_used", ["isUsed"]),

  // Mentor Schedules - jadwal mentor yang available
  mentorSchedules: defineTable({
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
    lastModified: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_mentor", ["mentorId"])
  .index("by_date", ["date"])
  .index("by_active", ["isActive"]),
});