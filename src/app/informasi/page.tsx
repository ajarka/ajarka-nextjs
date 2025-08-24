'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  Info,
  HelpCircle,
  BookOpen,
  CreditCard,
  Monitor,
  Clock,
  Users,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Shield,
  Smartphone,
  Wifi,
  Headphones,
  RefreshCw,
  DollarSign,
  Calendar,
  Globe,
  Search,
  Filter,
  ArrowRight,
  Star,
  Zap
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

const faqCategories = [
  {
    id: "general",
    title: "Pertanyaan Umum",
    icon: HelpCircle,
    color: "bg-blue-500"
  },
  {
    id: "courses", 
    title: "Tentang Kursus",
    icon: BookOpen,
    color: "bg-green-500"
  },
  {
    id: "payment",
    title: "Pembayaran & Billing",
    icon: CreditCard,
    color: "bg-purple-500"
  },
  {
    id: "technical",
    title: "Bantuan Teknis",
    icon: Monitor,
    color: "bg-orange-500"
  }
]

const faqData = {
  general: [
    {
      question: "Apa itu Ajarka dan bagaimana cara kerjanya?",
      answer: "Ajarka adalah platform pembelajaran coding online yang menghubungkan siswa dengan mentor berpengalaman. Kami menyediakan kursus terstruktur, mentoring 1-on-1, dan program job guarantee untuk membantu Anda memulai karir di bidang teknologi."
    },
    {
      question: "Apakah cocok untuk pemula yang tidak punya background IT?",
      answer: "Sangat cocok! Kami memiliki program khusus untuk pemula dengan kurikulum yang dimulai dari dasar. Mentor kami berpengalaman mengajar siswa dari berbagai background, termasuk yang tidak memiliki pengalaman IT sebelumnya."
    },
    {
      question: "Berapa lama waktu yang dibutuhkan untuk menyelesaikan program?",
      answer: "Durasi bervariasi tergantung program yang dipilih. Program Frontend: 4-6 bulan, Backend: 5-7 bulan, Full-Stack: 8-12 bulan. Semua dapat disesuaikan dengan kecepatan belajar Anda."
    },
    {
      question: "Apakah ada job guarantee setelah lulus?",
      answer: "Ya! Kami memiliki program job guarantee dengan tingkat penempatan kerja 85%. Jika tidak mendapat pekerjaan dalam 6 bulan setelah lulus (dengan syarat tertentu), kami akan memberikan refund 100%."
    }
  ],
  courses: [
    {
      question: "Apa saja yang dipelajari dalam program Full-Stack Developer?",
      answer: "Program Full-Stack mencakup: Frontend (HTML, CSS, JavaScript, React), Backend (Node.js, Express, databases), DevOps dasar (Git, deployment), soft skills, dan project portfolio yang siap dipresentasikan ke perusahaan."
    },
    {
      question: "Bagaimana sistem mentoring bekerja?",
      answer: "Setiap siswa mendapat mentor personal yang akan membimbing selama program. Mentoring dilakukan melalui video call 1-on-1 mingguan, code review, dan konsultasi karir. Mentor tersedia via chat untuk pertanyaan urgent."
    },
    {
      question: "Apakah ada batasan usia untuk mengikuti program?",
      answer: "Tidak ada batasan usia. Siswa termuda kami berusia 16 tahun dan tertua 45 tahun. Yang penting adalah komitmen untuk belajar dan waktu yang cukup untuk mengikuti program (minimal 10-15 jam per minggu)."
    },
    {
      question: "Bagaimana cara mengakses materi pembelajaran?",
      answer: "Semua materi dapat diakses 24/7 melalui dashboard online. Termasuk video tutorials, live coding sessions, assignments, dan project templates. Akses berlaku selamanya bahkan setelah lulus."
    }
  ],
  payment: [
    {
      question: "Apa saja metode pembayaran yang tersedia?",
      answer: "Kami menerima transfer bank (BCA, Mandiri, BNI, BRI), e-wallet (OVO, GoPay, DANA, ShopeePay), kartu kredit (Visa, MasterCard), dan cicilan 0% untuk program tertentu."
    },
    {
      question: "Apakah ada diskon atau promo khusus?",
      answer: "Ya! Kami rutin memberikan early bird discount (20-30%), student discount (15%), dan referral bonus. Follow social media kami untuk update promo terbaru. Ada juga program beasiswa untuk yang membutuhkan."
    },
    {
      question: "Bagaimana kebijakan refund jika tidak puas?",
      answer: "Kami memberikan garansi 30 hari uang kembali tanpa pertanyaan. Setelah 30 hari, refund dapat dilakukan dengan alasan tertentu dan akan dievaluasi case by case oleh tim support kami."
    },
    {
      question: "Apakah bisa bayar cicilan?",
      answer: "Tentu! Kami bekerja sama dengan Kredivo, Akulaku, dan IndoDana untuk cicilan 0-3%. Cicilan tersedia untuk program dengan harga di atas Rp 1.000.000. Proses approval biasanya dalam 1-2 hari kerja."
    }
  ],
  technical: [
    {
      question: "Apa saja spesifikasi minimum komputer yang dibutuhkan?",
      answer: "Minimum: RAM 4GB, Storage 50GB, OS Windows 10/macOS 10.14/Ubuntu 18.04. Recommended: RAM 8GB, SSD 100GB. Untuk mobile development, diperlukan spec lebih tinggi. Kami menyediakan cloud development environment jika spec tidak memadai."
    },
    {
      question: "Bagaimana jika mengalami masalah teknis saat belajar?",
      answer: "Tim technical support kami siap membantu 24/7 melalui chat, email, atau video call. Response time rata-rata kurang dari 2 jam. Kami juga memiliki knowledge base lengkap untuk troubleshooting mandiri."
    },
    {
      question: "Apakah bisa belajar menggunakan smartphone/tablet?",
      answer: "Untuk teori dan video bisa menggunakan mobile device. Namun untuk coding practice, sangat disarankan menggunakan laptop/PC. Kami menyediakan coding environment berbasis cloud yang bisa diakses dari browser mobile untuk emergency."
    },
    {
      question: "Bagaimana cara mengatur jadwal live session jika berbeda zona waktu?",
      answer: "Live session tersedia dalam 3 jadwal: pagi (09:00 WIB), siang (14:00 WIB), dan malam (19:00 WIB). Semua session direkam dan dapat diakses kembali. Untuk mentoring, jadwal bisa disesuaikan dengan mentor yang sama zona waktunya."
    }
  ]
}

