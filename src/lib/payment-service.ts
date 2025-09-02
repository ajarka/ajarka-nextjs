const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface PaymentTransaction {
  id: string
  orderId: string
  studentId: number
  mentorId: number
  scheduleId: number
  sessionTitle: string
  amount: number
  mentorFee: number
  adminFee: number
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired'
  paymentMethod?: string
  midtransTransactionId?: string
  midtransToken?: string
  paidAt?: string
  expiredAt: string
  createdAt: string
  updatedAt: string
  bookingDetails: {
    date: string
    time: string
    duration: number
    meetingType: 'online' | 'offline'
    materials: string[]
    notes?: string
  }
}

export interface MentorPayout {
  id: string
  mentorId: number
  mentorName: string
  month: string // YYYY-MM format
  totalSessions: number
  totalEarnings: number
  transactions: string[] // Array of transaction IDs
  status: 'pending' | 'processing' | 'paid' | 'failed'
  processedAt?: string
  transferDetails?: {
    bankName: string
    accountNumber: string
    accountName: string
    transferId?: string
  }
  createdAt: string
  updatedAt: string
}

export interface PaymentRequest {
  studentId: number
  mentorId: number
  scheduleId: number
  sessionTitle: string
  amount: number
  mentorFee: number
  adminFee: number
  bookingDetails: {
    date: string
    time: string
    duration: number
    meetingType: 'online' | 'offline'
    materials: string[]
    notes?: string
  }
  studentDetails: {
    name: string
    email: string
    phone: string
  }
}

export interface MidtransResponse {
  token: string
  redirect_url: string
}

export class PaymentService {
  // Create payment transaction with Midtrans
  static async createPayment(paymentRequest: PaymentRequest): Promise<PaymentTransaction | null> {
    try {
      const orderId = `AJARKA-${Date.now()}-${paymentRequest.studentId}`
      
      // Create transaction record first
      const transaction: Omit<PaymentTransaction, 'id'> = {
        orderId,
        studentId: paymentRequest.studentId,
        mentorId: paymentRequest.mentorId,
        scheduleId: paymentRequest.scheduleId,
        sessionTitle: paymentRequest.sessionTitle,
        amount: paymentRequest.amount,
        mentorFee: paymentRequest.mentorFee,
        adminFee: paymentRequest.adminFee,
        status: 'pending',
        bookingDetails: paymentRequest.bookingDetails,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save to database
      const response = await fetch(`${API_BASE_URL}/payment_transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transaction,
          id: orderId
        })
      })

      if (!response.ok) throw new Error('Failed to create transaction record')

      // Create Midtrans payment token (simulate for now)
      const midtransToken = await this.createMidtransPayment({
        orderId,
        amount: paymentRequest.amount,
        customerDetails: paymentRequest.studentDetails,
        itemDetails: {
          name: paymentRequest.sessionTitle,
          quantity: 1,
          price: paymentRequest.amount
        }
      })

      // Update transaction with Midtrans token
      const updateResponse = await fetch(`${API_BASE_URL}/payment_transactions/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          midtransToken: midtransToken.token,
          updatedAt: new Date().toISOString()
        })
      })

      if (!updateResponse.ok) throw new Error('Failed to update transaction with payment token')

