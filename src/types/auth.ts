import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'admin' | 'mentor' | 'siswa'
      avatar: string
      phone: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: 'admin' | 'mentor' | 'siswa'
    avatar: string
    phone: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: 'admin' | 'mentor' | 'siswa'
    avatar: string
    phone: string
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