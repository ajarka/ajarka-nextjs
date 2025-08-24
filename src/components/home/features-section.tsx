'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Code2, Users, BookOpen, Trophy, Clock, Shield } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Code2,
    title: "Pembelajaran Interaktif",
    description: "Belajar coding dengan project nyata dan hands-on experience yang akan mempersiapkan Anda untuk dunia kerja",
    color: "text-blue-600"
  },
  {
    icon: Users,
    title: "Mentor Berpengalaman",
    description: "Dibimbing langsung oleh praktisi industri dengan pengalaman bertahun-tahun di bidang teknologi",
    color: "text-green-600"
  },
  {
    icon: BookOpen,
    title: "Kurikulum Terstruktur",
    description: "Materi pembelajaran yang disusun sistematis dari dasar hingga advanced level",
    color: "text-purple-600"
  },
  {
    icon: Trophy,
    title: "Sertifikasi",
    description: "Dapatkan sertifikat yang diakui industri setelah menyelesaikan program pembelajaran",
    color: "text-orange-600"
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description: "Belajar sesuai waktu Anda dengan akses 24/7 ke materi dan platform pembelajaran",
    color: "text-pink-600"
  },
  {
    icon: Shield,
    title: "Job Guarantee",
    description: "Dapatkan jaminan penempatan kerja atau 100% uang kembali untuk program premium",
    color: "text-indigo-600"
  }
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold">
              Mengapa Memilih{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Ajarka?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Kami menyediakan pengalaman pembelajaran yang komprehensif dengan 
              teknologi terdepan dan pendekatan yang terbukti efektif.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105">
                  <CardContent className="p-8 space-y-4">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">100%</div>
                <div className="text-blue-100">Success Rate</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-blue-100">Support</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold">∞</div>
                <div className="text-blue-100">Lifetime Access</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}