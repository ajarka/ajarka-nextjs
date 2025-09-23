'use client'

import { BaseService } from './base/base-service'
import type { Id } from '../../convex/_generated/dataModel'

/**
 * Bundle Service - Real Implementation using Convex
 * Handles subscription packages and bundle management
 */

export interface BundlePackage {
  _id: Id<"bundlePackages">
  name: string
  description: string
  type: 'monthly' | 'quarterly' | 'custom' | 'session_pack'
  sessionCount: number
  originalPrice: number
  discountPercentage: number
  finalPrice: number
  validityDays: number
  isActive: boolean
  features: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateBundleRequest {
  name: string
  description: string
  type: 'monthly' | 'quarterly' | 'custom' | 'session_pack'
  sessionCount: number
  originalPrice: number
  discountPercentage: number
  validityDays: number
  features: string[]
  isActive?: boolean
}

export interface UpdateBundleRequest {
  name?: string
  description?: string
  sessionCount?: number
  originalPrice?: number
  discountPercentage?: number
  validityDays?: number
  features?: string[]
  isActive?: boolean
}

export class BundleService extends BaseService {
  // ==================== QUERY METHODS ====================

  /**
   * Get all bundle packages
   */
  static useAllBundles() {
    return this.useQuery<BundlePackage[]>('bundlePackages.getAll')
  }

  /**
   * Get bundle by ID
   */
  static useBundleById(id: Id<"bundlePackages">) {
    return this.useQuery<BundlePackage | null>('bundlePackages.getById', { id })
  }

  /**
   * Get bundles by type
   */
  static useBundlesByType(type: BundlePackage['type']) {
    return this.useQuery<BundlePackage[]>('bundlePackages.getByType', { type })
  }

  /**
   * Get active bundles only
   */
  static useActiveBundles() {
    return this.useQuery<BundlePackage[]>('bundlePackages.getActive')
  }

  // ==================== MUTATION METHODS ====================

  /**
   * Create new bundle package
   */
  static useCreateBundle() {
    return this.useMutation<Id<"bundlePackages">>('bundlePackages.create', {
      onSuccess: (bundleId) => {
        console.log('Bundle created successfully:', bundleId)
      },
      onError: (error) => {
        console.error('Failed to create bundle:', error)
      }
    })
  }

  /**
   * Update bundle package
   */
  static useUpdateBundle() {
    return this.useMutation<Id<"bundlePackages">>('bundlePackages.update', {
      onSuccess: (bundleId) => {
        console.log('Bundle updated successfully:', bundleId)
      },
      onError: (error) => {
        console.error('Failed to update bundle:', error)
      }
    })
  }

  /**
   * Delete bundle package
   */
  static useDeleteBundle() {
    return this.useMutation<{ success: boolean }>('bundlePackages.remove', {
      onSuccess: () => {
        console.log('Bundle deleted successfully')
      },
      onError: (error) => {
        console.error('Failed to delete bundle:', error)
      }
    })
  }

  /**
   * Toggle bundle active status
   */
  static useToggleBundleActive() {
    return this.useMutation<Id<"bundlePackages">>('bundlePackages.toggleActive', {
      onSuccess: (bundleId) => {
        console.log('Bundle status toggled:', bundleId)
      },
      onError: (error) => {
        console.error('Failed to toggle bundle status:', error)
      }
    })
  }

  // ==================== BUSINESS LOGIC METHODS ====================

  /**
   * Create bundle with validation
   */
  static async createBundleWithValidation(bundleData: CreateBundleRequest): Promise<Id<"bundlePackages">> {
    // Client-side validation
    if (!bundleData.name || bundleData.name.trim().length < 3) {
      throw new Error('Bundle name must be at least 3 characters long')
    }

    if (!bundleData.description || bundleData.description.trim().length < 10) {
      throw new Error('Bundle description must be at least 10 characters long')
    }

    if (!bundleData.originalPrice || bundleData.originalPrice <= 0) {
      throw new Error('Original price must be greater than 0')
    }

    if (!bundleData.sessionCount || bundleData.sessionCount <= 0) {
      throw new Error('Session count must be greater than 0')
    }

    if (bundleData.discountPercentage < 0 || bundleData.discountPercentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100')
    }

    if (!bundleData.validityDays || bundleData.validityDays <= 0) {
      throw new Error('Validity days must be greater than 0')
    }

    if (!bundleData.features || bundleData.features.length === 0) {
      throw new Error('Bundle must have at least one feature')
    }

    // Create bundle via mutation
    const createBundleMutation = this.useCreateBundle()
    return await createBundleMutation(bundleData)
  }