const paymentMethods = [
  {
    category: "Bank Transfer",
    methods: [
      { name: "BCA", fee: "Gratis", processing: "Instant" },
      { name: "Mandiri", fee: "Gratis", processing: "Instant" },
      { name: "BNI", fee: "Gratis", processing: "Instant" },
      { name: "BRI", fee: "Gratis", processing: "Instant" }
    ]
  },
  {
    category: "E-Wallet",
    methods: [
      { name: "OVO", fee: "Gratis", processing: "Instant" },
      { name: "GoPay", fee: "Gratis", processing: "Instant" },
      { name: "DANA", fee: "Gratis", processing: "Instant" },
      { name: "ShopeePay", fee: "Gratis", processing: "Instant" }
    ]
  },
  {
    category: "Kartu Kredit",
    methods: [
      { name: "Visa", fee: "2.9%", processing: "Instant" },
      { name: "MasterCard", fee: "2.9%", processing: "Instant" }
    ]
  },
  {
    category: "Cicilan",
    methods: [
      { name: "Kredivo", fee: "0%", processing: "1-2 hari" },
      { name: "Akulaku", fee: "0-3%", processing: "1-2 hari" },
      { name: "IndoDana", fee: "0%", processing: "1-2 hari" }
    ]
  }
]

const systemRequirements = {
  minimum: {
    title: "Spesifikasi Minimum",
    requirements: [
      { item: "RAM", spec: "4GB" },
      { item: "Storage", spec: "50GB free space" },
      { item: "OS", spec: "Windows 10 / macOS 10.14 / Ubuntu 18.04" },
      { item: "Browser", spec: "Chrome 90+ / Firefox 88+ / Safari 14+" },
      { item: "Internet", spec: "5 Mbps stable connection" }
    ]
  },
  recommended: {
    title: "Spesifikasi Rekomendasi", 
    requirements: [
      { item: "RAM", spec: "8GB atau lebih" },
      { item: "Storage", spec: "100GB SSD" },
      { item: "OS", spec: "Windows 11 / macOS 12+ / Ubuntu 20.04+" },
      { item: "Browser", spec: "Chrome Latest / Firefox Latest" },
      { item: "Internet", spec: "10 Mbps dedicated connection" }
    ]
  }
}

