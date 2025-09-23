// Updated Bundle Service - Now uses Convex DB via Service Layer Pattern
// All functionality migrated from JSON Server to Convex for 100% coverage

import { BundleService } from '../services/bundle-service';

// Create instance for easier use
const bundleService = new BundleService();
export { bundleService, BundleService };

// Re-export types for backward compatibility
export type {
  BundlePackage,
  StudentSubscription
} from '../services/bundle-service';

// Legacy interface mapping
export interface DiscountRule {
  id: string
  name: string
  type: 'percentage' | 'fixed_amount'
  value: number
  minSessions: number
  maxSessions?: number
  isActive: boolean
  description: string
  createdAt: string
  updatedAt: string
}

export interface BundlePaymentRequest {
  studentId: number
  bundleId: string
  studentDetails: {
    name: string
    email: string
    phone: string
  }
}

// Legacy wrapper for backward compatibility
class LegacyBundleService {
  // Bundle Package Management
  async createBundlePackage(bundle: any) {
    return bundleService.createBundle(bundle);
  }

  async getAllBundlePackages() {
    return bundleService.useBundles();
  }

  async getBundlePackage(bundleId: string) {
    return bundleService.useBundleById(bundleId as any);
  }

  async updateBundlePackage(bundleId: string, updates: any) {
    return bundleService.updateBundle(bundleId as any, updates);
  }

  async deleteBundlePackage(bundleId: string) {
    return bundleService.deleteBundle(bundleId as any);
  }

  // Discount Rules Management (now uses adminService)
  async createDiscountRule(rule: any) {
    const { adminService } = await import('../services/admin-service');
    return adminService.createDiscountRule(rule);
  }

  async getAllDiscountRules() {
    const { adminService } = await import('../services/admin-service');
    return adminService.useActiveDiscountRules();
  }

  // Calculate best discount for session count
  async calculateBestDiscount(sessionCount: number, originalPrice: number) {
    const { adminService } = await import('../services/admin-service');
    const rules = await adminService.useApplicableDiscountRules(sessionCount, originalPrice);

    if (!rules || rules.length === 0) {
      return {
        discountRule: undefined,
        discountAmount: 0,
        finalPrice: originalPrice
      };
    }

    // Find the best rule (highest discount)
    let bestRule = rules[0];
    let maxDiscountAmount = 0;

    for (const rule of rules) {
      let discountAmount = 0;
      if (rule.type === 'percentage') {
        discountAmount = originalPrice * rule.value / 100;
      } else {
        discountAmount = rule.value;
      }

      if (rule.maxDiscount && discountAmount > rule.maxDiscount) {
        discountAmount = rule.maxDiscount;
      }

      if (discountAmount > maxDiscountAmount) {
        maxDiscountAmount = discountAmount;
        bestRule = rule;
      }
    }

    return {
      discountRule: bestRule,
      discountAmount: maxDiscountAmount,
      finalPrice: originalPrice - maxDiscountAmount
    };
  }

  // Student Subscription Management
  async createSubscription(subscriptionData: {
    studentId: number
    bundlePackage: any
    transactionId: string
  }) {
    return bundleService.createSubscription({
      studentId: subscriptionData.studentId as any,
      bundleId: subscriptionData.bundlePackage.id,
      transactionId: subscriptionData.transactionId
    });
  }

  async getStudentSubscriptions(studentId: number) {
    return bundleService.useStudentSubscriptions(studentId as any);
  }

  async getActiveSubscription(studentId: number) {
    return bundleService.useActiveSubscription(studentId as any);
  }

  async useSubscriptionSession(subscriptionId: string, transactionId: string) {
    return bundleService.useSessionFromSubscription(subscriptionId as any, transactionId);
  }

  // Bundle Payment Processing
  async createBundlePayment(paymentRequest: BundlePaymentRequest) {
    const bundle = await bundleService.useBundleById(paymentRequest.bundleId as any);

    if (!bundle?.isActive) {
      throw new Error('Bundle package is no longer available');
    }

    // Create payment transaction for bundle using paymentService
    const { paymentService } = await import('./payment-service');

    return paymentService.createBundlePayment({
      studentId: paymentRequest.studentId as any,
      bundleId: paymentRequest.bundleId as any,
      studentDetails: paymentRequest.studentDetails
    });
  }

  // Analytics for Admin
  async getBundleAnalytics() {
    return bundleService.getBundleAnalytics();
  }

  // Utility methods
  calculateFinalPrice(originalPrice: number, discountPercentage: number): number {
    return originalPrice - (originalPrice * discountPercentage / 100);
  }

  isSubscriptionValid(subscription: any): boolean {
    return subscription.status === 'active' &&
           subscription.remainingSessions > 0 &&
           new Date(subscription.expiryDate) > new Date();
  }

  calculateSavings(originalPrice: number, finalPrice: number): number {
    return originalPrice - finalPrice;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  }
}

// Export legacy service for backward compatibility
export const legacyBundleService = new LegacyBundleService();

// Default export for existing imports
export default legacyBundleService;