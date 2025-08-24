'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Code, Users, BookOpen } from "lucide-react"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full"
                >
                  <span className="animate-pulse mr-2">✨</span>
                  Platform Pembelajaran #1 di Indonesia
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-4xl md:text-6xl font-bold leading-tight"
                >
                  Belajar Coding dengan{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Mentor Terbaik
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-xl text-muted-foreground leading-relaxed max-w-2xl"
                >
                  Bergabunglah dengan ribuan developer yang telah mengembangkan karier mereka
                  melalui pembelajaran praktis dan bimbingan personal dari mentor berpengalaman.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button asChild size="lg" className="group">
                  <Link href="/signup">
                    Mulai Belajar Sekarang
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/roadmap">
                    Lihat Roadmap
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="grid grid-cols-3 gap-8 pt-8"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">100+</div>
                  <div className="text-sm text-muted-foreground">Mentor Ahli</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">5000+</div>
                  <div className="text-sm text-muted-foreground">Siswa Aktif</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">95%</div>
                  <div className="text-sm text-muted-foreground">Tingkat Kepuasan</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 shadow-2xl">
                <div className="absolute inset-0 bg-white/20 rounded-3xl backdrop-blur-sm" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Code className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-white">
                      <div className="font-semibold">Interactive Learning</div>
                      <div className="text-white/80 text-sm">Hands-on coding experience</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-white">
                      <div className="font-semibold">Personal Mentoring</div>
                      <div className="text-white/80 text-sm">1-on-1 guidance from experts</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-white">
                      <div className="font-semibold">Structured Curriculum</div>
                      <div className="text-white/80 text-sm">Step-by-step learning path</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -top-4 -left-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
              >
                <Code className="h-5 w-5 text-blue-600" />
              </motion.div>
              
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-4 -right-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
              >
                <Users className="h-5 w-5 text-purple-600" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}