export default function InformasiPage() {
  const [activeCategory, setActiveCategory] = useState("general")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFaqs = faqData[activeCategory as keyof typeof faqData].filter(
    faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="container px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                <span className="animate-pulse mr-2">💡</span>
                Pusat Informasi Ajarka
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Semua Yang Perlu{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Anda Ketahui
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Temukan jawaban lengkap tentang program, pembayaran, persyaratan teknis, 
                dan segala hal yang Anda butuhkan untuk memulai perjalanan coding.
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8"
            >
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border">
                <div className="text-2xl font-bold text-primary mb-1">100+</div>
                <div className="text-sm text-muted-foreground">FAQ Tersedia</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border">
                <div className="text-2xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Support Ready</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border">
                <div className="text-2xl font-bold text-primary mb-1">10+</div>
                <div className="text-sm text-muted-foreground">Payment Methods</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border">
                <div className="text-2xl font-bold text-primary mb-1">{"< 2h"}</div>
                <div className="text-sm text-muted-foreground">Response Time</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="faq" className="space-y-8">
              <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 mx-auto">
                <TabsTrigger value="faq" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">FAQ</span>
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Kursus</span>
                </TabsTrigger>
                <TabsTrigger value="payment" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Pembayaran</span>
                </TabsTrigger>
                <TabsTrigger value="technical" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span className="hidden sm:inline">Teknis</span>
                </TabsTrigger>
              </TabsList>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Jawaban untuk pertanyaan yang paling sering ditanyakan oleh calon siswa
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cari pertanyaan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* FAQ Categories */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                  {faqCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        activeCategory === category.id
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${category.color} text-white`}>
                          <category.icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{category.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {faqData[category.id as keyof typeof faqData].length} pertanyaan
                      </p>
                    </button>
                  ))}
                </div>

                {/* FAQ Content */}
                <Card>
                  <CardContent className="p-6">
                    <Accordion type="single" collapsible className="space-y-4">
                      {filteredFaqs.map((faq, index) => (
                        <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4">
                          <AccordionTrigger className="text-left hover:no-underline">
                            <span className="font-medium">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>

                    {filteredFaqs.length === 0 && (
                      <div className="text-center py-8">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Tidak ada hasil ditemukan</h3>
                        <p className="text-muted-foreground">Coba kata kunci yang berbeda atau pilih kategori lain.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses" className="space-y-8">
                <div className="text-center space-y-4 mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Informasi Program Kursus
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Detail lengkap tentang program pembelajaran dan persyaratan
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Course Requirements */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Persyaratan Umum
                      </CardTitle>
                      <CardDescription>
                        Syarat minimum untuk mengikuti program
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        "Berusia minimal 16 tahun",
                        "Memiliki komputer/laptop dengan spek minimum",
                        "Koneksi internet stabil minimal 5 Mbps",
                        "Komitmen waktu 10-15 jam per minggu",
                        "Motivasi tinggi untuk belajar dan berkarir di tech",
                        "Basic English (untuk membaca dokumentasi)"
                      ].map((req, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{req}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Course Benefits */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-500" />
                        Benefit Program
                      </CardTitle>
                      <CardDescription>
                        Apa yang akan Anda dapatkan
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        "Mentoring personal 1-on-1 dengan expert",
                        "Portfolio project yang industry-ready",
                        "Sertifikat digital yang dapat diverifikasi",
                        "Job preparation & career coaching",
                        "Akses lifetime ke materi pembelajaran",
                        "Komunitas alumni untuk networking"
                      ].map((benefit, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Star className="h-4 w-4 text-blue-500 mt-0.5" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Learning Process */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Proses Pembelajaran
                    </CardTitle>
                    <CardDescription>
                      Bagaimana metode pembelajaran di Ajarka
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-white font-bold">1</span>
                        </div>
                        <h3 className="font-semibold">Self-Paced Learning</h3>
                        <p className="text-sm text-muted-foreground">
                          Belajar video tutorials dan hands-on projects dengan kecepatan Anda sendiri
                        </p>
                      </div>
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-white font-bold">2</span>
                        </div>
                        <h3 className="font-semibold">Weekly Mentoring</h3>
                        <p className="text-sm text-muted-foreground">
                          Sesi 1-on-1 dengan mentor untuk review progress dan troubleshooting
                        </p>
                      </div>
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-white font-bold">3</span>
                        </div>
                        <h3 className="font-semibold">Portfolio Building</h3>
                        <p className="text-sm text-muted-foreground">
                          Bangun portfolio project yang siap dipresentasikan ke perusahaan
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Tab */}
              <TabsContent value="payment" className="space-y-8">
                <div className="text-center space-y-4 mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Metode Pembayaran
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Berbagai pilihan pembayaran yang mudah dan aman
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {paymentMethods.map((category, index) => (
                    <Card key={category.category}>
                      <CardHeader>
                        <CardTitle className="text-lg">{category.category}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {category.methods.map((method, methodIndex) => (
                          <div key={methodIndex} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{method.name}</div>
                              <div className="text-xs text-muted-foreground">{method.processing}</div>
                            </div>
                            <Badge variant={method.fee === "Gratis" ? "default" : "secondary"}>
                              {method.fee}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Payment Policies */}
                <div className="grid lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-500" />
                        Kebijakan Refund
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>30 hari money back guarantee</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Refund 100% jika tidak mendapat kerja</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span>Syarat dan ketentuan berlaku</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-blue-500" />
                        Diskon & Promo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-blue-500" />
                        <span>Early bird discount hingga 30%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>Referral bonus Rp 500.000</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-500" />
                        <span>Student discount 15%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-purple-500" />
                        Cicilan 0%
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-500" />
                        <span>Tersedia untuk program {">"} Rp 1 juta</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span>Tenor 3, 6, 12 bulan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span>Approval 1-2 hari kerja</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Technical Tab */}
              <TabsContent value="technical" className="space-y-8">
                <div className="text-center space-y-4 mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Persyaratan Teknis
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Spesifikasi sistem dan dukungan teknis yang tersedia
                  </p>
                </div>

                {/* System Requirements */}
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                  {Object.entries(systemRequirements).map(([key, data]) => (
                    <Card key={key}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Monitor className="h-5 w-5" />
                          {data.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {data.requirements.map((req, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="font-medium">{req.item}</span>
                            <Badge variant={key === 'minimum' ? 'secondary' : 'default'}>
                              {req.spec}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Support Options */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Headphones className="h-5 w-5 text-green-500" />
                        Live Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span>24/7 Chat Support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-green-500" />
                        <span>Video Call Troubleshooting</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-green-500" />
                        <span>Response {"< 2"} jam</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-500" />
                        Cloud Environment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-blue-500" />
                        <span>Browser-based IDE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-blue-500" />
                        <span>No installation required</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span>Auto backup & sync</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-purple-500" />
                        Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-purple-500" />
                        <span>Setup guides & tutorials</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        <span>Community forum</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-purple-500" />
                        <span>Regular updates</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-5xl font-bold">
                Masih Ada Pertanyaan?
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
                Tim support kami siap membantu Anda 24/7. Jangan ragu untuk menghubungi kami 
                melalui berbagai channel yang tersedia.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
                  <Link href="/hubungi">
                    <Headphones className="mr-2 h-5 w-5" />
                    Hubungi Support
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/roadmap">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Lihat Program
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}