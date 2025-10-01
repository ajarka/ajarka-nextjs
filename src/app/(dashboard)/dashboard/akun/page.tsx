'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import AccountSettings from '@/components/dashboard/account-settings'

export default function AccountPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <AccountSettings />
    </div>
  )
}
