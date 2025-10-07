import { BaseService } from './base/base-service';
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export interface AdminPricingRule {
  _id: Id<"adminPricingRules">;
  ruleName: string;
  category: "session_pricing" | "bundle_discount" | "mentor_commission" | "platform_fee";
  basePrice: number;
  mentorShare: number;
  platformFee: number;
  discountTiers: Array<{
    sessionCount: number;
    discountPercentage: number;
  }>;
  specialRates?: {
    newStudentDiscount: number;
    loyaltyDiscount: number;
    referralDiscount: number;
  };
  isActive: boolean;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeLocation {
  _id: Id<"adminOfficeLocations">;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  facilities: string[];
  capacity: number;
  operatingHours: {
    weekdays: string;
    weekends: string;
  };
  contactPerson: string;
  contactPhone: string;
  isActive: boolean;
  photos?: string[];
  amenities?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DiscountRule {
  _id: Id<"discountRules">;
  name: string;
  description: string;
  type: "percentage" | "fixed_amount";
  value: number;
  minSessions?: number;
  maxSessions?: number;
  minAmount?: number;
  maxDiscount?: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  applicableRoles?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettings {
  _id: Id<"adminSettings">;
  settingGroup: string;
  settingKey: string;
  settingValue: any;
  settingType: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  isEditable: boolean;
  lastModifiedBy: string;
  lastModifiedAt: string;
  createdAt: string;
}

export interface EventTemplate {
  _id: Id<"eventTemplates">;
  title: string;
  description: string;
  category: string;
  duration: number;
  maxParticipants: number;
  isOnline: boolean;
  materials: string[];
  requirements: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class AdminService extends BaseService {
  // Static methods for non-React usage
  static async getPricingRules(): Promise<AdminPricingRule[]> {
    try {
      return await this.query("adminPricingRules:getAll") || []
    } catch (error) {
      console.error('Error fetching pricing rules:', error)
      return []
    }
  }

  static async getOfficeLocations(): Promise<OfficeLocation[]> {
    try {
      return await this.query("adminOfficeLocations:getAll") || []
    } catch (error) {
      console.error('Error fetching office locations:', error)
      return []
    }
  }

  static calculateMentorFee(studentPrice: number, mentorFeePercentage: number): number {
    return Math.round(studentPrice * (mentorFeePercentage / 100))
  }

  static calculateAdminFee(studentPrice: number, adminFeePercentage: number): number {
    return Math.round(studentPrice * (adminFeePercentage / 100))
  }

  static calculatePlatformFee(studentPrice: number, mentorFeePercentage: number): number {
    const mentorFee = this.calculateMentorFee(studentPrice, mentorFeePercentage)
    return studentPrice - mentorFee
  }

  static calculateSessionPrice(
    pricingRules: AdminPricingRule[],
    params: {
      materials: any[];
      duration: number;
      isOnline: boolean;
      sessionType: string;
    }
  ): number {
    const breakdown = this.calculateSessionPriceWithBreakdown(pricingRules, params)
    return breakdown.finalPrice
  }

  static calculateSessionPriceWithBreakdown(
    pricingRules: AdminPricingRule[],
    params: {
      materials: any[];
      duration: number;
      isOnline: boolean;
      sessionType: string;
    }
  ): {
    basePrice: number;
    levelMultiplier: number;
    levelBonus: number;
    durationMultiplier: number;
    locationMultiplier: number;
    locationBonus: number;
    subtotal: number;
    finalPrice: number;
    mentorShare: number;
    mentorEarnings: number;
    platformFee: number;
    platformEarnings: number;
    maxLevel: number;
    category: string;
  } {
    // Find active session pricing rule
    const sessionPricingRule = pricingRules.find(
      rule => rule.category === 'session_pricing' && rule.isActive
    )

    const defaultBasePrice = params.duration * 2000 // Fallback: Rp 2000 per minute

    if (!sessionPricingRule) {
      const settings = this.getSettings()
      const finalPrice = defaultBasePrice
      const mentorEarnings = Math.round(finalPrice * (settings.mentorFeePercentage / 100))
      const platformEarnings = finalPrice - mentorEarnings

      return {
        basePrice: defaultBasePrice,
        levelMultiplier: 1,
        levelBonus: 0,
        durationMultiplier: 1,
        locationMultiplier: 1,
        locationBonus: 0,
        subtotal: defaultBasePrice,
        finalPrice: defaultBasePrice,
        mentorShare: settings.mentorFeePercentage,
        mentorEarnings,
        platformFee: settings.platformFeePercentage,
        platformEarnings,
        maxLevel: 1,
        category: 'Default'
      }
    }

    let basePrice = sessionPricingRule.basePrice
    const category = sessionPricingRule.ruleName || 'Session Pricing'

    // Calculate level multiplier (use highest level from materials)
    let maxLevel = 1
    let levelMultiplier = 1
    if (params.materials && params.materials.length > 0) {
      maxLevel = Math.max(...params.materials.map((m: any) => m.level || 1))
      // Add 10% per level above 1
      levelMultiplier = 1 + ((maxLevel - 1) * 0.1)
    }
    const levelBonus = Math.round(basePrice * (levelMultiplier - 1))

    // Calculate duration multiplier (base price is for 60 minutes)
    const durationMultiplier = params.duration / 60

    // Calculate location multiplier
    let locationMultiplier = 1
    if (!params.isOnline) {
      locationMultiplier = 1.2 // Offline sessions cost 20% more
    }
    const priceAfterLevel = basePrice * levelMultiplier
    const locationBonus = Math.round(priceAfterLevel * durationMultiplier * (locationMultiplier - 1))

    // Calculate final price
    const subtotal = basePrice * levelMultiplier * durationMultiplier
    const finalPrice = Math.round(subtotal * locationMultiplier)

    // Calculate mentor and platform earnings
    const mentorShare = sessionPricingRule.mentorShare
    const mentorEarnings = Math.round(finalPrice * (mentorShare / 100))
    const platformFee = 100 - mentorShare
    const platformEarnings = finalPrice - mentorEarnings

    return {
      basePrice,
      levelMultiplier,
      levelBonus,
      durationMultiplier,
      locationMultiplier,
      locationBonus,
      subtotal: Math.round(subtotal),
      finalPrice,
      mentorShare,
      mentorEarnings,
      platformFee,
      platformEarnings,
      maxLevel,
      category
    }
  }

  static getSettings(): { mentorFeePercentage: number; platformFeePercentage: number } {
    // Return default settings
    // In a real implementation, this would fetch from adminSettings table
    return {
      mentorFeePercentage: 70, // Mentor gets 70% of student price
      platformFeePercentage: 30 // Platform gets 30%
    }
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  static async getAllEventTemplates(): Promise<EventTemplate[]> {
    try {
      return await this.query("eventTemplates:getAll") || []
    } catch (error) {
      console.error('Error fetching event templates:', error)
      return []
    }
  }
  // Pricing Rules - Static methods for hook usage
  static usePricingRules() {
    return this.useQuery<AdminPricingRule[]>('adminPricingRules.getAll', {});
  }

  static useActivePricingRules() {
    return this.useQuery<AdminPricingRule[]>('adminPricingRules.getActiveRules', {});
  }

  static usePricingRulesByCategory(category: AdminPricingRule['category']) {
    return this.useQuery<AdminPricingRule[]>('adminPricingRules.getByCategory', { category });
  }

  static useCurrentPricing() {
    return this.useQuery<Record<string, AdminPricingRule>>('adminPricingRules.getCurrentPricing', {});
  }

  static useCreatePricingRule() {
    return this.useMutation<Id<"adminPricingRules">>('adminPricingRules.create');
  }

  static useUpdatePricingRule() {
    return this.useMutation<Id<"adminPricingRules">>('adminPricingRules.update');
  }

  static useDeletePricingRule() {
    return this.useMutation<void>('adminPricingRules.remove');
  }

  static useTogglePricingRuleActive() {
    return this.useMutation<Id<"adminPricingRules">>('adminPricingRules.toggleActive');
  }

  static useCalculateSessionPrice(sessionCount: number, isNewStudent?: boolean, isLoyalCustomer?: boolean, isReferral?: boolean) {
    return this.useQuery<any>('adminPricingRules.calculateSessionPrice', {
      sessionCount,
      isNewStudent,
      isLoyalCustomer,
      isReferral
    });
  }

  // Office Locations - Static methods
  static useOfficeLocations() {
    return this.useQuery<OfficeLocation[]>('adminOfficeLocations.getAll', {});
  }

  static useActiveOfficeLocations() {
    return this.useQuery<OfficeLocation[]>('adminOfficeLocations.getActiveLocations', {});
  }

  static useOfficeLocationsByCity(city: string) {
    return this.useQuery<OfficeLocation[]>('adminOfficeLocations.getByCity', { city });
  }

  static useNearbyOfficeLocations(latitude: number, longitude: number, radiusKm?: number) {
    return this.useQuery<OfficeLocation[]>('adminOfficeLocations.getNearbyLocations', {
      latitude,
      longitude,
      radiusKm
    });
  }

  static useCreateOfficeLocation() {
    return this.useMutation<Id<"adminOfficeLocations">>('adminOfficeLocations.create');
  }

  static useUpdateOfficeLocation() {
    return this.useMutation<Id<"adminOfficeLocations">>('adminOfficeLocations.update');
  }

  static useDeleteOfficeLocation() {
    return this.useMutation<void>('adminOfficeLocations.remove');
  }

  static useCheckLocationAvailability(
    locationId: Id<"adminOfficeLocations">,
    date: string,
    startTime: string,
    endTime: string,
    requiredCapacity: number
  ) {
    return this.useQuery<any>('adminOfficeLocations.checkAvailability', {
      locationId,
      date,
      startTime,
      endTime,
      requiredCapacity
    });
  }

  // Discount Rules - Static methods
  static useDiscountRules() {
    return this.useQuery<DiscountRule[]>('discountRules.getAll', {});
  }

  static useActiveDiscountRules() {
    return this.useQuery<DiscountRule[]>('discountRules.getActiveRules', {});
  }

  static useDiscountRulesByType(type: DiscountRule['type']) {
    return this.useQuery<DiscountRule[]>('discountRules.getByType', { type });
  }

  static useApplicableDiscountRules(sessionCount: number, amount?: number, userRole?: string) {
    return this.useQuery<DiscountRule[]>('discountRules.getApplicableRules', {
      sessionCount,
      amount,
      userRole
    });
  }

  static useCreateDiscountRule() {
    return this.useMutation<Id<"discountRules">>('discountRules.create');
  }

  static useUpdateDiscountRule() {
    return this.useMutation<Id<"discountRules">>('discountRules.update');
  }

  static useDeleteDiscountRule() {
    return this.useMutation<void>('discountRules.remove');
  }

  static useToggleDiscountRuleActive() {
    return this.useMutation<Id<"discountRules">>('discountRules.toggleActive');
  }

  static useCalculateDiscount(ruleId: Id<"discountRules">, originalAmount: number, sessionCount: number) {
    return this.useQuery<any>('discountRules.calculateDiscount', {
      ruleId,
      originalAmount,
      sessionCount
    });
  }

  // Admin Analytics - Static methods
  static useSystemStats() {
    const users = this.useQuery<any[]>('users.getAll', {});
    const courses = this.useQuery<any[]>('courses.getAll', {});
    const bundles = this.useQuery<any[]>('bundlePackages.getAll', {});
    const transactions = this.useQuery<any[]>('paymentTransactions.getAll', {});

    if (!users || !courses || !bundles || !transactions) {
      return null;
    }

    const totalUsers = users?.length || 0;
    const totalMentors = users?.filter(u => u.role === 'mentor').length || 0;
    const totalStudents = users?.filter(u => u.role === 'siswa').length || 0;
    const totalCourses = courses?.length || 0;
    const activeCourses = courses?.filter(c => c.isActive).length || 0;
    const totalBundles = bundles?.length || 0;
    const activeBundles = bundles?.filter(b => b.isActive).length || 0;

    return {
      users: {
        total: totalUsers,
        mentors: totalMentors,
        students: totalStudents,
        growth: "+12% this month" // This would be calculated from real data
      },
      courses: {
        total: totalCourses,
        active: activeCourses,
        inactive: totalCourses - activeCourses
      },
      bundles: {
        total: totalBundles,
        active: activeBundles,
        inactive: totalBundles - activeBundles
      },
      revenue: {
        total: 0, // Would calculate from transactions
        monthly: 0,
        growth: "+8% this month"
      }
    };
  }

  // Analytics Methods
  static async getPaymentAnalytics(): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    monthlyGrowth: number;
  }> {
    try {
      // Get all payment transactions
      const transactions = await this.query("paymentTransactions:getAll") || []

      if (transactions.length === 0) {
        return {
          totalRevenue: 0,
          totalTransactions: 0,
          averageTransactionValue: 0,
          monthlyGrowth: 0
        }
      }

      // Use 'paid' status as per schema (not 'completed')
      const totalRevenue = transactions
        .filter((t: any) => t.status === 'paid')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0)

      const totalTransactions = transactions.filter((t: any) => t.status === 'paid').length
      const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

      // Calculate monthly growth (comparing this month to last month)
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

      const thisMonthTransactions = transactions.filter((t: any) =>
        t.status === 'paid' && new Date(t.createdAt) >= thisMonth
      )
      const lastMonthTransactions = transactions.filter((t: any) =>
        t.status === 'paid' &&
        new Date(t.createdAt) >= lastMonth &&
        new Date(t.createdAt) < thisMonth
      )

      const thisMonthRevenue = thisMonthTransactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
      const lastMonthRevenue = lastMonthTransactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0)

      const monthlyGrowth = lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0

      return {
        totalRevenue,
        totalTransactions,
        averageTransactionValue,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
      }
    } catch (error) {
      console.error('Error fetching payment analytics:', error)
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransactionValue: 0,
        monthlyGrowth: 0
      }
    }
  }

  static async getMentorPerformanceAnalytics(): Promise<Array<{
    _id: string;
    name: string;
    totalSessions: number;
    totalEarnings: number;
    averageRating: number;
    completionRate: number;
    studentSatisfaction: number;
    responseTime: number;
  }>> {
    try {
      // Get all users with mentor role
      const users = await this.query("users:getAll") || []
      const mentors = users.filter((u: any) => u.role === 'mentor')

      if (mentors.length === 0) {
        return []
      }

      // Get payment transactions to calculate mentor performance
      const transactions = await this.query("paymentTransactions:getAll") || []

      const mentorPerformance = mentors.map((mentor: any) => {
        // Get mentor's transactions
        const mentorTransactions = transactions.filter((t: any) => t.mentorId === mentor._id)

        // Calculate metrics
        const completedTransactions = mentorTransactions.filter((t: any) => t.status === 'paid')
        const totalSessions = completedTransactions.length
        const totalEarnings = completedTransactions.reduce((sum: number, t: any) => sum + (t.mentorFee || 0), 0)

        // Use mentor's rating from user profile or calculate from comments
        const averageRating = mentor.rating || 0

        // Calculate completion rate (paid vs all transactions)
        const allTransactions = mentorTransactions.length
        const completionRate = allTransactions > 0
          ? (totalSessions / allTransactions) * 100
          : 0

        // Student satisfaction (simplified calculation based on completion rate)
        const studentSatisfaction = completionRate > 80 ? 95 : completionRate > 60 ? 85 : 75

        // Response time (using mock data for now)
        const responseTime = Math.random() * 4 + 1 // 1-5 hours

        return {
          _id: mentor._id,
          name: mentor.name || mentor.email,
          totalSessions,
          totalEarnings,
          averageRating: Math.round(averageRating * 10) / 10,
          completionRate: Math.round(completionRate),
          studentSatisfaction: Math.round(studentSatisfaction),
          responseTime: Math.round(responseTime * 10) / 10
        }
      })

      // Sort by total earnings and return top performers
      return mentorPerformance
        .sort((a, b) => b.totalEarnings - a.totalEarnings)
        .slice(0, 10) // Top 10 mentors

    } catch (error) {
      console.error('Error fetching mentor performance analytics:', error)
      return []
    }
  }

  static async getStudentAnalytics(): Promise<{
    totalStudents: number;
    activeStudents: number;
    averageSatisfaction: number;
    repeatBookingRate: number;
  }> {
    try {
      // Get all users and transactions
      const users = await this.query("users:getAll") || []
      const transactions = await this.query("paymentTransactions:getAll") || []

      // Total students (users with 'siswa' role)
      const students = users.filter((u: any) => u.role === 'siswa')
      const totalStudents = students.length

      // Active students (students with transactions in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentTransactions = transactions.filter((t: any) =>
        new Date(t.createdAt) >= thirtyDaysAgo && t.status === 'paid'
      )
      const activeStudentIds = new Set(recentTransactions.map((t: any) => t.studentId))
      const activeStudents = activeStudentIds.size

      // Average satisfaction (using a simplified calculation for now)
      // In a real system, this would come from ratings/reviews
      const averageSatisfaction = totalStudents > 0 ? 4.2 : 0

      // Repeat booking rate (students with more than 1 transaction)
      const studentTransactionCounts = students.map((student: any) => {
        const studentTransactions = transactions.filter((t: any) =>
          t.studentId === student._id && t.status === 'paid'
        )
        return studentTransactions.length
      })

      const studentsWithMultipleTransactions = studentTransactionCounts.filter(count => count > 1).length
      const repeatBookingRate = totalStudents > 0
        ? (studentsWithMultipleTransactions / totalStudents) * 100
        : 0

      return {
        totalStudents,
        activeStudents,
        averageSatisfaction: Math.round(averageSatisfaction * 10) / 10,
        repeatBookingRate: Math.round(repeatBookingRate)
      }

    } catch (error) {
      console.error('Error fetching student analytics:', error)
      return {
        totalStudents: 0,
        activeStudents: 0,
        averageSatisfaction: 0,
        repeatBookingRate: 0
      }
    }
  }

  // Event Templates - Static methods
  static useEventTemplates() {
    return this.useQuery<EventTemplate[]>('eventTemplates.getAll', {});
  }

  static useActiveEventTemplates() {
    return this.useQuery<EventTemplate[]>('eventTemplates.getActive', {});
  }

  static useEventTemplatesByCategory(category: string) {
    return this.useQuery<EventTemplate[]>('eventTemplates.getByCategory', { category });
  }

  static useCreateEventTemplate() {
    return this.useMutation<Id<"eventTemplates">>('eventTemplates.create');
  }

  static useUpdateEventTemplate() {
    return this.useMutation<Id<"eventTemplates">>('eventTemplates.update');
  }

  static useDeleteEventTemplate() {
    return this.useMutation<void>('eventTemplates.remove');
  }

  static useToggleEventTemplateActive() {
    return this.useMutation<Id<"eventTemplates">>('eventTemplates.toggleActive');
  }

  // System Settings Management - Static methods
  static useSettings(group?: string) {
    if (group) {
      return this.useQuery<AdminSettings[]>('adminSettings.getByGroup', { settingGroup: group });
    }
    return this.useQuery<AdminSettings[]>('adminSettings.getAll', {});
  }

  static useUpdateSetting() {
    return this.useMutation<Id<"adminSettings">>('adminSettings.update');
  }
}

export const adminService = new AdminService();
export { AdminService };
