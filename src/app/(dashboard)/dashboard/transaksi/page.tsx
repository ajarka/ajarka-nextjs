'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import TransactionManagement from '@/components/admin/transaction-management'

export default function TransactionPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <TransactionManagement />
    </div>
  )
}