  /**
   * Get bundles by price range
   */
  static useBundlesByPriceRange(minPrice: number, maxPrice: number) {
    const bundles = this.useActiveBundles()
    return bundles?.filter(bundle =>
      bundle.finalPrice >= minPrice && bundle.finalPrice <= maxPrice
    ) ?? []
  }

  /**
   * Get popular bundles (highest session count)
   */
  static usePopularBundles() {
    const bundles = this.useActiveBundles()
    return bundles?.sort((a, b) => b.sessionCount - a.sessionCount).slice(0, 3) ?? []
  }

  /**
   * Get bundle recommendations based on user needs
   */
  static useRecommendedBundles(targetSessions?: number, budget?: number) {
    const bundles = this.useActiveBundles()

    if (!bundles) return []

    let recommended = bundles

    // Filter by target sessions if provided
    if (targetSessions) {
      recommended = recommended.filter(bundle =>
        bundle.sessionCount >= targetSessions * 0.8 &&
        bundle.sessionCount <= targetSessions * 1.5
      )
    }

    // Filter by budget if provided
    if (budget) {
      recommended = recommended.filter(bundle => bundle.finalPrice <= budget)
    }

    // Sort by best value (sessions per price)
    return recommended.sort((a, b) => {
      const valueA = a.sessionCount / a.finalPrice
      const valueB = b.sessionCount / b.finalPrice
      return valueB - valueA
    }).slice(0, 3)
  }

  /**
   * Calculate bundle savings
   */
  static calculateSavings(bundle: BundlePackage): {
    absoluteSavings: number
    percentageSavings: number
  } {
    const absoluteSavings = bundle.originalPrice - bundle.finalPrice
    const percentageSavings = (absoluteSavings / bundle.originalPrice) * 100

    return {
      absoluteSavings,
      percentageSavings: Math.round(percentageSavings * 100) / 100
    }
  }

  /**
   * Get bundle statistics
   */
  static useBundleStats() {
    const bundles = this.useAllBundles()

    if (!bundles) return null

    const activeBundles = bundles.filter(b => b.isActive)

    const stats = {
      totalBundles: bundles.length,
      activeBundles: activeBundles.length,
      averagePrice: 0,
      averageDiscount: 0,
      totalSessionsOffered: 0,
      priceRange: { min: 0, max: 0 },
      typeDistribution: {
        monthly: 0,
        quarterly: 0,
        session_pack: 0,
        custom: 0
      }
    }

    if (activeBundles.length > 0) {
      stats.averagePrice = activeBundles.reduce((sum, bundle) => sum + bundle.finalPrice, 0) / activeBundles.length
      stats.averageDiscount = activeBundles.reduce((sum, bundle) => sum + bundle.discountPercentage, 0) / activeBundles.length
      stats.totalSessionsOffered = activeBundles.reduce((sum, bundle) => sum + bundle.sessionCount, 0)

      const prices = activeBundles.map(b => b.finalPrice)
      stats.priceRange.min = Math.min(...prices)
      stats.priceRange.max = Math.max(...prices)

      // Count type distribution
      activeBundles.forEach(bundle => {
        stats.typeDistribution[bundle.type]++
      })
    }

    return stats
  }

