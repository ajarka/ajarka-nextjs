'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { PaymentService, PaymentRequest } from '@/lib/payment-service'

interface PaymentButtonProps {
  paymentRequest: PaymentRequest
  onPaymentSuccess: (transactionId: string) => void
  onPaymentError: (error: string) => void
  disabled?: boolean
  className?: string
}

export default function PaymentButton({ 
  paymentRequest, 
  onPaymentSuccess, 
  onPaymentError, 
  disabled = false,
  className = "" 
}: PaymentButtonProps) {
  const [processing, setProcessing] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handlePayment = async () => {
    setProcessing(true)
    try {
      // Create payment transaction
      const paymentTransaction = await PaymentService.createPayment(paymentRequest)
      
      if (!paymentTransaction) {
        throw new Error('Failed to create payment transaction')
      }

      // In production, this would redirect to Midtrans Snap
      // For now, show payment simulation
      const proceedWithPayment = confirm(
        `Payment Details:\n\n` +
        `Session: ${paymentRequest.sessionTitle}\n` +
        `Amount: ${formatCurrency(paymentRequest.amount)}\n` +
        `Date: ${paymentRequest.bookingDetails.date} at ${paymentRequest.bookingDetails.time}\n\n` +
        `Continue to payment gateway?`
      )

      if (!proceedWithPayment) {
        setProcessing(false)
        return
      }

      // Simulate payment process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate payment success (in production, this comes from Midtrans webhook)
      const paymentSuccess = Math.random() > 0.1 // 90% success rate

      if (paymentSuccess) {
        // Handle payment notification
        await PaymentService.handlePaymentNotification({
          transaction_status: 'settlement',
          order_id: paymentTransaction.orderId,
          transaction_id: `MIDTRANS_${Date.now()}`,
          payment_type: 'bank_transfer',
          transaction_time: new Date().toISOString()
        })
        
        onPaymentSuccess(paymentTransaction.orderId)
      } else {
        await PaymentService.handlePaymentNotification({
          transaction_status: 'failure',
          order_id: paymentTransaction.orderId,
          transaction_id: `MIDTRANS_${Date.now()}`,
          payment_type: 'bank_transfer',
          transaction_time: new Date().toISOString()
        })
        
        throw new Error('Payment failed')
      }

    } catch (error) {
      console.error('Payment error:', error)
      onPaymentError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card className={`payment-card ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Payment Summary
        </CardTitle>
        <CardDescription>
          Review your booking details and complete payment
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Session Details */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">{paymentRequest.sessionTitle}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>Date: <span className="font-medium">{paymentRequest.bookingDetails.date}</span></div>
            <div>Time: <span className="font-medium">{paymentRequest.bookingDetails.time}</span></div>
            <div>Duration: <span className="font-medium">{paymentRequest.bookingDetails.duration} minutes</span></div>
            <div>Type: <span className="font-medium capitalize">{paymentRequest.bookingDetails.meetingType}</span></div>
          </div>
          
          {paymentRequest.bookingDetails.materials.length > 0 && (
            <div className="mt-2">
              <span className="text-sm text-gray-600">Materials: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {paymentRequest.bookingDetails.materials.map((material, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {material}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Session Price</span>
            <span className="font-bold text-lg">{formatCurrency(paymentRequest.amount)}</span>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>• Mentor receives (70%)</span>
              <span>{formatCurrency(paymentRequest.mentorFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>• Platform fee (30%)</span>
              <span>{formatCurrency(paymentRequest.adminFee)}</span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Shield className="h-4 w-4 text-green-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-green-800">Secure Payment</p>
            <p className="text-green-600">
              Powered by Midtrans - Your payment is protected with bank-level security
            </p>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={disabled || processing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
          size="lg"
        >
          {processing ? (
            <>
              <Clock className="h-5 w-5 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Pay {formatCurrency(paymentRequest.amount)}
            </>
          )}
        </Button>

        {/* Payment Methods */}
        <div className="text-center text-sm text-gray-500">
          <p>Supported payment methods:</p>
          <div className="flex justify-center gap-4 mt-2">
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Bank Transfer</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">E-Wallet</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Virtual Account</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Credit Card</span>
          </div>
        </div>

        {/* Terms */}
        <div className="text-xs text-gray-400 text-center">
          By proceeding with payment, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 hover:underline">Cancellation Policy</a>
        </div>
      </CardContent>
    </Card>
  )
}