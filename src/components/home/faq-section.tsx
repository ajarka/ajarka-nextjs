'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: "Apakah saya perlu memiliki background IT untuk belajar di Ajarka?",
    answer: "Tidak sama sekali! Kami menerima siswa dari berbagai latar belakang. Program kami dirancang mulai dari level dasar, sehingga siapa pun bisa belajar dari nol. Yang terpenting adalah kemauan dan konsistensi untuk belajar."
  },
  {
    question: "Berapa lama waktu yang dibutuhkan untuk menyelesaikan program?",
    answer: "Waktu belajar bervariasi tergantung program yang dipilih dan intensitas belajar Anda. Untuk program Full-Stack Development biasanya 4-6 bulan, sedangkan program spesifik seperti Frontend atau Backend sekitar 3-4 bulan. Kami juga menyediakan fleksibilitas jadwal sesuai kebutuhan Anda."
  },
  {
    question: "Apakah ada jaminan kerja setelah lulus?",
    answer: "Ya! Kami memiliki program Job Guarantee untuk paket premium. Jika dalam 6 bulan setelah lulus Anda belum mendapat pekerjaan, kami akan mengembalikan 100% uang Anda. Kami juga memiliki partnership dengan 50+ perusahaan untuk penempatan kerja."
  },
  {
    question: "Bagaimana sistem pembelajaran di Ajarka?",
    answer: "Kami menggunakan pendekatan blended learning: video pembelajaran, live session dengan mentor, praktik project, dan mentoring 1-on-1. Anda juga akan bergabung dengan komunitas alumni yang terus saling support dalam pengembangan karier."
  },
  {
    question: "Apakah bisa belajar sambil bekerja?",
    answer: "Tentu saja! Mayoritas siswa kami adalah working professional. Jadwal belajar sangat fleksibel - Anda bisa akses materi 24/7, dan sesi mentoring bisa dijadwalkan di malam hari atau weekend sesuai ketersediaan Anda."
  },
  {
    question: "Apa saja persyaratan untuk menjadi mentor di Ajarka?",
    answer: "Untuk menjadi mentor, Anda harus memiliki minimal 3 tahun pengalaman di industri tech, portfolio project yang strong, dan kemampuan mengajar yang baik. Kami akan melakukan interview dan test untuk memastikan kualitas mentor."
  },
  {
    question: "Apakah ada program cicilan atau beasiswa?",
    answer: "Ya! Kami menyediakan program cicilan 0% untuk semua kursus, dan beasiswa hingga 50% untuk siswa berprestasi atau yang berasal dari keluarga kurang mampu. Hubungi tim kami untuk informasi lebih detail tentang program bantuan finansial."
  },
  {
    question: "Bagaimana cara mendaftar dan memulai belajar?",
    answer: "Prosesnya sangat mudah: 1) Daftar akun di website kami, 2) Pilih program yang sesuai, 3) Lakukan pembayaran, 4) Ikuti orientation session, 5) Mulai belajar! Tim support kami akan memandu Anda di setiap langkah."
  }
]

export function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold">
              Pertanyaan yang{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Sering Ditanyakan
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Temukan jawaban untuk pertanyaan-pertanyaan umum tentang program pembelajaran di Ajarka.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-6 text-left hover:bg-muted/50 transition-colors duration-300 focus:outline-none focus:bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold pr-4">
                        {faq.question}
                      </h3>
                      <motion.div
                        animate={{ rotate: activeIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      </motion.div>
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {activeIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-0">
                          <div className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
            <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4">
                Masih ada pertanyaan lain?
              </h3>
              <p className="text-muted-foreground mb-6">
                Tim support kami siap membantu Anda 24/7. Jangan ragu untuk menghubungi kami!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://wa.me/6281234567890" 
                  className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Chat WhatsApp
                </a>
                <a 
                  href="mailto:support@ajarka.com"
                  className="inline-flex items-center px-6 py-3 border border-border bg-background hover:bg-muted text-foreground font-medium rounded-lg transition-colors"
                >
                  ✉️ Email Support
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}