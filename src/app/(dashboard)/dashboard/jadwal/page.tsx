'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import MentorScheduleManager from '@/components/dashboard/mentor-schedule-manager'

export default function JadwalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    // Redirect non-mentors to their appropriate dashboard
    if (session && session.user.role !== 'mentor') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading schedule management...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session || session.user.role !== 'mentor') {
    return null
  }

  // Extract mentorId from session - assume it's stored in session.user.id
  const mentorId = parseInt(session.user.id as string) || 2 // fallback to 2 for demo

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Manajemen Jadwal</h1>
          <p className="text-muted-foreground">
            Kelola jadwal dan ketersediaan mentoring Anda
          </p>
        </div>
      </div>

      {/* Schedule Manager Component */}
      <MentorScheduleManager mentorId={mentorId} />
    </div>
  )
}