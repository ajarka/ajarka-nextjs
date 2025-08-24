'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  ExternalLink,
  Users,
  HelpCircle,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const contactMethods = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'Respon cepat dalam 5 menit',
    contact: '+62 812-3456-7890',
    action: 'Chat Sekarang',
    link: 'https://wa.me/6281234567890',
    color: 'bg-green-500',
    availability: '24/7'
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Untuk pertanyaan detail',
    contact: 'support@ajarka.com',
    action: 'Kirim Email',
    link: 'mailto:support@ajarka.com',
    color: 'bg-blue-500',
    availability: '24 jam response'
  },
  {
    icon: Phone,
    title: 'Telepon',
    description: 'Konsultasi langsung',
    contact: '+62 21-2345-6789',
    action: 'Telepon',
    link: 'tel:+622123456789',
    color: 'bg-purple-500',
    availability: '09:00 - 18:00 WIB'
  }
]

const faqItems = [
  {
    question: 'Bagaimana cara mendaftar sebagai siswa?',
    answer: 'Anda bisa mendaftar dengan mengklik tombol "Daftar" di pojok kanan atas, kemudian pilih "Siswa" dan lengkapi form registrasi.'
  },
  {
    question: 'Apakah ada trial gratis?',
    answer: 'Ya! Kami menyediakan 1 sesi gratis untuk setiap siswa baru. Anda bisa mencoba kualitas mengajar mentor kami sebelum berkomitmen.'
  },
  {
    question: 'Bagaimana sistem pembayaran?',
    answer: 'Kami menerima pembayaran via transfer bank, e-wallet (OVO, GoPay, Dana), dan kartu kredit. Ada opsi cicilan 0% untuk kursus tertentu.'
  },
  {
    question: 'Apakah mendapat sertifikat?',
    answer: 'Ya! Setiap siswa yang menyelesaikan kursus akan mendapat sertifikat digital yang bisa dishare di LinkedIn dan CV.'
  }
]

const officeInfo = {
  address: 'Jl. Sudirman No. 123, Jakarta Selatan 12190',
  phone: '+62 21-2345-6789',
  email: 'hello@ajarka.com',
  hours: {
    weekdays: '09:00 - 18:00 WIB',
    weekends: '10:00 - 16:00 WIB'
  }
}

export default function HubungiPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Save to JSON server
      const response = await fetch('http://localhost:3001/contact_messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'new',
          createdAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        setIsSuccess(true)
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSuccess(false)
          setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
            category: ''
          })
        }, 3000)
      } else {
        throw new Error('Failed to submit')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      // Still show success for demo purposes
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          category: ''
        })
      }, 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6 mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full mb-4">
              <MessageCircle className="mr-2 h-4 w-4" />
              Hubungi Kami
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Butuh Bantuan?{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                Kami Siap Membantu
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Tim support Ajarka siap membantu Anda 24/7. Hubungi kami melalui berbagai channel 
              komunikasi atau kunjungi kantor kami untuk konsultasi langsung.
            </p>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl mb-20"
          >
            <Image
              src="/assets/hubungikami.png"
              alt="Hubungi Kami - Ajarka Support"
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
                  <div className="text-2xl font-bold text-blue-600">{"< 5 min"}</div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">24/7</div>
                  <div className="text-sm text-muted-foreground">Support Available</div>
                </div>
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
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
              Pilih Cara Komunikasi Favorit Anda
            </h2>
            <p className="text-xl text-muted-foreground">
              Kami menyediakan berbagai channel komunikasi untuk kemudahan Anda
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className={`inline-flex p-4 rounded-xl ${method.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                      <method.icon className="h-8 w-8" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{method.title}</h3>
                      <p className="text-muted-foreground">{method.description}</p>
                      <p className="font-medium text-lg">{method.contact}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {method.availability}
                      </div>
                      
                      <Button 
                        className="w-full group" 
                        asChild
                      >
                        <Link href={method.link} target="_blank" rel="noopener noreferrer">
                          {method.action}
                          <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Office Info */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Kirim Pesan</CardTitle>
                  <p className="text-muted-foreground">
                    Isi form di bawah ini dan kami akan merespon dalam 24 jam
                  </p>
                </CardHeader>
                <CardContent>
                  {isSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8 space-y-4"
                    >
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                      <h3 className="text-xl font-semibold text-green-600">Pesan Terkirim!</h3>
                      <p className="text-muted-foreground">
                        Terima kasih! Tim kami akan segera menghubungi Anda.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nama Lengkap</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Nomor WhatsApp</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+62 812-3456-7890"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Kategori</Label>
                          <Select onValueChange={(value) => handleInputChange('category', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">Pertanyaan Umum</SelectItem>
                              <SelectItem value="technical">Technical Support</SelectItem>
                              <SelectItem value="billing">Pembayaran & Billing</SelectItem>
                              <SelectItem value="partnership">Kerjasama</SelectItem>
                              <SelectItem value="feedback">Feedback & Saran</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subjek</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          placeholder="Subjek pesan Anda"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Pesan</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          placeholder="Tuliskan pesan Anda di sini..."
                          rows={5}
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Kirim Pesan
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Office Info & FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Office Info */}
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Kantor Pusat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Alamat</p>
                      <p className="text-muted-foreground">{officeInfo.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Telepon</p>
                      <p className="text-muted-foreground">{officeInfo.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">{officeInfo.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Jam Operasional</p>
                      <p className="text-muted-foreground">Senin - Jumat: {officeInfo.hours.weekdays}</p>
                      <p className="text-muted-foreground">Sabtu - Minggu: {officeInfo.hours.weekends}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Quick */}
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    FAQ Cepat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-medium text-sm">{item.question}</h4>
                      <p className="text-muted-foreground text-sm">{item.answer}</p>
                      {index < faqItems.length - 1 && <hr className="my-4" />}
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/faq">
                      Lihat FAQ Lengkap
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container px-4 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-bold">
              Masih Ragu? Coba Konsultasi Gratis!
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Jadwalkan sesi konsultasi gratis dengan tim kami untuk mendiskusikan 
              kebutuhan pembelajaran atau pertanyaan lainnya.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
                <Link href="https://wa.me/6281234567890" target="_blank">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Konsultasi Gratis
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/roadmap">
                  <Zap className="mr-2 h-5 w-5" />
                  Lihat Program
                </Link>
              </Button>
            </div>

            <div className="pt-8">
              <p className="text-blue-100 text-sm">
                💡 <span className="font-medium">Tips:</span> Tim support kami paling aktif di WhatsApp. 
                Untuk respon tercepat, gunakan WhatsApp dan sertakan detail pertanyaan Anda.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}