  /**
   * Compare bundles value
   */
  static compareBundles(bundleA: BundlePackage, bundleB: BundlePackage) {
    const pricePerSessionA = bundleA.finalPrice / bundleA.sessionCount
    const pricePerSessionB = bundleB.finalPrice / bundleB.sessionCount

    return {
      cheaperBundle: pricePerSessionA < pricePerSessionB ? bundleA : bundleB,
      priceDifference: Math.abs(pricePerSessionA - pricePerSessionB),
      betterValue: pricePerSessionA < pricePerSessionB ? 'A' : 'B'
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Format bundle price in IDR
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  /**
   * Get bundle type display name
   */
  static getBundleTypeDisplayName(type: BundlePackage['type']): string {
    const typeNames = {
      'monthly': 'Paket Bulanan',
      'quarterly': 'Paket Triwulan',
      'session_pack': 'Paket Sesi',
      'custom': 'Paket Kustom'
    }
    return typeNames[type] || type
  }

  /**
   * Get bundle type color
   */
  static getBundleTypeColor(type: BundlePackage['type']): string {
    const colors = {
      'monthly': 'text-blue-600 bg-blue-100',
      'quarterly': 'text-purple-600 bg-purple-100',
      'session_pack': 'text-green-600 bg-green-100',
      'custom': 'text-orange-600 bg-orange-100'
    }
    return colors[type] || 'text-gray-600 bg-gray-100'
  }

  /**
   * Calculate expiry date from purchase
   */
  static calculateExpiryDate(purchaseDate: Date, validityDays: number): Date {
    const expiryDate = new Date(purchaseDate)
    expiryDate.setDate(expiryDate.getDate() + validityDays)
    return expiryDate
  }

  /**
   * Check if bundle is good value (high sessions, good discount)
   */
  static isGoodValue(bundle: BundlePackage): boolean {
    const pricePerSession = bundle.finalPrice / bundle.sessionCount
    const hasGoodDiscount = bundle.discountPercentage >= 15
    const hasReasonablePrice = pricePerSession <= 200000 // 200k per session

    return hasGoodDiscount && hasReasonablePrice
  }

  // ==================== STATIC METHODS FOR ADMIN DASHBOARD ====================

  /**
   * Get all bundle packages (static method for admin dashboard)
   */
  static async getAllBundlePackages(): Promise<BundlePackage[]> {
    try {
      return await this.query("bundlePackages:getAll") || []
    } catch (error) {
      console.error('Error fetching all bundle packages:', error)
      return []
    }
  }

  /**
   * Get all discount rules (static method for admin dashboard)
   */
  static async getAllDiscountRules(): Promise<any[]> {
    try {
      return await this.query("discountRules:getAll") || []
    } catch (error) {
      console.error('Error fetching all discount rules:', error)
      return []
    }
  }

  /**
   * Get bundle analytics (static method for admin dashboard)
   */
  static async getBundleAnalytics(): Promise<any> {
    try {
      // TODO: Implement analytics calculation when needed
      // For now, return mock analytics data
      const bundles = await this.getAllBundlePackages()
      const totalBundles = bundles.length
      const activeBundles = bundles.filter(b => b.isActive).length
      const totalRevenue = bundles.reduce((sum, b) => sum + b.finalPrice, 0)

      return {
        totalBundles,
        activeBundles,
        inactiveBundles: totalBundles - activeBundles,
        totalRevenue,
        averagePrice: totalBundles > 0 ? totalRevenue / totalBundles : 0,
        bundlesByType: bundles.reduce((acc, b) => {
          acc[b.type] = (acc[b.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    } catch (error) {
      console.error('Error fetching bundle analytics:', error)
      return {
        totalBundles: 0,
        activeBundles: 0,
        inactiveBundles: 0,
        totalRevenue: 0,
        averagePrice: 0,
        bundlesByType: {}
      }
    }
  }

  /**
   * Get all student subscriptions (static method for admin dashboard)
   */
  static async getAllStudentSubscriptions(): Promise<any[]> {
    try {
      // TODO: Implement studentSubscriptions Convex functions
      // For now, return empty array to prevent errors
      console.log('📝 getAllStudentSubscriptions - returning empty array (not implemented yet)')
      return []
    } catch (error) {
      console.error('Error fetching all student subscriptions:', error)
      return []
    }
  }

  /**
   * Get all users (static method for admin dashboard)
   */
  static async getAllUsers(): Promise<any[]> {
    try {
      return await this.query("users:getAll") || []
    } catch (error) {
      console.error('Error fetching all users:', error)
      return []
    }
  }
}

export const bundleService = new BundleService();