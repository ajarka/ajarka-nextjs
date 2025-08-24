'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  Eye, 
  Heart, 
  Users, 
  BookOpen, 
  Award, 
  Globe, 
  Lightbulb,
  TrendingUp,
  Shield,
  Star,
  CheckCircle,
  ArrowRight,
  Quote,
  Calendar,
  MapPin
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

const companyValues = [
  {
    icon: Target,
    title: "Excellence",
    description: "Kami berkomitmen memberikan pendidikan berkualitas tinggi dengan standar internasional.",
    color: "bg-blue-500"
  },
  {
    icon: Heart,
    title: "Empathy", 
    description: "Memahami kebutuhan setiap siswa dan memberikan dukungan personal dalam pembelajaran.",
    color: "bg-red-500"
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Selalu mengadaptasi teknologi terbaru dan metode pembelajaran yang efektif.",
    color: "bg-yellow-500"
  },
  {
    icon: Shield,
    title: "Integrity",
    description: "Transparansi, kejujuran, dan etika yang tinggi dalam setiap aspek bisnis kami.",
    color: "bg-green-500"
  }
]

const teamMembers = [
  {
    name: "Budi Santoso",
    position: "Chief Executive Officer",
    bio: "15+ tahun pengalaman di industri teknologi dan pendidikan. Alumni Stanford University.",
    avatar: "https://ui-avatars.com/api/?name=Budi+Santoso&background=1e40af&color=fff&size=200",
    skills: ["Leadership", "Strategy", "Business Development"]
  },
  {
    name: "Sari Wijayanti", 
    position: "Chief Technology Officer",
    bio: "Expert dalam pengembangan platform pembelajaran digital. Former Google Engineer.",
    avatar: "https://ui-avatars.com/api/?name=Sari+Wijayanti&background=dc2626&color=fff&size=200",
    skills: ["Full-Stack Development", "System Architecture", "AI/ML"]
  },
  {
    name: "Ahmad Rahman",
    position: "Head of Education",
    bio: "Spesialis kurikulum teknologi dengan background mengajar di universitas ternama.",
    avatar: "https://ui-avatars.com/api/?name=Ahmad+Rahman&background=059669&color=fff&size=200", 
    skills: ["Curriculum Design", "Educational Technology", "Mentoring"]
  },
  {
    name: "Lisa Kusuma",
    position: "Head of Marketing",
    bio: "Marketing strategist dengan track record membangun brand tech startup sukses.",
    avatar: "https://ui-avatars.com/api/?name=Lisa+Kusuma&background=7c3aed&color=fff&size=200",
    skills: ["Digital Marketing", "Brand Strategy", "Community Building"]
  }
]

const companyStats = [
  { number: "10,000+", label: "Siswa Aktif", icon: Users },
  { number: "150+", label: "Mentor Expert", icon: Award },
  { number: "25+", label: "Program Kursus", icon: BookOpen },
  { number: "98%", label: "Tingkat Kepuasan", icon: Star },
  { number: "85%", label: "Job Placement Rate", icon: TrendingUp },
  { number: "50+", label: "Partner Perusahaan", icon: Globe }
]

const milestones = [
  {
    year: "2020",
    title: "Founding Ajarka",
    description: "Didirikan dengan visi demokratisasi pendidikan teknologi di Indonesia",
    achievement: "3 co-founder, 5 mentor pertama"
  },
  {
    year: "2021", 
    title: "Platform Launch",
    description: "Launching platform pembelajaran online pertama dengan 10 kursus perdana",
    achievement: "1,000 siswa pertama, 15 mentor"
  },
  {
    year: "2022",
    title: "Series A Funding",
    description: "Mendapat investasi Series A untuk ekspansi dan pengembangan teknologi",
    achievement: "50+ mentor, 5,000 siswa"
  },
  {
    year: "2023",
    title: "Partnership & Expansion", 
    description: "Kerjasama dengan 25+ perusahaan teknologi untuk program job guarantee",
    achievement: "100+ mentor, 8,000 siswa"
  },
  {
    year: "2024",
    title: "Market Leadership",
    description: "Menjadi platform pembelajaran coding #1 di Indonesia dengan inovasi AI",
    achievement: "150+ mentor, 10,000+ siswa"
  }
]

