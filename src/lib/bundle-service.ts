'use client'

// Bundle and Subscription Service for Ajarka Payment System
export interface BundlePackage {
  id: string
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

export interface StudentSubscription {
  id: string
  studentId: number
  bundleId: string
  bundleName: string
  totalSessions: number
  usedSessions: number
  remainingSessions: number
  originalPrice: number
  paidPrice: number
  discountAmount: number
  purchaseDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'cancelled' | 'suspended'
  transactions: string[] // Array of transaction IDs using this subscription
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

class BundleServiceClass {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  // Bundle Package Management
  async createBundlePackage(bundle: Omit<BundlePackage, 'id' | 'createdAt' | 'updatedAt'>): Promise<BundlePackage> {
    const newBundle: BundlePackage = {
      id: `BUNDLE-${Date.now()}`,
      ...bundle,
      finalPrice: bundle.originalPrice - (bundle.originalPrice * bundle.discountPercentage / 100),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${this.apiUrl}/bundle_packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBundle)
    })

    if (!response.ok) {
      throw new Error('Failed to create bundle package')
    }

    return response.json()
  }

  async getAllBundlePackages(): Promise<BundlePackage[]> {
    const response = await fetch(`${this.apiUrl}/bundle_packages?isActive=true`)
    if (!response.ok) {
      throw new Error('Failed to fetch bundle packages')
    }
    return response.json()
  }

  async getBundlePackage(bundleId: string): Promise<BundlePackage> {
    const response = await fetch(`${this.apiUrl}/bundle_packages/${bundleId}`)
    if (!response.ok) {
      throw new Error('Bundle package not found')
    }
    return response.json()
  }

