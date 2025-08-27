'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { motion } from "framer-motion"

const testimonials = [
  {
    name: "Budi Santoso",
    role: "Frontend Developer di Tokopedia",
    avatar: "https://ui-avatars.com/api/?name=Budi+Santoso&background=3b82f6&color=fff",
    rating: 5,
    content: "Ajarka benar-benar mengubah karier saya! Dari yang tidak tahu apa-apa tentang programming, sekarang saya bekerja sebagai Frontend Developer di perusahaan unicorn. Mentor-mentornya sangat sabar dan berpengalaman.",
    course: "Full-Stack Web Development"
  },
  {
    name: "Sari Dewi",
    role: "UI/UX Designer di Gojek",
    avatar: "https://ui-avatars.com/api/?name=Sari+Dewi&background=10b981&color=fff",
    rating: 5,
    content: "Program mentoring di Ajarka sangat terstruktur dan praktis. Saya belajar tidak hanya teori tapi juga langsung praktek dengan project real. Sekarang saya confident untuk handle project besar di perusahaan.",
    course: "UI/UX Design Masterclass"
  },
  {
    name: "Ahmad Rizki",
    role: "Backend Developer di Bukalapak",
    avatar: "https://ui-avatars.com/api/?name=Ahmad+Rizki&background=8b5cf6&color=fff",
    rating: 5,
    content: "Yang saya suka dari Ajarka adalah mentor-mentornya adalah praktisi industri yang masih aktif bekerja. Jadi ilmu yang diajarkan benar-benar up-to-date dan sesuai kebutuhan industri saat ini.",
    course: "Backend Development with Node.js"
  },
  {
    name: "Linda Permata",
    role: "Mobile Developer di Traveloka",
    avatar: "https://ui-avatars.com/api/?name=Linda+Permata&background=f59e0b&color=fff",
    rating: 5,
    content: "Setelah lulus dari bootcamp Ajarka, saya langsung dapat kerja dalam waktu 2 minggu. Tim HR perusahaan bahkan memuji portfolio yang saya buat selama belajar di sini. Recommended banget!",
    course: "React Native Mobile Development"
  },
  {
    name: "Eko Prasetyo",
    role: "DevOps Engineer di OVO",
    avatar: "https://ui-avatars.com/api/?name=Eko+Prasetyo&background=ef4444&color=fff",
    rating: 5,
    content: "Ajarka tidak hanya mengajarkan coding, tapi juga soft skills yang dibutuhkan di dunia kerja. Career coaching yang diberikan sangat membantu saya dalam interview dan mendapatkan pekerjaan impian.",
    course: "DevOps & Cloud Infrastructure"
  },
  {
    name: "Rina Maharani",
    role: "Data Scientist di Grab",
    avatar: "https://ui-avatars.com/api/?name=Rina+Maharani&background=ec4899&color=fff",
    rating: 5,
    content: "Kualitas pembelajaran di Ajarka benar-benar premium. Materi always updated, mentor responsif, dan community-nya solid. Investasi terbaik untuk masa depan karier saya di tech industry.",
    course: "Data Science & Machine Learning"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold">
              Apa Kata{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Alumni Kami?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Dengarkan testimoni dari ribuan alumni yang telah berhasil mengembangkan 
              karier mereka di perusahaan-perusahaan top Indonesia.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105">
                  <CardContent className="p-6 space-y-4">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-muted-foreground leading-relaxed italic">
                      "{testimonial.content}"
                    </p>

                    {/* Course */}
                    <div className="text-sm text-primary font-medium">
                      {testimonial.course}
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">95%</div>
                <div className="text-muted-foreground">Job Placement Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
                <div className="text-muted-foreground">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">5000+</div>
                <div className="text-muted-foreground">Happy Graduates</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">Partner Companies</div>
              </div>
            </div>
          </motion.div>

          {/* Company Logos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-muted-foreground">
                Alumni kami bekerja di
              </h3>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {['Tokopedia', 'Gojek', 'Grab', 'Traveloka', 'Bukalapak', 'OVO', 'Shopee', 'Blibli'].map((company) => (
                <div key={company} className="text-lg font-semibold">
                  {company}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}