export default function TentangPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
                  <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    <span className="animate-pulse mr-2">🚀</span>
                    Tentang Ajarka
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    Membangun{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                      Masa Depan Digital
                    </span>{" "}
                    Indonesia
                  </h1>
                  
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                    Ajarka lahir dari visi untuk mendemokratisasi pendidikan teknologi di Indonesia. 
                    Kami percaya setiap orang berhak mendapat akses ke pendidikan berkualitas 
                    yang dapat mengubah hidup mereka.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="group">
                    <Link href="/roadmap">
                      Jelajahi Program Kami
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/hubungi">
                      Hubungi Kami
                    </Link>
                  </Button>
                </div>
              </motion.div>

              {/* Right Content - Hero Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/assets/ImgHero2.png"
                    alt="Tentang Ajarka - About Us"
                    width={600}
                    height={400} 
                    className="w-full h-auto object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  
                  {/* Overlay Stats */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">5+</div>
                          <div className="text-xs text-muted-foreground">Years Experience</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">10K+</div>
                          <div className="text-xs text-muted-foreground">Students Graduated</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">150+</div>
                          <div className="text-xs text-muted-foreground">Expert Mentors</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Visi & Misi Kami
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Komitmen kami untuk menciptakan ekosistem pembelajaran teknologi terbaik
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-500 rounded-lg">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl">Visi</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      "Menjadi platform pembelajaran teknologi terdepan di Asia Tenggara 
                      yang menghasilkan talenta digital berkualitas world-class."
                    </p>
                    <div className="space-y-3">
                      {[
                        "Memimpin transformasi digital Indonesia",
                        "Menciptakan 1 juta programmer Indonesia",
                        "Menjadi jembatan antara talenta dan industri"
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-500 rounded-lg">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl">Misi</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      "Memberikan akses pendidikan teknologi berkualitas tinggi yang affordable, 
                      practical, dan job-ready untuk semua kalangan."
                    </p>
                    <div className="space-y-3">
                      {[
                        "Kurikulum yang selalu update dengan industri",
                        "Mentoring personal dari praktisi berpengalaman",
                        "Job guarantee program dengan partner terpercaya"
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nilai-Nilai Perusahaan
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Prinsip fundamental yang memandu setiap keputusan dan tindakan kami
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {companyValues.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105">
                    <CardContent className="p-8 text-center space-y-6">
                      <div className={`inline-flex p-4 rounded-xl ${value.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                        <value.icon className="h-8 w-8" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{value.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Company Statistics */}
      <section className="py-20">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pencapaian Kami
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Angka-angka yang menunjukkan komitmen kami terhadap kualitas pendidikan
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {companyStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center space-y-3"
                >
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tim Leadership
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Para pemimpin berpengalaman yang membawa Ajarka menuju visi masa depan
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="relative">
                        <Image
                          src={member.avatar}
                          alt={member.name}
                          width={120}
                          height={120}
                          className="w-24 h-24 rounded-full mx-auto object-cover"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{member.name}</h3>
                        <p className="text-primary font-medium text-sm">{member.position}</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {member.bio}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-center">
                        {member.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Company History Timeline */}
      <section className="py-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Perjalanan Kami
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Timeline perkembangan Ajarka dari startup hingga menjadi leader di industri edtech
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20" />
              
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.year}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative flex items-start gap-6"
                  >
                    {/* Timeline dot */}
                    <div className="relative">
                      <div className="w-4 h-4 bg-primary rounded-full border-4 border-white shadow-md" />
                    </div>

                    <Card className="flex-1 border-none shadow-lg">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="secondary" className="font-mono">
                            {milestone.year}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{milestone.title}</CardTitle>
                        <CardDescription>{milestone.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span>{milestone.achievement}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
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
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold">
                  Bergabunglah dengan Keluarga Ajarka
                </h2>
                <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
                  Jadilah bagian dari komunitas developer terbesar di Indonesia. 
                  Mulai perjalanan karir teknologi Anda hari ini!
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
                  <Link href="/roadmap">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Lihat Program Belajar
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/cara_mendaftar_mentor">
                    <Users className="mr-2 h-5 w-5" />
                    Jadi Mentor
                  </Link>
                </Button>
              </div>

              <div className="pt-8 border-t border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Jakarta, Indonesia</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Founded in 2020</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">Serving Southeast Asia</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}