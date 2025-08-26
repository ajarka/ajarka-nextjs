'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, Github } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Email atau password salah')
        setIsLoading(false)
        return
      }

      // Get updated session to determine redirect
      const session = await getSession()
      if (session?.user?.role) {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setOauthLoading(provider)
    setError('')
    
    try {
      await signIn(provider, { 
        callbackUrl: '/dashboard',
        redirect: true
      })
    } catch (error) {
      setError('Terjadi kesalahan saat login dengan ' + provider)
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center"
            >
              <span className="text-white font-bold text-xl">A</span>
            </motion.div>
            <CardTitle className="text-2xl font-bold">Masuk ke Akun Anda</CardTitle>
            <CardDescription>
              Masukkan email dan password untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-red-600 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sedang masuk...
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>

            {/* OAuth Divider */}
            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Atau lanjutkan dengan
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn('google')}
                disabled={oauthLoading !== null || isLoading}
                className="h-12"
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FcGoogle className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn('github')}
                disabled={oauthLoading !== null || isLoading}
                className="h-12"
              >
                {oauthLoading === 'github' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                GitHub
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Lupa password?
                </Link>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Belum punya akun?{' '}
                <Link 
                  href="/signup" 
                  className="text-primary hover:underline font-medium"
                >
                  Daftar sekarang
                </Link>
              </div>
            </div>

            {/* Demo Accounts */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-3">Demo Accounts:</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <strong>Admin:</strong> admin@ajarka.com | password
                </div>
                <div>
                  <strong>Mentor:</strong> mentor@ajarka.com | password
                </div>
                <div>
                  <strong>Siswa:</strong> siswa@ajarka.com | password
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}