  async updateBundlePackage(bundleId: string, updates: Partial<BundlePackage>): Promise<BundlePackage> {
    const updatedBundle = {
      ...updates,
      updatedAt: new Date().toISOString()
    }

    // Recalculate final price if original price or discount changed
    if (updates.originalPrice || updates.discountPercentage) {
      const currentBundle = await this.getBundlePackage(bundleId)
      const originalPrice = updates.originalPrice || currentBundle.originalPrice
      const discountPercentage = updates.discountPercentage || currentBundle.discountPercentage
      updatedBundle.finalPrice = originalPrice - (originalPrice * discountPercentage / 100)
    }

    const response = await fetch(`${this.apiUrl}/bundle_packages/${bundleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBundle)
    })

    if (!response.ok) {
      throw new Error('Failed to update bundle package')
    }

    return response.json()
  }

  async deleteBundlePackage(bundleId: string): Promise<void> {
    // Soft delete by setting isActive to false
    await this.updateBundlePackage(bundleId, { isActive: false })
  }

  // Discount Rules Management
  async createDiscountRule(rule: Omit<DiscountRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiscountRule> {
    const newRule: DiscountRule = {
      id: `DISCOUNT-${Date.now()}`,
      ...rule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${this.apiUrl}/discount_rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRule)
    })

    if (!response.ok) {
      throw new Error('Failed to create discount rule')
    }

    return response.json()
  }

  async getAllDiscountRules(): Promise<DiscountRule[]> {
    const response = await fetch(`${this.apiUrl}/discount_rules?isActive=true`)
    if (!response.ok) {
      throw new Error('Failed to fetch discount rules')
    }
    return response.json()
  }

  // Calculate best discount for session count
  async calculateBestDiscount(sessionCount: number, originalPrice: number): Promise<{
    discountRule?: DiscountRule
    discountAmount: number
    finalPrice: number
  }> {
    const discountRules = await this.getAllDiscountRules()
    
    let bestDiscount: DiscountRule | undefined
    let maxDiscountAmount = 0

    for (const rule of discountRules) {
      if (sessionCount >= rule.minSessions && 
          (!rule.maxSessions || sessionCount <= rule.maxSessions)) {
        
        let discountAmount = 0
        if (rule.type === 'percentage') {
          discountAmount = originalPrice * rule.value / 100
        } else {
          discountAmount = rule.value
        }

        if (discountAmount > maxDiscountAmount) {
          maxDiscountAmount = discountAmount
          bestDiscount = rule
        }
      }
    }

    return {
      discountRule: bestDiscount,
      discountAmount: maxDiscountAmount,
      finalPrice: originalPrice - maxDiscountAmount
    }
  }

  // Student Subscription Management
  async createSubscription(subscriptionData: {
    studentId: number
    bundlePackage: BundlePackage
    transactionId: string
  }): Promise<StudentSubscription> {
    const validityDate = new Date()
    validityDate.setDate(validityDate.getDate() + subscriptionData.bundlePackage.validityDays)

    const newSubscription: StudentSubscription = {
      id: `SUB-${subscriptionData.studentId}-${Date.now()}`,
      studentId: subscriptionData.studentId,
      bundleId: subscriptionData.bundlePackage.id,
      bundleName: subscriptionData.bundlePackage.name,
      totalSessions: subscriptionData.bundlePackage.sessionCount,
      usedSessions: 0,
      remainingSessions: subscriptionData.bundlePackage.sessionCount,
      originalPrice: subscriptionData.bundlePackage.originalPrice,
      paidPrice: subscriptionData.bundlePackage.finalPrice,
      discountAmount: subscriptionData.bundlePackage.originalPrice - subscriptionData.bundlePackage.finalPrice,
      purchaseDate: new Date().toISOString(),
      expiryDate: validityDate.toISOString(),
      status: 'active',
      transactions: [subscriptionData.transactionId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(`${this.apiUrl}/student_subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubscription)
    })

    if (!response.ok) {
      throw new Error('Failed to create subscription')
    }

    return response.json()
  }

  async getStudentSubscriptions(studentId: number): Promise<StudentSubscription[]> {
    const response = await fetch(`${this.apiUrl}/student_subscriptions?studentId=${studentId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch student subscriptions')
    }
    return response.json()
  }

  async getActiveSubscription(studentId: number): Promise<StudentSubscription | null> {
    const subscriptions = await this.getStudentSubscriptions(studentId)
    const activeSubscription = subscriptions.find(sub => 
      sub.status === 'active' && 
      sub.remainingSessions > 0 && 
      new Date(sub.expiryDate) > new Date()
    )
    return activeSubscription || null
  }

  async useSubscriptionSession(subscriptionId: string, transactionId: string): Promise<StudentSubscription> {
    const response = await fetch(`${this.apiUrl}/student_subscriptions/${subscriptionId}`)
    if (!response.ok) {
      throw new Error('Subscription not found')
    }

    const subscription: StudentSubscription = await response.json()
    
    if (subscription.remainingSessions <= 0) {
      throw new Error('No remaining sessions in subscription')
    }

    if (new Date(subscription.expiryDate) <= new Date()) {
      throw new Error('Subscription has expired')
    }

    const updatedSubscription = {
      ...subscription,
      usedSessions: subscription.usedSessions + 1,
      remainingSessions: subscription.remainingSessions - 1,
      transactions: [...subscription.transactions, transactionId],
      updatedAt: new Date().toISOString()
    }

    // Auto-expire if no sessions left
    if (updatedSubscription.remainingSessions === 0) {
      updatedSubscription.status = 'expired'
    }

    const updateResponse = await fetch(`${this.apiUrl}/student_subscriptions/${subscriptionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSubscription)
    })

    if (!updateResponse.ok) {
      throw new Error('Failed to update subscription')
    }

    return updateResponse.json()
  }

  // Bundle Payment Processing
  async createBundlePayment(paymentRequest: BundlePaymentRequest): Promise<any> {
    const bundlePackage = await this.getBundlePackage(paymentRequest.bundleId)
    
    if (!bundlePackage.isActive) {
      throw new Error('Bundle package is no longer available')
    }

    // Create payment transaction for bundle
    const PaymentService = (await import('./payment-service')).PaymentService
    
    const bundlePaymentTransaction = await PaymentService.createPayment({
      studentId: paymentRequest.studentId,
      mentorId: 0, // Bundle payments are not mentor-specific
      scheduleId: 0, // Bundle payments are not schedule-specific
      sessionTitle: `Bundle: ${bundlePackage.name}`,
      amount: bundlePackage.finalPrice,
      mentorFee: 0, // Bundle payments go fully to admin initially
      adminFee: bundlePackage.finalPrice,
      bookingDetails: {
        date: new Date().toISOString().split('T')[0],
        time: '00:00',
        duration: 0,
        meetingType: 'bundle',
        materials: bundlePackage.features,
        notes: `Bundle subscription: ${bundlePackage.description}`
      },
      studentDetails: paymentRequest.studentDetails
    })

    return bundlePaymentTransaction
  }

  // Analytics for Admin
  async getBundleAnalytics(): Promise<{
    totalBundleRevenue: number
    activeBundles: number
    totalSubscriptions: number
    activeSubscriptions: number
    averageDiscount: number
    popularBundles: { bundle: BundlePackage; subscriptionCount: number }[]
  }> {
    const [subscriptions, bundles] = await Promise.all([
      fetch(`${this.apiUrl}/student_subscriptions`).then(r => r.json()) as Promise<StudentSubscription[]>,
      this.getAllBundlePackages()
    ])

    const totalBundleRevenue = subscriptions.reduce((sum, sub) => sum + sub.paidPrice, 0)
    const activeBundles = bundles.filter(b => b.isActive).length
    const totalSubscriptions = subscriptions.length
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length
    
    const totalDiscount = subscriptions.reduce((sum, sub) => sum + sub.discountAmount, 0)
    const averageDiscount = totalSubscriptions > 0 ? totalDiscount / totalSubscriptions : 0

    const bundlePopularity = bundles.map(bundle => ({
      bundle,
      subscriptionCount: subscriptions.filter(sub => sub.bundleId === bundle.id).length
    })).sort((a, b) => b.subscriptionCount - a.subscriptionCount).slice(0, 5)

    return {
      totalBundleRevenue,
      activeBundles,
      totalSubscriptions,
      activeSubscriptions,
      averageDiscount,
      popularBundles: bundlePopularity
    }
  }
}

export const BundleService = new BundleServiceClass()