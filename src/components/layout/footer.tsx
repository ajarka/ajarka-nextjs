import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/assets/logo.png"
                alt="Ajarka Logo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="font-bold text-xl">Ajarka</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Platform pembelajaran coding terpercaya untuk mengembangkan skill programming Anda.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold">Navigasi</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-muted-foreground hover:text-foreground">
                Beranda
              </Link>
              <Link href="/tentang" className="block text-sm text-muted-foreground hover:text-foreground">
                Tentang
              </Link>
              <Link href="/roadmap" className="block text-sm text-muted-foreground hover:text-foreground">
                Roadmap
              </Link>
              <Link href="/informasi" className="block text-sm text-muted-foreground hover:text-foreground">
                Informasi
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Layanan</h3>
            <div className="space-y-2">
              <Link href="/login" className="block text-sm text-muted-foreground hover:text-foreground">
                Masuk
              </Link>
              <Link href="/signup" className="block text-sm text-muted-foreground hover:text-foreground">
                Daftar
              </Link>
              <Link href="/cara_mendaftar_mentor" className="block text-sm text-muted-foreground hover:text-foreground">
                Jadi Mentor
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Kontak</h3>
            <div className="space-y-2">
              <Link href="/hubungi" className="block text-sm text-muted-foreground hover:text-foreground">
                Hubungi Kami
              </Link>
              <p className="text-sm text-muted-foreground">
                Email: info@ajarka.com
              </p>
              <p className="text-sm text-muted-foreground">
                WhatsApp: +62 812-3456-7890
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Ajarka. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Kebijakan Privasi
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}