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

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  static async getAllEventTemplates(): Promise<any[]> {
    try {
      // TODO: Implement when event template Convex functions are created
      // For now, return empty array to prevent errors
      console.log('📝 getAllEventTemplates - returning empty array (not implemented yet)')
      return []
    } catch (error) {
      console.error('Error fetching event templates:', error)
      return []
    }
  }
  // Pricing Rules
  usePricingRules() {
    return this.provider.useQuery(api.adminPricingRules.getAll, {});
  }

  useActivePricingRules() {
    return this.provider.useQuery(api.adminPricingRules.getActiveRules, {});
  }

  usePricingRulesByCategory(category: AdminPricingRule['category']) {
    return this.provider.useQuery(api.adminPricingRules.getByCategory, { category });
  }

  useCurrentPricing() {
    return this.provider.useQuery(api.adminPricingRules.getCurrentPricing, {});
  }

  async createPricingRule(data: Omit<AdminPricingRule, '_id' | 'createdAt' | 'updatedAt'>) {
    return await this.provider.useMutation(api.adminPricingRules.create, data);
  }

  async updatePricingRule(id: Id<"adminPricingRules">, updates: Partial<AdminPricingRule>) {
    return await this.provider.useMutation(api.adminPricingRules.update, { id, ...updates });
  }

  async deletePricingRule(id: Id<"adminPricingRules">) {
    return await this.provider.useMutation(api.adminPricingRules.remove, { id });
  }

  async calculateSessionPrice(sessionCount: number, isNewStudent?: boolean, isLoyalCustomer?: boolean, isReferral?: boolean) {
    return await this.provider.useQuery(api.adminPricingRules.calculateSessionPrice, {
      sessionCount,
      isNewStudent,
      isLoyalCustomer,
      isReferral
    });
  }

  // Office Locations
  useOfficeLocations() {
    return this.provider.useQuery(api.adminOfficeLocations.getAll, {});
  }

  useActiveOfficeLocations() {
    return this.provider.useQuery(api.adminOfficeLocations.getActiveLocations, {});
  }

  useOfficeLocationsByCity(city: string) {
    return this.provider.useQuery(api.adminOfficeLocations.getByCity, { city });
  }

  useNearbyOfficeLocations(latitude: number, longitude: number, radiusKm?: number) {
    return this.provider.useQuery(api.adminOfficeLocations.getNearbyLocations, {
      latitude,
      longitude,
      radiusKm
    });
  }

  async createOfficeLocation(data: Omit<OfficeLocation, '_id' | 'createdAt' | 'updatedAt'>) {
    return await this.provider.useMutation(api.adminOfficeLocations.create, data);
  }

  async updateOfficeLocation(id: Id<"adminOfficeLocations">, updates: Partial<OfficeLocation>) {
    return await this.provider.useMutation(api.adminOfficeLocations.update, { id, ...updates });
  }

  async deleteOfficeLocation(id: Id<"adminOfficeLocations">) {
    return await this.provider.useMutation(api.adminOfficeLocations.remove, { id });
  }

  async checkLocationAvailability(
    locationId: Id<"adminOfficeLocations">,
    date: string,
    startTime: string,
    endTime: string,
    requiredCapacity: number
  ) {
    return await this.provider.useQuery(api.adminOfficeLocations.checkAvailability, {
      locationId,
      date,
      startTime,
      endTime,
      requiredCapacity
    });
  }

  // Discount Rules
  useDiscountRules() {
    return this.provider.useQuery(api.discountRules.getAll, {});
  }

  useActiveDiscountRules() {
    return this.provider.useQuery(api.discountRules.getActiveRules, {});
  }

  useDiscountRulesByType(type: DiscountRule['type']) {
    return this.provider.useQuery(api.discountRules.getByType, { type });
  }

  useApplicableDiscountRules(sessionCount: number, amount?: number, userRole?: string) {
    return this.provider.useQuery(api.discountRules.getApplicableRules, {
      sessionCount,
      amount,
      userRole
    });
  }

  async createDiscountRule(data: Omit<DiscountRule, '_id' | 'createdAt' | 'updatedAt'>) {
    return await this.provider.useMutation(api.discountRules.create, data);
  }

  async updateDiscountRule(id: Id<"discountRules">, updates: Partial<DiscountRule>) {
    return await this.provider.useMutation(api.discountRules.update, { id, ...updates });
  }

  async deleteDiscountRule(id: Id<"discountRules">) {
    return await this.provider.useMutation(api.discountRules.remove, { id });
  }

  async calculateDiscount(ruleId: Id<"discountRules">, originalAmount: number, sessionCount: number) {
    return await this.provider.useQuery(api.discountRules.calculateDiscount, {
      ruleId,
      originalAmount,
      sessionCount
    });
  }

  // Admin Analytics
  async getSystemStats() {
    const [users, courses, bundles, transactions] = await Promise.all([
      this.provider.useQuery(api.users.getAll, {}),
      this.provider.useQuery(api.courses.getAll, {}),
      this.provider.useQuery(api.bundlePackages.getAll, {}),
      this.provider.useQuery(api.paymentTransactions.getAll, {})
    ]);

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
      const transactions = await this.query("payments:getAll") || []

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
      const transactions = await this.query("payments:getAll") || []

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
      const transactions = await this.query("payments:getAll") || []

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

  // System Settings Management
  async getSettings(group?: string) {
    if (group) {
      return await this.provider.useQuery(api.adminSettings.getByGroup, { settingGroup: group });
    }
    return await this.provider.useQuery(api.adminSettings.getAll, {});
  }

  async updateSetting(key: string, value: any, group: string = 'general') {
    return await this.provider.useMutation(api.adminSettings.update, {
      settingGroup: group,
      settingKey: key,
      settingValue: value
    });
  }

  // Bulk Operations
  async bulkUpdatePricingRules(rules: Array<{ id: Id<"adminPricingRules">; updates: Partial<AdminPricingRule> }>) {
    const results = [];
    for (const rule of rules) {
      const result = await this.updatePricingRule(rule.id, rule.updates);
      results.push(result);
    }
    return results;
  }

  async bulkToggleDiscountRules(ruleIds: Id<"discountRules">[]) {
    const results = [];
    for (const id of ruleIds) {
      const result = await this.provider.useMutation(api.discountRules.toggleActive, { id });
      results.push(result);
    }
    return results;
  }
}

export const adminService = new AdminService();
export { AdminService };