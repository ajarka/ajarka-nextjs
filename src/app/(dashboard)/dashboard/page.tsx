'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { MentorDashboard } from '@/components/dashboard/mentor-dashboard'
import { SiswaDashboard } from '@/components/dashboard/siswa-dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading dashboard...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Render dashboard based on user role
  switch (session.user.role) {
    case 'admin':
      return <AdminDashboard />
    case 'mentor':
      return <MentorDashboard />
    case 'siswa':
      return <SiswaDashboard />
    default:
      return (
        <div className="container px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
              <p className="text-muted-foreground">
                Role tidak dikenali. Silakan hubungi administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      )
  }
}