'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8 max-w-2xl mx-auto"
      >
        {/* 404 Illustration */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative"
        >
          <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            404
          </div>
          <div className="absolute inset-0 text-9xl font-bold text-blue-600/20 dark:text-blue-400/20 blur-sm">
            404
          </div>
        </motion.div>

        {/* Error Message */}
        <Card className="border-none shadow-2xl">
          <CardContent className="p-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-3xl font-bold">Halaman Tidak Ditemukan</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Oops! Sepertinya halaman yang Anda cari sudah pindah, dihapus, atau tidak pernah ada. 
                Jangan khawatir, mari kita bawa Anda kembali ke jalur yang benar.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="group">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1" />
                  Kembali ke Beranda
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="group" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Halaman Sebelumnya
              </Button>
            </motion.div>

            {/* Search Suggestion */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="pt-6 border-t"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Atau coba cari apa yang Anda butuhkan:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link href="/roadmap">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Search className="mr-1 h-3 w-3" />
                    Roadmap
                  </Button>
                </Link>
                <Link href="/tentang">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Search className="mr-1 h-3 w-3" />
                    Tentang Kami
                  </Button>
                </Link>
                <Link href="/hubungi">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Search className="mr-1 h-3 w-3" />
                    Hubungi Kami
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Search className="mr-1 h-3 w-3" />
                    Login
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Fun Element */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-center pt-4"
            >
              <p className="text-xs text-muted-foreground">
                💡 <span className="italic">Tips:</span> Periksa kembali URL atau gunakan navigasi di atas untuk menemukan halaman yang Anda cari.
              </p>
            </motion.div>
          </CardContent>
        </Card>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 opacity-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-2 border-blue-500 rounded-full"
          />
        </div>
        <div className="absolute bottom-20 right-20 opacity-20">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-purple-500 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  )
}