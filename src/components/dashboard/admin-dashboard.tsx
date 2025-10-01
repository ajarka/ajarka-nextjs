'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, BookOpen, DollarSign, TrendingUp, Plus, Eye, Settings, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const stats = [
  {
    title: 'Total Siswa',
    value: '1,234',
    change: '+12%',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    title: 'Total Mentor',
    value: '89',
    change: '+5%',
    icon: Users,
    color: 'text-green-600'
  },
  {
    title: 'Total Kursus',
    value: '156',
    change: '+8%',
    icon: BookOpen,
    color: 'text-purple-600'
  },
  {
    title: 'Revenue Bulan Ini',
    value: 'Rp 45.2M',
    change: '+18%',
    icon: DollarSign,
    color: 'text-orange-600'
  }
]

const quickActions = [
  {
    title: 'Admin Management',
    description: 'Kelola pricing, lokasi, dan event',
    href: '/dashboard/admin',
    icon: Settings,
    color: 'bg-indigo-600'
  },
  {
    title: 'Kelola Users',
    description: 'Lihat dan kelola semua mentor & siswa',
    href: '/dashboard/users',
    icon: Users,
    color: 'bg-gray-600'
  },
  {
    title: 'Statistik & Analytics',
    description: 'Lihat performa mentor dan pembayaran siswa',
    href: '/dashboard/analytics',
    icon: BarChart3,
    color: 'bg-teal-600'
  },
  {
    title: 'Tambah Mentor',
    description: 'Tambahkan mentor baru ke platform',
    href: '/dashboard/tambah-mentor',
    icon: Plus,
    color: 'bg-green-600'
  },
  {
    title: 'Tambah Siswa',
    description: 'Tambahkan siswa baru atau import bulk',
    href: '/dashboard/tambah-siswa',
    icon: Plus,
    color: 'bg-blue-600'
  },
  {
    title: 'Kelola Transaksi',
    description: 'Lihat dan kelola semua transaksi',
    href: '/dashboard/transaksi',
    icon: Eye,
    color: 'bg-purple-600'
  }
]

const recentTransactions = [
  {
    id: 1,
    student: 'John Doe',
    course: 'React Development',
    amount: 'Rp 2.500.000',
    status: 'completed',
    date: '2024-01-20'
  },
  {
    id: 2,
    student: 'Jane Smith',
    course: 'Full Stack Development',
    amount: 'Rp 5.000.000',
    status: 'pending',
    date: '2024-01-19'
  },
  {
    id: 3,
    student: 'Bob Johnson',
    course: 'UI/UX Design',
    amount: 'Rp 3.000.000',
    status: 'completed',
    date: '2024-01-18'
  }
]

export function AdminDashboard() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali! Berikut adalah ringkasan platform Ajarka.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
                    <p className="text-sm text-green-600">{stat.change} dari bulan lalu</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => (
                <Link key={action.title} href={action.href}>
                  <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">{action.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transaksi Terbaru</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/transaksi">Lihat Semua</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{transaction.student}</h4>
                      <p className="text-sm text-muted-foreground">
                        {transaction.course}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{transaction.amount}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}
                      >
                        {transaction.status === 'completed' ? 'Selesai' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid lg:grid-cols-2 gap-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Chart akan ditampilkan di sini</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Active Students</span>
              <span className="font-medium">1,234</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Active Mentors</span>
              <span className="font-medium">89</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Courses</span>
              <span className="font-medium">156</span>
            </div>
            <div className="flex items-center justify-between">
              <span>This Month Revenue</span>
              <span className="font-medium text-green-600">Rp 45.2M</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Platform Growth</span>
              <span className="font-medium text-blue-600">+18%</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}