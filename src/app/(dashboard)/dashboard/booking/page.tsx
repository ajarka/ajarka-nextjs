'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import StudentBookingInterface from '@/components/dashboard/student-booking-interface'

export default function BookingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    // Redirect non-students to their appropriate dashboard
    if (session && session.user.role !== 'siswa') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading booking interface...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session || session.user.role !== 'siswa') {
    return null
  }

  // Extract studentId from session - assume it's stored in session.user.id
  const studentId = parseInt(session.user.id as string) || 3 // fallback to 3 for demo

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
          <h1 className="text-3xl font-bold">Book Mentoring Session</h1>
          <p className="text-muted-foreground">
            Find and book sessions with our expert mentors
          </p>
        </div>
      </div>

      {/* Booking Interface Component */}
      <StudentBookingInterface studentId={studentId} />
    </div>
  )
}