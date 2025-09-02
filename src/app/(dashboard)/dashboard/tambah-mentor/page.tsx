'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import AddMentorForm from '@/components/admin/add-mentor-form'

export default function AddMentorPage() {
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
      <AddMentorForm />
    </div>
  )
}