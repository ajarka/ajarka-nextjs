'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Users, DollarSign, Calendar, Star } from "lucide-react"

const mentorBenefits = [
  {
    icon: DollarSign,
    title: "Penghasilan Tambahan",
    description: "Dapatkan penghasilan hingga 10-50 juta per bulan dengan mengajar skill Anda"
  },
  {
    icon: Users,
    title: "Impact Positif",
    description: "Bantu mengembangkan talent developer Indonesia dan berkontribusi untuk masa depan tech"
  },
  {
    icon: Calendar,
    title: "Jadwal Fleksibel",
    description: "Atur jadwal mengajar sesuai ketersediaan waktu Anda, tanpa mengganggu pekerjaan utama"
  },
  {
    icon: Star,
    title: "Personal Branding",
    description: "Tingkatkan reputasi dan personal brand Anda sebagai expert di bidang teknologi"
  }
]

export function SignUpMentorSection() {
  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-full"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Bergabung Jadi Mentor
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-5xl font-bold leading-tight"
                >
                  Berbagi Ilmu,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                    Raih Penghasilan
                  </span>
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="text-xl text-muted-foreground leading-relaxed"
                >
                  Jadilah bagian dari komunitas mentor terbaik Indonesia. Bagikan pengalaman dan 
                  keahlian Anda sambil mendapatkan penghasilan yang menarik.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {mentorBenefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4"
                  >
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <benefit.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{benefit.title}</h4>
                      <p className="text-muted-foreground text-sm">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button asChild size="lg" className="group bg-green-600 hover:bg-green-700">
                  <Link href="/cara_mendaftar_mentor">
                    Daftar Jadi Mentor
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#mentor-requirements">
                    Lihat Persyaratan
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content - Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="grid gap-6">
                <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Rata-rata Penghasilan Mentor</h3>
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">Rp 15-30 Juta</div>
                    <p className="text-sm text-muted-foreground">Per bulan untuk mentor aktif</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Mentor Aktif</h3>
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">100+</div>
                    <p className="text-sm text-muted-foreground">Expert dari berbagai bidang tech</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Rating Kepuasan</h3>
                      <Star className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">4.9/5</div>
                    <p className="text-sm text-muted-foreground">Dari 1000+ review siswa</p>
                  </CardContent>
                </Card>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                viewport={{ once: true }}
                className="p-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl text-white text-center"
              >
                <h4 className="font-semibold text-lg mb-2">Promo Khusus Mentor Baru!</h4>
                <p className="text-green-100 mb-4">
                  Dapatkan bonus Rp 5 juta untuk 10 mentor pertama yang join bulan ini
                </p>
                <div className="text-2xl font-bold">⏰ Terbatas!</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}