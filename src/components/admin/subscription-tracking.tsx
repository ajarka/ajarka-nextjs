'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Users, 
  Calendar,
  TrendingUp,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Package,
  DollarSign
} from "lucide-react"
import { BundleService, StudentSubscription, BundlePackage } from '@/lib/bundle-service'
import { format, parseISO, differenceInDays } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface SubscriptionWithUser extends StudentSubscription {
  student: User
  bundle: BundlePackage
}

export default function SubscriptionTracking() {
  const [subscriptions, setSubscriptions] = useState<StudentSubscription[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [bundles, setBundles] = useState<BundlePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [bundleFilter, setBundleFilter] = useState<string>('all')
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionWithUser | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [subscriptionsData, usersData, bundlesData] = await Promise.all([
        BundleService.getAllStudentSubscriptions(),
        BundleService.getAllUsers(),
        BundleService.getAllBundlePackages()
      ])
      
      setSubscriptions(subscriptionsData)
      setUsers(usersData)
      setBundles(bundlesData)
    } catch (error) {
      console.error('Failed to load subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getSubscriptionWithDetails = (subscription: StudentSubscription): SubscriptionWithUser => {
    const student = users.find(u => u._id === subscription.studentId) || {
      id: subscription.studentId,
      name: 'Unknown Student',
      email: 'unknown@email.com',
      role: 'student'
    }
    
    const bundle = bundles.find(b => b._id === subscription.bundleId) || {
      id: subscription.bundleId,
      name: subscription.bundleName,
      description: 'Bundle no longer available',
      type: 'monthly' as const,
      sessionCount: subscription.totalSessions,
      originalPrice: subscription.originalPrice,
      discountPercentage: 0,
      finalPrice: subscription.paidPrice,
      validityDays: 30,
      isActive: false,
      features: [],
      createdAt: '',
      updatedAt: ''
    }

    return { ...subscription, student, bundle }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300'
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300'
      case 'suspended': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-3 w-3" />
      case 'expired': return <Clock className="h-3 w-3" />
      case 'cancelled': return <XCircle className="h-3 w-3" />
      case 'suspended': return <AlertCircle className="h-3 w-3" />
      default: return <AlertCircle className="h-3 w-3" />
    }
  }

  const getDaysRemaining = (expiryDate: string) => {
    const days = differenceInDays(parseISO(expiryDate), new Date())
    return Math.max(0, days)
  }

  const getUsagePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100)
  }

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const withDetails = getSubscriptionWithDetails(subscription)
    
    // Search filter
    const matchesSearch = !searchQuery || 
      withDetails.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      withDetails.student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      withDetails.bundleName.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter
    
    // Bundle filter
    const matchesBundle = bundleFilter === 'all' || subscription.bundleId === bundleFilter
    
    return matchesSearch && matchesStatus && matchesBundle
  })

  const subscriptionStats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    expired: subscriptions.filter(s => s.status === 'expired').length,
    totalRevenue: subscriptions.reduce((sum, s) => sum + s.paidPrice, 0),
    expiringNext7Days: subscriptions.filter(s => {
      const days = getDaysRemaining(s.expiryDate)
      return s.status === 'active' && days <= 7 && days >= 0
    }).length
  }

  const handleViewDetails = (subscription: StudentSubscription) => {
    setSelectedSubscription(getSubscriptionWithDetails(subscription))
    setShowDetailsDialog(true)
  }

  const handleUpdateSubscriptionStatus = async (subscriptionId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3001/student_subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          updatedAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        await loadData()
        setShowDetailsDialog(false)
      }
    } catch (error) {
      console.error('Failed to update subscription status:', error)
    }
  }

  const exportSubscriptions = () => {
    const csvContent = [
      // Header
      ['Student Name', 'Email', 'Bundle', 'Status', 'Total Sessions', 'Used Sessions', 'Remaining Sessions', 'Purchase Date', 'Expiry Date', 'Paid Amount'].join(','),
      // Data
      ...filteredSubscriptions.map(subscription => {
        const withDetails = getSubscriptionWithDetails(subscription)
        return [
          withDetails.student.name,
          withDetails.student.email,
          withDetails.bundleName,
          withDetails.status,
          withDetails.totalSessions,
          withDetails.usedSessions,
          withDetails.remainingSessions,
          format(parseISO(withDetails.purchaseDate), 'yyyy-MM-dd'),
          format(parseISO(withDetails.expiryDate), 'yyyy-MM-dd'),
          withDetails.paidPrice
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscriptions_${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading subscription data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{subscriptionStats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{subscriptionStats.expired}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{subscriptionStats.expiringNext7Days}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(subscriptionStats.totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Subscription Management
              </CardTitle>
              <CardDescription>
                Track and manage student subscriptions and bundle packages
              </CardDescription>
            </div>
            <Button onClick={exportSubscriptions} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, email, or bundle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Bundle Filter */}
            <Select value={bundleFilter} onValueChange={setBundleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bundles</SelectItem>
                {bundles.map((bundle) => (
                  <SelectItem key={bundle._id} value={bundle._id}>
                    {bundle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subscriptions Table */}
          <div className="space-y-4">
            {filteredSubscriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No subscriptions found matching your filters</p>
              </div>
            ) : (
              filteredSubscriptions.map((subscription) => {
                const withDetails = getSubscriptionWithDetails(subscription)
                const daysRemaining = getDaysRemaining(subscription.expiryDate)
                const usagePercentage = getUsagePercentage(subscription.usedSessions, subscription.totalSessions)
                const isExpiringSoon = subscription.status === 'active' && daysRemaining <= 7
                
                return (
                  <Card key={subscription._id} className={`border-l-4 ${
                    subscription.status === 'active' ? 'border-l-green-500' :
                    subscription.status === 'expired' ? 'border-l-gray-500' :
                    subscription.status === 'cancelled' ? 'border-l-red-500' :
                    'border-l-yellow-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-semibold">{withDetails.student.name}</h3>
                              <p className="text-sm text-gray-600">{withDetails.student.email}</p>
                            </div>
                            <Badge className={`${getStatusColor(subscription.status)} border`}>
                              {getStatusIcon(subscription.status)}
                              <span className="ml-1 capitalize">{subscription.status}</span>
                            </Badge>
                            {isExpiringSoon && (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-300 border">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Expires in {daysRemaining} days
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Bundle</p>
                              <p className="font-medium">{subscription.bundleName}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Sessions</p>
                              <p className="font-medium">{subscription.usedSessions}/{subscription.totalSessions} used</p>
                              <div className="mt-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    usagePercentage >= 90 ? 'bg-red-500' :
                                    usagePercentage >= 70 ? 'bg-orange-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${usagePercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500">Purchase Date</p>
                              <p className="font-medium">
                                {format(parseISO(subscription.purchaseDate), 'MMM d, yyyy', { locale: localeId })}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Expires</p>
                              <p className={`font-medium ${
                                isExpiringSoon ? 'text-orange-600' : 
                                subscription.status === 'expired' ? 'text-gray-500' : 
                                'text-gray-900'
                              }`}>
                                {format(parseISO(subscription.expiryDate), 'MMM d, yyyy', { locale: localeId })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-500">Paid: </span>
                            <span className="font-bold">{formatCurrency(subscription.paidPrice)}</span>
                            {subscription.discountAmount > 0 && (
                              <span className="text-green-600">
                                (Saved {formatCurrency(subscription.discountAmount)})
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(subscription)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedSubscription?.student.name}'s subscription
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubscription && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Student</p>
                  <p className="font-medium">{selectedSubscription.student.name}</p>
                  <p className="text-sm text-gray-600">{selectedSubscription.student.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={`${getStatusColor(selectedSubscription.status)} border w-fit`}>
                    {getStatusIcon(selectedSubscription.status)}
                    <span className="ml-1 capitalize">{selectedSubscription.status}</span>
                  </Badge>
                </div>
              </div>

              {/* Bundle Details */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Bundle: {selectedSubscription.bundleName}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Sessions</p>
                    <p className="font-medium">{selectedSubscription.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Used Sessions</p>
                    <p className="font-medium">{selectedSubscription.usedSessions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remaining Sessions</p>
                    <p className="font-medium text-green-600">{selectedSubscription.remainingSessions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Usage</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${getUsagePercentage(selectedSubscription.usedSessions, selectedSubscription.totalSessions)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">
                        {getUsagePercentage(selectedSubscription.usedSessions, selectedSubscription.totalSessions)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Original Price</p>
                    <p className="font-medium">{formatCurrency(selectedSubscription.originalPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Discount Amount</p>
                    <p className="font-medium text-green-600">{formatCurrency(selectedSubscription.discountAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Final Price</p>
                    <p className="font-bold text-lg">{formatCurrency(selectedSubscription.paidPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Purchase Date</p>
                    <p className="font-medium">
                      {format(parseISO(selectedSubscription.purchaseDate), 'MMM d, yyyy HH:mm', { locale: localeId })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Validity Info */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Validity Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Expires On</p>
                    <p className="font-medium">
                      {format(parseISO(selectedSubscription.expiryDate), 'MMM d, yyyy', { locale: localeId })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Days Remaining</p>
                    <p className={`font-medium ${
                      selectedSubscription.status !== 'active' ? 'text-gray-500' :
                      getDaysRemaining(selectedSubscription.expiryDate) <= 7 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {selectedSubscription.status === 'active' 
                        ? `${getDaysRemaining(selectedSubscription.expiryDate)} days` 
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              {selectedSubscription.transactions.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Transaction History</h4>
                  <div className="space-y-2">
                    {selectedSubscription.transactions.map((transactionId, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                        <span>Transaction #{transactionId.slice(-6)}</span>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <div className="flex justify-between w-full">
              <div className="flex gap-2">
                {selectedSubscription?.status === 'active' && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateSubscriptionStatus(selectedSubscription._id, 'suspended')}
                  >
                    Suspend
                  </Button>
                )}
                {selectedSubscription?.status === 'suspended' && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateSubscriptionStatus(selectedSubscription._id, 'active')}
                  >
                    Reactivate
                  </Button>
                )}
                {selectedSubscription?.status !== 'cancelled' && (
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateSubscriptionStatus(selectedSubscription._id, 'cancelled')}
                  >
                    Cancel
                  </Button>
                )}
              </div>
              <Button onClick={() => setShowDetailsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}