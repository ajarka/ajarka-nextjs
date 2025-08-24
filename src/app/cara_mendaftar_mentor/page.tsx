'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  Star,
  ArrowRight,
  BookOpen,
  Award,
  Target,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const steps = [
  {
    number: 1,
    title: 'Daftar Akun',
    description: 'Buat akun Ajarka dan lengkapi profil Anda dengan informasi dasar',
    image: '/assets/img/mendaftarmentor/1.png',
    duration: '5 menit',
    details: [
      'Isi form registrasi dengan data yang valid',
      'Verifikasi email address',
      'Upload foto profil yang profesional',
      'Lengkapi informasi dasar'
    ]
  },
  {
    number: 2,
    title: 'Submit Portfolio',
    description: 'Tunjukkan keahlian Anda melalui portfolio project dan pengalaman kerja',
    image: '/assets/img/mendaftarmentor/2.png',
    duration: '30 menit',
    details: [
      'Upload portfolio project terbaik Anda',
      'Sertakan link GitHub/GitLab',
      'Jelaskan teknologi yang Anda kuasai',
      'Tambahkan sertifikat relevan'
    ]
  },
  {
    number: 3,
    title: 'Interview & Assessment',
    description: 'Tim Ajarka akan mengevaluasi kemampuan teknis dan komunikasi Anda',
    image: '/assets/img/mendaftarmentor/3.png',
    duration: '1-2 jam',
    details: [
      'Technical interview dengan tim Ajarka',
      'Tes kemampuan mengajar',
      'Evaluasi soft skills',
      'Assessment final dari reviewer'
    ]
  },
  {
    number: 4,
    title: 'Mulai Mengajar',
    description: 'Setelah diterima, Anda bisa mulai mengajar dan mendapatkan penghasilan',
    image: '/assets/img/mendaftarmentor/4.png',
    duration: 'Ongoing',
    details: [
      'Setup profile mentor Anda',
      'Tentukan jadwal mengajar',
      'Mulai terima siswa pertama',
      'Dapatkan penghasilan bulanan'
    ]
  }
]

const requirements = [
  {
    category: 'Pengalaman Teknis',
    items: [
      'Minimal 3 tahun pengalaman di bidang teknologi',
      'Menguasai minimal 1 bahasa pemrograman dengan baik',
      'Memiliki portfolio project yang bisa didemonstrasikan',
      'Pernah terlibat dalam pengembangan aplikasi production'
    ]
  },
  {
    category: 'Kemampuan Mengajar',
    items: [
      'Mampu menjelaskan konsep teknis dengan bahasa sederhana',
      'Sabar dalam membimbing siswa dengan berbagai tingkat kemampuan',
      'Memiliki pengalaman mentoring atau teaching (nilai plus)',
      'Komunikasi yang baik dalam bahasa Indonesia'
    ]
  },
  {
    category: 'Komitmen Waktu',
    items: [
      'Tersedia minimal 10 jam per minggu untuk mengajar',
      'Fleksibel dengan jadwal siswa (termasuk malam/weekend)',
      'Komitmen minimal 6 bulan sebagai mentor aktif',
      'Responsif terhadap pertanyaan siswa maksimal 24 jam'
    ]
  }
]

const benefits = [
  {
    icon: DollarSign,
    title: 'Penghasilan Menarik',
    description: 'Dapatkan Rp 10-50 juta per bulan',
    color: 'text-green-600'
  },
  {
    icon: Users,
    title: 'Impact Positif',
    description: 'Bantu kembangkan talent Indonesia',
    color: 'text-blue-600'
  },
  {
    icon: Clock,
    title: 'Jadwal Fleksibel',
    description: 'Atur waktu sesuai ketersediaan',
    color: 'text-purple-600'
  },
  {
    icon: Award,
    title: 'Personal Branding',
    description: 'Tingkatkan reputasi profesional',
    color: 'text-orange-600'
  },
  {
    icon: BookOpen,
    title: 'Continuous Learning',
    description: 'Tetap update dengan teknologi terbaru',
    color: 'text-indigo-600'
  },
  {
    icon: TrendingUp,
    title: 'Career Growth',
    description: 'Peluang menjadi tech leader',
    color: 'text-pink-600'
  }
]

