import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Email configuration (using Gmail for development)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
  }
})

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUserResponse = await axios.get(`${API_BASE_URL}/users?email=${email}`)
    const existingUsers = existingUserResponse.data
    
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store verification token
    const verificationData = {
      email,
      name,
      token: verificationToken,
      expiresAt: tokenExpiry.toISOString(),
      verified: false,
      createdAt: new Date().toISOString()
    }

    await axios.post(`${API_BASE_URL}/email_verifications`, verificationData)

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Verifikasi Email - Ajarka Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">Ajarka</h1>
            <p style="color: #6b7280; font-size: 16px;">Platform Pembelajaran Coding Terpercaya</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Halo ${name}!</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Terima kasih telah mendaftar di Ajarka! Untuk melengkapi proses registrasi, 
              silakan verifikasi email Anda dengan mengklik tombol di bawah ini.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #1e40af; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold; 
                        display: inline-block;">
                Verifikasi Email
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Link verifikasi akan kedaluwarsa dalam 24 jam. Jika Anda tidak dapat mengklik tombol, 
              copy dan paste URL berikut ke browser Anda:
            </p>
            <p style="color: #1e40af; font-size: 14px; word-break: break-all;">
              ${verificationUrl}
            </p>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 14px;">
            <p>Jika Anda tidak mendaftar di Ajarka, abaikan email ini.</p>
            <p>© 2024 Ajarka Platform. All rights reserved.</p>
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      message: 'Verification email sent successfully',
      email
    })

  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    )
  }
}