import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import bcrypt from 'bcryptjs'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Find verification record
    const verificationResponse = await axios.get(`${API_BASE_URL}/email_verifications?token=${token}`)
    const verifications = verificationResponse.data
    
    if (verifications.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    const verification = verifications[0]

    // Check if token is expired
    if (new Date() > new Date(verification.expiresAt)) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Check if already verified
    if (verification.verified) {
      return NextResponse.json(
        { error: 'Email has already been verified' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user account
    const newUser = {
      email: verification.email,
      name: verification.name,
      password: hashedPassword,
      role: 'siswa', // Default role
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(verification.name)}&background=0d47a1&color=fff`,
      phone: '',
      provider: 'email',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await axios.post(`${API_BASE_URL}/users`, newUser)

    // Mark verification as completed
    await axios.patch(`${API_BASE_URL}/email_verifications/${verification.id}`, {
      verified: true,
      verifiedAt: new Date().toISOString()
    })

    return NextResponse.json({
      message: 'Email verified successfully. You can now login.',
      user: {
        email: newUser.email,
        name: newUser.name
      }
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find verification record
    const verificationResponse = await axios.get(`${API_BASE_URL}/email_verifications?token=${token}`)
    const verifications = verificationResponse.data
    
    if (verifications.length === 0) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    const verification = verifications[0]

    // Check if token is expired
    if (new Date() > new Date(verification.expiresAt)) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Check if already verified
    if (verification.verified) {
      return NextResponse.json(
        { error: 'Email has already been verified' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: verification.email,
      name: verification.name
    })

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    )
  }
}