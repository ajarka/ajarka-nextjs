'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, BookOpen, DollarSign, Star, MessageCircle, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const mentorStats = [
  {
    title: 'Total Siswa',
    value: '45',
    change: '+5 siswa baru',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    title: 'Kursus Aktif',
    value: '3',
    change: 'React, Node.js, Full-Stack',
    icon: BookOpen,
    color: 'text-green-600'
  },
  {
    title: 'Penghasilan Bulan Ini',
    value: 'Rp 15.5M',
    change: '+25% dari bulan lalu',
    icon: DollarSign,
    color: 'text-purple-600'
  },
  {
    title: 'Rating Rata-rata',
    value: '4.9',
    change: 'dari 45 review',
    icon: Star,
    color: 'text-orange-600'
  }
]

const upcomingClasses = [
  {
    id: 1,
    title: 'React Fundamentals',
    student: 'John Doe',
    time: '14:00 - 16:00',
    date: 'Hari ini',
    type: '1-on-1'
  },
  {
    id: 2,
    title: 'Full-Stack Project Review',
    student: 'Jane Smith',
    time: '16:30 - 18:00',
    date: 'Hari ini',
    type: 'Project Review'
  },
  {
    id: 3,
    title: 'Node.js Backend Development',
    student: 'Bob Johnson',
    time: '10:00 - 12:00',
    date: 'Besok',
    type: '1-on-1'
  }
]

const recentMessages = [
  {
    id: 1,
    student: 'Alice Wilson',
    message: 'Terima kasih atas penjelasan tentang React Hooks kemarin...',
    time: '2 jam lalu',
    unread: true
  },
  {
    id: 2,
    student: 'David Chen',
    message: 'Apakah bisa schedule ulang sesi untuk minggu depan?',
    time: '5 jam lalu',
    unread: true
  },
  {
    id: 3,
    student: 'Sarah Kim',
    message: 'Project final saya sudah selesai, bisa direview?',
    time: '1 hari lalu',
    unread: false
  }
]

export function MentorDashboard() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold mb-2">Dashboard Mentor</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali! Berikut adalah ringkasan aktivitas mentoring Anda.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mentorStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.change}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Classes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Jadwal Mengajar
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/jadwal">Lihat Semua</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingClasses.map((class_) => (
                  <div
                    key={class_.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium">{class_.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        dengan {class_.student}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {class_.date} • {class_.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                        {class_.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Messages */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Pesan Terbaru
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/pesan">Lihat Semua</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                      message.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {message.student.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{message.student}</h4>
                        <span className="text-xs text-muted-foreground">
                          {message.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {message.message}
                      </p>
                      {message.unread && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance & Earnings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid lg:grid-cols-3 gap-8"
      >
        {/* Monthly Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Penghasilan Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Januari 2024</span>
                <span className="font-medium">Rp 15.5M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Desember 2023</span>
                <span className="font-medium">Rp 12.3M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">November 2023</span>
                <span className="font-medium">Rp 11.8M</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Growth Rate</span>
                  <span className="font-medium text-green-600">+25%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performa Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Completion Rate</span>
                <span className="font-medium">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Job Placement</span>
                <span className="font-medium">88%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Rating</span>
                <span className="font-medium">4.9/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Reviews</span>
                <span className="font-medium">45</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline" asChild>
              <Link href="/dashboard/akun">Update Profil</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/dashboard/mentor/materials" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Kelola Materi
              </Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/dashboard/transaksi">Lihat Transaksi</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/dashboard/jadwal">Atur Jadwal</Link>
            </Button>
            <Button className="w-full" asChild>
              <Link href="/dashboard/siswa">Kelola Siswa</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}