const testimonials = [
  {
    name: 'Ahmad Rizki',
    role: 'Senior Full-Stack Developer',
    company: 'Tokopedia',
    avatar: 'https://ui-avatars.com/api/?name=Ahmad+Rizki&background=3b82f6&color=fff',
    content: 'Menjadi mentor di Ajarka tidak hanya memberikan penghasilan tambahan, tapi juga kepuasan personal saat melihat siswa berhasil mendapat kerja impian mereka.',
    earning: 'Rp 25M/bulan',
    students: 45
  },
  {
    name: 'Sarah Dewi',
    role: 'React Native Developer',
    company: 'Gojek',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Dewi&background=10b981&color=fff',
    content: 'Platform yang sangat profesional dengan sistem yang mudah digunakan. Tim support Ajarka juga sangat helpful dalam membantu mentor.',
    earning: 'Rp 18M/bulan',
    students: 32
  },
  {
    name: 'David Chen',
    role: 'DevOps Engineer',
    company: 'Bukalapak',
    avatar: 'https://ui-avatars.com/api/?name=David+Chen&background=8b5cf6&color=fff',
    content: 'Ajarka memberikan kesempatan bagi saya untuk berbagi ilmu sambil mendapat penghasilan yang layak. Siswa-siswanya juga sangat antusias belajar.',
    earning: 'Rp 22M/bulan',
    students: 38
  }
]

export default function CaraMendaftarMentorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6 mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-full mb-4">
              <Users className="mr-2 h-4 w-4" />
              Bergabung Jadi Mentor
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Cara Menjadi{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                Mentor Ajarka
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Bergabunglah dengan 100+ mentor terbaik Indonesia dan dapatkan penghasilan 
              hingga Rp 50 juta per bulan sambil berbagi ilmu kepada generasi developer masa depan.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                <Link href="/signup">
                  Daftar Jadi Mentor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#requirements">
                  Lihat Persyaratan
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl"
          >
            <Image
              src="/assets/img/mendaftarmentor/hero.png"
              alt="Menjadi Mentor Ajarka"
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            
            {/* Overlay Stats */}
            <div className="absolute bottom-8 left-8 right-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">100+</div>
                  <div className="text-sm text-muted-foreground">Mentor Aktif</div>
                </div>
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">5000+</div>
                  <div className="text-sm text-muted-foreground">Siswa Belajar</div>
                </div>
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">95%</div>
                  <div className="text-sm text-muted-foreground">Job Placement</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              4 Langkah Mudah Menjadi Mentor
            </h2>
            <p className="text-xl text-muted-foreground">
              Proses yang simple dan transparan untuk bergabung dengan tim mentor Ajarka
            </p>
          </motion.div>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {step.number}
                      </div>
                      <Badge variant="outline" className="text-sm">
                        <Clock className="mr-1 h-3 w-3" />
                        {step.duration}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{detail}</span>
                        </li>
                      ))}
                    </ul>

                    {step.number === 4 && (
                      <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                        <Link href="/signup">
                          Mulai Langkah 1
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <div className="relative rounded-2xl overflow-hidden shadow-xl">
                    <Image
                      src={step.image}
                      alt={`Step ${step.number}: ${step.title}`}
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section id="requirements" className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Persyaratan Menjadi Mentor
            </h2>
            <p className="text-xl text-muted-foreground">
              Kami mencari mentor terbaik yang passionate dalam berbagi ilmu
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {requirements.map((requirement, index) => (
              <motion.div
                key={requirement.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="h-6 w-6" />
                      </div>
                      {requirement.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {requirement.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Keuntungan Menjadi Mentor Ajarka
            </h2>
            <p className="text-xl text-muted-foreground">
              Lebih dari sekedar penghasilan tambahan
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 group-hover:scale-110 transition-transform duration-300`}>
                      <benefit.icon className={`h-8 w-8 ${benefit.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Kata Mentor Ajarka
            </h2>
            <p className="text-xl text-muted-foreground">
              Pengalaman nyata dari mentor-mentor berpengalaman
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    
                    <p className="text-muted-foreground italic">
                      "{testimonial.content}"
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-semibold text-sm">{testimonial.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {testimonial.role} at {testimonial.company}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{testimonial.earning}</div>
                        <div className="text-xs text-muted-foreground">Penghasilan</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{testimonial.students}</div>
                        <div className="text-xs text-muted-foreground">Siswa</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container px-4 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-bold">
              Siap Bergabung dengan Tim Mentor Ajarka?
            </h2>
            <p className="text-xl text-green-100 leading-relaxed">
              Mulai perjalanan Anda sebagai mentor dan rasakan kepuasan berbagi ilmu 
              sambil mendapatkan penghasilan yang layak.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-600 hover:bg-green-50" asChild>
                <Link href="/signup">
                  Daftar Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600" asChild>
                <Link href="/hubungi">
                  Punya Pertanyaan?
                </Link>
              </Button>
            </div>

            <div className="pt-8">
              <p className="text-green-100 text-sm">
                💡 <span className="font-medium">Tips:</span> Proses review aplikasi mentor biasanya 3-5 hari kerja. 
                Pastikan portfolio Anda lengkap untuk mempercepat proses approval.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}