'use client'

import { useState, useEffect } from 'react'
import { AdminService } from '@/services/admin-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Star,
  Award,
  CreditCard,
  Activity,
  BarChart3,
  PieChart,
  Target
} from "lucide-react"

interface PaymentStats {
  totalRevenue: number
  totalTransactions: number
  averageTransactionValue: number
  monthlyGrowth: number
}

interface MentorPerformance {
  _id: string
  name: string
  totalSessions: number
  totalEarnings: number
  averageRating: number
  completionRate: number
  studentSatisfaction: number
  responseTime: number
}

interface StudentFeedback {
  totalStudents: number
  activeStudents: number
  averageSatisfaction: number
  repeatBookingRate: number
}

export default function AdminAnalytics() {
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransactionValue: 0,
    monthlyGrowth: 0
  })

  const [mentorPerformance, setMentorPerformance] = useState<MentorPerformance[]>([])

  const [studentFeedback, setStudentFeedback] = useState<StudentFeedback>({
    totalStudents: 0,
    activeStudents: 0,
    averageSatisfaction: 0,
    repeatBookingRate: 0
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch all analytics data in parallel
        const [paymentData, mentorData, studentData] = await Promise.all([
          AdminService.getPaymentAnalytics(),
          AdminService.getMentorPerformanceAnalytics(),
          AdminService.getStudentAnalytics()
        ])

        setPaymentStats(paymentData)
        setMentorPerformance(mentorData)
        setStudentFeedback(studentData)

      } catch (error) {
        console.error('Error fetching analytics data:', error)
        setError('Failed to load analytics data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getPerformanceBadge = (rating: number) => {
    if (rating >= 4.8) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (rating >= 4.5) return <Badge className="bg-blue-100 text-blue-800">Very Good</Badge>
    if (rating >= 4.0) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    return <Badge className="bg-gray-100 text-gray-800">Needs Improvement</Badge>
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Statistics</h1>
          <p className="text-muted-foreground mt-2">
            Monitor student payments, mentor performance, and platform metrics
          </p>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Statistics</h1>
          <p className="text-muted-foreground mt-2">
            Monitor student payments, mentor performance, and platform metrics
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics & Statistics</h1>
        <p className="text-muted-foreground mt-2">
          Monitor student payments, mentor performance, and platform metrics
        </p>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paymentStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{paymentStats.monthlyGrowth}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Successful payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paymentStats.averageTransactionValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per session payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentFeedback.averageSatisfaction}/5</div>
            <p className="text-xs text-muted-foreground">
              Average rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Student Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Total Students</p>
                  <p className="text-sm text-muted-foreground">All time registrations</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">{studentFeedback.totalStudents}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Active Students</p>
                  <p className="text-sm text-muted-foreground">Currently taking sessions</p>
                </div>
                <span className="text-2xl font-bold text-green-600">{studentFeedback.activeStudents}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Repeat Booking Rate</p>
                  <p className="text-sm text-muted-foreground">Students who book again</p>
                </div>
                <span className="text-2xl font-bold text-purple-600">{studentFeedback.repeatBookingRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">Mentor Fees (70%)</p>
                  <p className="text-sm text-green-600">Paid to mentors</p>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(paymentStats.totalRevenue * 0.7)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">Platform Revenue (30%)</p>
                  <p className="text-sm text-blue-600">Admin earnings</p>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(paymentStats.totalRevenue * 0.3)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mentor Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Mentor Performance
          </CardTitle>
          <CardDescription>
            Performance metrics and earnings for all mentors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mentorPerformance.map((mentor, index) => (
              <div key={mentor._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{mentor.name}</h4>
                      {getPerformanceBadge(mentor.averageRating)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(mentor.totalEarnings)}</p>
                    <p className="text-sm text-muted-foreground">Total earnings</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">{mentor.totalSessions}</p>
                      <p className="text-muted-foreground">Sessions</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="font-medium">{mentor.averageRating}/5</p>
                      <p className="text-muted-foreground">Rating</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">{mentor.completionRate}%</p>
                      <p className="text-muted-foreground">Completion</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="font-medium">{mentor.responseTime}h</p>
                      <p className="text-muted-foreground">Response time</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Student Satisfaction:</span>
                    <span className="font-medium text-blue-600">{mentor.studentSatisfaction}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}