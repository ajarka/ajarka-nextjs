'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, Trophy, Target, Play, Calendar, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

const studentStats = [
  {
    title: 'Kursus Aktif',
    value: '2',
    change: 'React & Node.js',
    icon: BookOpen,
    color: 'text-blue-600'
  },
  {
    title: 'Jam Belajar',
    value: '156',
    change: 'bulan ini',
    icon: Clock,
    color: 'text-green-600'
  },
  {
    title: 'Sertifikat',
    value: '1',
    change: 'React Fundamentals',
    icon: Trophy,
    color: 'text-purple-600'
  },
  {
    title: 'Progress Overall',
    value: '67%',
    change: 'dari target',
    icon: Target,
    color: 'text-orange-600'
  }
]

const activeCourses = [
  {
    id: 1,
    title: 'React Development Fundamentals',
    mentor: 'John Doe',
    mentorAvatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff',
    progress: 75,
    nextSession: '2024-01-25 14:00',
    totalLessons: 24,
    completedLessons: 18
  },
  {
    id: 2,
    title: 'Full-Stack Web Development',
    mentor: 'Jane Smith',
    mentorAvatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=10b981&color=fff',
    progress: 45,
    nextSession: '2024-01-26 16:00',
    totalLessons: 32,
    completedLessons: 14
  }
]

const upcomingClasses = [
  {
    id: 1,
    title: 'React State Management',
    mentor: 'John Doe',
    time: '14:00 - 16:00',
    date: 'Hari ini',
    type: '1-on-1'
  },
  {
    id: 2,
    title: 'Project Review Session',
    mentor: 'Jane Smith',
    time: '16:00 - 17:30',
    date: 'Besok',
    type: 'Project Review'
  },
  {
    id: 3,
    title: 'Backend API Development',
    mentor: 'Jane Smith',
    time: '10:00 - 12:00',
    date: '27 Jan',
    type: '1-on-1'
  }
]

const recentAchievements = [
  {
    title: 'First React App Completed',
    description: 'Berhasil membuat aplikasi React pertama',
    date: '2 hari lalu',
    icon: Trophy
  },
  {
    title: '50 Hours Learning Milestone',
    description: 'Mencapai 50 jam belajar bulan ini',
    date: '1 minggu lalu',
    icon: Clock
  },
  {
    title: 'JavaScript Fundamentals Certificate',
    description: 'Berhasil lulus ujian JavaScript',
    date: '2 minggu lalu',
    icon: Trophy
  }
]

export function SiswaDashboard() {
  return (
    <div className="container px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold mb-2">Dashboard Siswa</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali! Mari lanjutkan perjalanan belajar Anda.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentStats.map((stat, index) => (
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

      {/* Active Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Kursus Aktif
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/kursus">Lihat Semua</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activeCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={course.mentorAvatar} alt={course.mentor} />
                        <AvatarFallback>{course.mentor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Mentor: {course.mentor}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sesi selanjutnya: {new Date(course.nextSession).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/kursus/${course.id}`}>
                        <Play className="h-4 w-4 mr-1" />
                        Lanjutkan
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress Kursus</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{course.completedLessons} dari {course.totalLessons} pelajaran</span>
                      <span>{course.totalLessons - course.completedLessons} tersisa</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Classes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Jadwal Kelas
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
                        dengan {class_.mentor}
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

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Pencapaian Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAchievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10"
                  >
                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                      <achievement.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Learning Progress & Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="grid lg:grid-cols-3 gap-8"
      >
        {/* Weekly Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Target Mingguan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Jam Belajar</span>
                <span className="text-sm font-medium">12/20 jam</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Tugas Diselesaikan</span>
                <span className="text-sm font-medium">3/5 tugas</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Sesi Mentoring</span>
                <span className="text-sm font-medium">2/3 sesi</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Pesan dari Mentor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <p className="text-sm">"Great progress on your React project! Keep it up!"</p>
              <p className="text-xs text-muted-foreground mt-1">John Doe • 2 jam lalu</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <p className="text-sm">"Don't forget to submit your assignment before tomorrow."</p>
              <p className="text-xs text-muted-foreground mt-1">Jane Smith • 1 hari lalu</p>
            </div>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/dashboard/pesan">Lihat Semua Pesan</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" asChild>
              <Link href="/dashboard/kursus">Lanjutkan Belajar</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/dashboard/jadwal">Lihat Jadwal</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/dashboard/tugas">Lihat Tugas</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/dashboard/transaksi">Riwayat Transaksi</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}