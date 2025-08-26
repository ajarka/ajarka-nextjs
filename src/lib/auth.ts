import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find user in json-server
          const response = await axios.get(`${API_BASE_URL}/users?email=${credentials.email}`)
          const users = response.data
          
          if (users.length === 0) {
            return null
          }

          const user = users[0]
          
          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          // Check if user exists in our database
          const response = await axios.get(`${API_BASE_URL}/users?email=${user.email}`)
          const users = response.data
          
          if (users.length === 0) {
            // Create new user from OAuth
            const newUser = {
              email: user.email,
              name: user.name,
              avatar: user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0d47a1&color=fff`,
              role: 'siswa', // Default role
              phone: '',
              provider: account.provider,
              providerId: account.providerAccountId,
              emailVerified: true, // OAuth accounts are pre-verified
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            
            await axios.post(`${API_BASE_URL}/users`, newUser)
          }
          return true
        } catch (error) {
          console.error('OAuth sign in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        try {
          // Fetch user data from our database
          const response = await axios.get(`${API_BASE_URL}/users?email=${user.email}`)
          const users = response.data
          
          if (users.length > 0) {
            const dbUser = users[0]
            token.role = dbUser.role
            token.avatar = dbUser.avatar
            token.phone = dbUser.phone
            token.provider = dbUser.provider
            token.emailVerified = dbUser.emailVerified
          }
        } catch (error) {
          console.error('JWT callback error:', error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.avatar = token.avatar as string
        session.user.phone = token.phone as string
        session.user.provider = token.provider as string
        session.user.emailVerified = token.emailVerified as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
}