import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'admin' | 'mentor' | 'siswa'
      avatar: string
      phone: string
      provider?: string
      emailVerified?: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: 'admin' | 'mentor' | 'siswa'
    avatar: string
    phone: string
    provider?: string
    emailVerified?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: 'admin' | 'mentor' | 'siswa'
    avatar: string
    phone: string
    provider?: string
    emailVerified?: boolean
  }
}

export type UserRole = 'admin' | 'mentor' | 'siswa'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar: string
  phone: string
}