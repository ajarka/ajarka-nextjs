import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'

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
          console.log('🔍 Attempting to authenticate user:', credentials.email)

          // Call Convex HTTP endpoint for authentication
          const response = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          })

          console.log('📡 HTTP response status:', response.status)

          if (!response.ok) {
            const errorData = await response.json()
            console.log('❌ HTTP error:', errorData)
            return null
          }

          const { user } = await response.json()

          console.log('👤 User found:', user ? 'Yes' : 'No')

          if (!user) {
            console.log('❌ User not found in database')
            return null
          }

          console.log('🔑 Verifying password...')
          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password || '')

          console.log('✅ Password valid:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('❌ Invalid password')
            return null
          }

          console.log('🎉 Authentication successful for role:', user.role)

          return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone
          }
        } catch (error) {
          console.error('❌ Auth error:', error)
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
          // Check if user exists via HTTP endpoint
          const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email!,
              password: '' // Empty password for OAuth check
            })
          })

          const checkData = await checkResponse.json()

          if (!checkData.user) {
            // User doesn't exist, we would need to create via HTTP endpoint
            // For now, let's just allow the sign in and handle user creation elsewhere
            console.log('OAuth user not found in database, allowing sign in')
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
          // Fetch user data via HTTP endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email!,
              password: '' // Empty password for data fetch
            })
          })

          if (response.ok) {
            const { user: dbUser } = await response.json()
            if (dbUser) {
              token.role = dbUser.role
              token.avatar = dbUser.avatar
              token.phone = dbUser.phone
              token.provider = dbUser.provider
              token.emailVerified = dbUser.emailVerified
            }
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