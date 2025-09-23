'use client'

import { useState, useEffect } from 'react'
import { PaymentService, PaymentTransaction, MentorPayout } from '@/lib/payment-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  CreditCard,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Banknote,
  Building,
  Send
} from "lucide-react"
import { format, startOfMonth, endOfMonth } from 'date-fns'

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [mentorPayouts, setMentorPayouts] = useState<MentorPayout[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null)
  const [selectedPayout, setSelectedPayout] = useState<MentorPayout | null>(null)
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)
  const [processingPayout, setProcessingPayout] = useState(false)
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    totalMentorPayouts: 0,
    totalAdminRevenue: 0,
    averageTransactionValue: 0
  })

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    mentorId: '',
    studentId: ''
  })

  // Payout form
  const [payoutForm, setPayoutForm] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    transferId: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [transactionData, payoutData, analyticsData] = await Promise.all([
        PaymentService.getTransactions(),
        PaymentService.getMentorPayouts(),
        PaymentService.getPaymentAnalytics()
      ])
      
      setTransactions(transactionData)
      setMentorPayouts(payoutData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateMonthlyPayouts = async () => {
    const currentMonth = format(new Date(), 'yyyy-MM')
    setLoading(true)
    try {
      await PaymentService.generateMonthlyPayouts(currentMonth)
      await fetchData()
    } catch (error) {
      console.error('Error generating payouts:', error)
      alert('Failed to generate monthly payouts')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayout = async () => {
    if (!selectedPayout || !payoutForm.bankName || !payoutForm.accountNumber || !payoutForm.accountName) {
      alert('Please fill in all required fields')
      return
    }

    setProcessingPayout(true)
    try {
      const success = await PaymentService.processMentorPayout(selectedPayout._id, {
        bankName: payoutForm.bankName,
        accountNumber: payoutForm.accountNumber,
        accountName: payoutForm.accountName,
        transferId: payoutForm.transferId || undefined
      })

      if (success) {
        await fetchData()
        setShowPayoutDialog(false)
        setSelectedPayout(null)
        setPayoutForm({ bankName: '', accountNumber: '', accountName: '', transferId: '' })
        alert('Payout processed successfully!')
      } else {
        alert('Failed to process payout')
      }
    } catch (error) {
      console.error('Error processing payout:', error)
      alert('Failed to process payout')
    } finally {
      setProcessingPayout(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'expired': return 'bg-orange-100 text-orange-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      case 'expired': return <AlertCircle className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Transaction Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage payments, transactions, and monthly mentor payouts
          </p>
        </div>
        <Button onClick={handleGenerateMonthlyPayouts} className="bg-green-600 hover:bg-green-700">
          <Banknote className="h-4 w-4 mr-2" />
          Generate Monthly Payouts
        </Button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.successfulTransactions} successful transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Revenue</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalAdminRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              30% platform fee
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentor Payouts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalMentorPayouts)}</div>
            <p className="text-xs text-muted-foreground">
              70% mentor earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Mentor Payouts</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Transactions
              </CardTitle>
              <CardDescription>
                All payment transactions from students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search transactions..."
                    className="max-w-sm"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Transactions Table */}
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{transaction.sessionTitle}</h4>
                            <Badge className={getStatusColor(transaction.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(transaction.status)}
                                {transaction.status.toUpperCase()}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Order ID: {transaction.orderId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{formatCurrency(transaction.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Student ID:</span>
                          <span className="ml-1 font-medium">{transaction.studentId}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mentor ID:</span>
                          <span className="ml-1 font-medium">{transaction.mentorId}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Session:</span>
                          <span className="ml-1 font-medium">{transaction.bookingDetails.date}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="ml-1 font-medium">{transaction.bookingDetails.duration}min</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t">
                        <div className="flex gap-4 text-sm">
                          <span>Mentor Fee: <strong className="text-green-600">{formatCurrency(transaction.mentorFee)}</strong></span>
                          <span>Admin Fee: <strong className="text-blue-600">{formatCurrency(transaction.adminFee)}</strong></span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Monthly Mentor Payouts
              </CardTitle>
              <CardDescription>
                Manage and process monthly payouts to mentors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mentorPayouts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No payouts available</p>
                    <p className="text-sm">Generate monthly payouts to see them here</p>
                  </div>
                ) : (
                  mentorPayouts.map((payout) => (
                    <div key={payout.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{payout.mentorName}</h4>
                            <Badge className={getStatusColor(payout.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(payout.status)}
                                {payout.status.toUpperCase()}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Month: {payout.month} • {payout.totalSessions} sessions
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(payout.totalEarnings)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total earnings
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t">
                        <div className="text-sm text-muted-foreground">
                          Created: {formatDate(payout.createdAt)}
                          {payout.processedAt && (
                            <span className="ml-4">
                              Processed: {formatDate(payout.processedAt)}
                            </span>
                          )}
                        </div>
                        {payout.status === 'pending' && (
                          <Button
                            onClick={() => {
                              setSelectedPayout(payout)
                              setShowPayoutDialog(true)
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Process Payout
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Process Payout Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Mentor Payout</DialogTitle>
            <DialogDescription>
              Enter bank transfer details for {selectedPayout?.mentorName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayout && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Amount to transfer:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedPayout.totalEarnings)}
                  </span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  {selectedPayout.totalSessions} sessions in {selectedPayout.month}
                </p>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={payoutForm.bankName}
                    onChange={(e) => setPayoutForm({...payoutForm, bankName: e.target.value})}
                    placeholder="e.g., BCA, Mandiri, BNI"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={payoutForm.accountNumber}
                    onChange={(e) => setPayoutForm({...payoutForm, accountNumber: e.target.value})}
                    placeholder="Account number"
                  />
                </div>
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={payoutForm.accountName}
                    onChange={(e) => setPayoutForm({...payoutForm, accountName: e.target.value})}
                    placeholder="Account holder name"
                  />
                </div>
                <div>
                  <Label htmlFor="transferId">Transfer ID (Optional)</Label>
                  <Input
                    id="transferId"
                    value={payoutForm.transferId}
                    onChange={(e) => setPayoutForm({...payoutForm, transferId: e.target.value})}
                    placeholder="Bank transfer reference ID"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcessPayout} 
              disabled={processingPayout}
              className="bg-green-600 hover:bg-green-700"
            >
              {processingPayout ? 'Processing...' : 'Process Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}