      return {
        id: orderId,
        ...transaction,
        midtransToken: midtransToken.token
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      return null
    }
  }

  // Simulate Midtrans payment creation (in real implementation, this calls Midtrans API)
  private static async createMidtransPayment(params: {
    orderId: string
    amount: number
    customerDetails: { name: string; email: string; phone: string }
    itemDetails: { name: string; quantity: number; price: number }
  }): Promise<MidtransResponse> {
    // In production, this would call Midtrans API
    // For now, we simulate the response
    return {
      token: `midtrans_${params.orderId}_${Date.now()}`,
      redirect_url: `https://app.sandbox.midtrans.com/snap/v1/transactions/${params.orderId}`
    }
  }

  // Handle Midtrans webhook/notification
  static async handlePaymentNotification(notification: {
    transaction_status: string
    order_id: string
    transaction_id: string
    payment_type: string
    transaction_time: string
  }): Promise<boolean> {
    try {
      const { transaction_status, order_id, transaction_id, payment_type, transaction_time } = notification

      let status: PaymentTransaction['status']
      switch (transaction_status) {
        case 'capture':
        case 'settlement':
          status = 'paid'
          break
        case 'pending':
          status = 'pending'
          break
        case 'deny':
        case 'cancel':
        case 'failure':
          status = 'failed'
          break
        case 'expire':
          status = 'expired'
          break
        default:
          status = 'pending'
      }

      const updateData: any = {
        status,
        midtransTransactionId: transaction_id,
        paymentMethod: payment_type,
        updatedAt: new Date().toISOString()
      }

      if (status === 'paid') {
        updateData.paidAt = transaction_time
        // Create booking record when payment is successful
        await this.createBookingRecord(order_id)
      }

      const response = await fetch(`${API_BASE_URL}/payment_transactions/${order_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      return response.ok
    } catch (error) {
      console.error('Error handling payment notification:', error)
      return false
    }
  }

  // Create booking record when payment is successful
  private static async createBookingRecord(orderId: string): Promise<void> {
    try {
      // Get transaction details
      const transactionResponse = await fetch(`${API_BASE_URL}/payment_transactions/${orderId}`)
      const transaction: PaymentTransaction = await transactionResponse.json()

      if (!transaction) return

      // Create booking record
      const booking = {
        id: `BOOKING-${orderId}`,
        studentId: transaction.studentId,
        mentorId: transaction.mentorId,
        scheduleId: transaction.scheduleId,
        transactionId: orderId,
        sessionTitle: transaction.sessionTitle,
        date: transaction.bookingDetails.date,
        time: transaction.bookingDetails.time,
        duration: transaction.bookingDetails.duration,
        meetingType: transaction.bookingDetails.meetingType,
        materials: transaction.bookingDetails.materials,
        notes: transaction.bookingDetails.notes,
        status: 'confirmed',
        meetingLink: '', // Will be generated later
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      })

    } catch (error) {
      console.error('Error creating booking record:', error)
    }
  }

  // Get transaction by ID
  static async getTransaction(transactionId: string): Promise<PaymentTransaction | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/payment_transactions/${transactionId}`)
      return response.ok ? await response.json() : null
    } catch (error) {
      console.error('Error fetching transaction:', error)
      return null
    }
  }

  // Get all transactions with filters
  static async getTransactions(filters?: {
    studentId?: number
    mentorId?: number
    status?: string
    startDate?: string
    endDate?: string
  }): Promise<PaymentTransaction[]> {
    try {
      let url = `${API_BASE_URL}/payment_transactions`
      const params = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString())
        })
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      return response.ok ? await response.json() : []
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  }

  // Generate monthly mentor payouts
  static async generateMonthlyPayouts(month: string): Promise<MentorPayout[]> {
    try {
      // Get all paid transactions for the month
      const transactions = await this.getTransactions({
        status: 'paid'
      })

      const monthStart = new Date(`${month}-01`)
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

      const monthlyTransactions = transactions.filter(t => {
        const paidDate = new Date(t.paidAt || t.createdAt)
        return paidDate >= monthStart && paidDate <= monthEnd
      })

      // Group by mentor
      const mentorPayouts: { [mentorId: number]: MentorPayout } = {}

      for (const transaction of monthlyTransactions) {
        if (!mentorPayouts[transaction.mentorId]) {
          mentorPayouts[transaction.mentorId] = {
            id: `PAYOUT-${transaction.mentorId}-${month}`,
            mentorId: transaction.mentorId,
            mentorName: `Mentor ${transaction.mentorId}`, // Get from users table in real app
            month,
            totalSessions: 0,
            totalEarnings: 0,
            transactions: [],
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }

        mentorPayouts[transaction.mentorId].totalSessions++
        mentorPayouts[transaction.mentorId].totalEarnings += transaction.mentorFee
        mentorPayouts[transaction.mentorId].transactions.push(transaction.id)
      }

      // Save payouts to database
      const payouts = Object.values(mentorPayouts)
      for (const payout of payouts) {
        await fetch(`${API_BASE_URL}/mentor_payouts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payout)
        })
      }

      return payouts
    } catch (error) {
      console.error('Error generating monthly payouts:', error)
      return []
    }
  }

  // Get mentor payouts
  static async getMentorPayouts(mentorId?: number, month?: string): Promise<MentorPayout[]> {
    try {
      let url = `${API_BASE_URL}/mentor_payouts`
      const params = new URLSearchParams()

      if (mentorId) params.append('mentorId', mentorId.toString())
      if (month) params.append('month', month)

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      return response.ok ? await response.json() : []
    } catch (error) {
      console.error('Error fetching mentor payouts:', error)
      return []
    }
  }

  // Process mentor payout
  static async processMentorPayout(payoutId: string, transferDetails: {
    bankName: string
    accountNumber: string
    accountName: string
    transferId?: string
  }): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/mentor_payouts/${payoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          transferDetails,
          processedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      })

      return response.ok
    } catch (error) {
      console.error('Error processing mentor payout:', error)
      return false
    }
  }

  // Get payment analytics
  static async getPaymentAnalytics(period?: string): Promise<{
    totalRevenue: number
    totalTransactions: number
    successfulTransactions: number
    pendingTransactions: number
    failedTransactions: number
    totalMentorPayouts: number
    totalAdminRevenue: number
    averageTransactionValue: number
  }> {
    try {
      const transactions = await this.getTransactions()
      
      const analytics = {
        totalRevenue: 0,
        totalTransactions: transactions.length,
        successfulTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
        totalMentorPayouts: 0,
        totalAdminRevenue: 0,
        averageTransactionValue: 0
      }

      transactions.forEach(t => {
        switch (t.status) {
          case 'paid':
            analytics.successfulTransactions++
            analytics.totalRevenue += t.amount
            analytics.totalMentorPayouts += t.mentorFee
            analytics.totalAdminRevenue += t.adminFee
            break
          case 'pending':
            analytics.pendingTransactions++
            break
          case 'failed':
          case 'cancelled':
          case 'expired':
            analytics.failedTransactions++
            break
        }
      })

      analytics.averageTransactionValue = analytics.successfulTransactions > 0 
        ? analytics.totalRevenue / analytics.successfulTransactions 
        : 0

      return analytics
    } catch (error) {
      console.error('Error fetching payment analytics:', error)
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        successfulTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
        totalMentorPayouts: 0,
        totalAdminRevenue: 0,
        averageTransactionValue: 0
      }
    }
  }
}