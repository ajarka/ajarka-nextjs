# OAuth & Email Verification Setup Guide

This guide will help you set up Google OAuth, GitHub OAuth, and email verification for the Ajarka platform.

## 🔧 Environment Variables Setup

1. Copy the environment template:
```bash
cp .env.local.example .env.local
```

2. Fill in the required environment variables in `.env.local`

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen first
6. Create OAuth 2.0 client ID:
   - Application type: Web application
   - Name: Ajarka Platform
   - Authorized redirect URIs: 
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

7. Copy Client ID and Client Secret to `.env.local`:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🐙 GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: Ajarka Platform
   - Homepage URL: `http://localhost:3000` (development)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

4. Copy Client ID and Client Secret to `.env.local`:
```env
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

## 📧 Gmail Email Verification Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app-specific password for "Mail"
4. Add to `.env.local`:
```env
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_APP_PASSWORD=your-app-specific-password
```

## 🔑 NextAuth Configuration

Add these to `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

Generate a secret key:
```bash
openssl rand -base64 32
```

## ✅ Testing the Setup

### Test OAuth Login:
1. Start the development server: `npm run dev`
2. Go to `/login`
3. Click on Google or GitHub login buttons
4. Complete OAuth flow

### Test Email Verification:
1. Go to `/signup`
2. Fill in the registration form
3. Check your email for verification link
4. Click the verification link
5. Complete password setup
6. Login with the new account

## 🎯 Features Implemented

### OAuth Features:
- ✅ Google OAuth login
- ✅ GitHub OAuth login  
- ✅ Automatic user creation for OAuth users
- ✅ Provider information stored in database
- ✅ Avatar from OAuth provider
- ✅ Email pre-verified for OAuth users

### Email Verification Features:
- ✅ Email verification before account creation
- ✅ Secure token generation (32-byte random)
- ✅ 24-hour token expiration
- ✅ Professional email templates
- ✅ Password setup after email verification
- ✅ Duplicate email prevention
- ✅ Account activation flow

### Security Features:
- ✅ Password hashing with bcrypt
- ✅ JWT session management
- ✅ CSRF protection via NextAuth
- ✅ Secure token validation
- ✅ Email verification required for registration

## 🚀 Production Deployment

### Environment Variables for Production:
```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=production-google-client-id
GOOGLE_CLIENT_SECRET=production-google-secret
GITHUB_ID=production-github-id
GITHUB_SECRET=production-github-secret
GMAIL_USER=your-production-email@gmail.com
GMAIL_APP_PASSWORD=your-production-app-password
```

### OAuth Redirect URIs for Production:
- Google: `https://yourdomain.com/api/auth/callback/google`
- GitHub: `https://yourdomain.com/api/auth/callback/github`

## 🔧 Database Schema

The following collections are used:

### users
```json
{
  "id": "auto-generated",
  "email": "user@example.com",
  "password": "hashed-password",
  "name": "User Name",
  "role": "siswa|mentor|admin",
  "avatar": "avatar-url",
  "phone": "phone-number",
  "provider": "email|google|github",
  "providerId": "oauth-provider-id",
  "emailVerified": true,
  "createdAt": "iso-string",
  "updatedAt": "iso-string"
}
```

### email_verifications
```json
{
  "id": "auto-generated",
  "email": "user@example.com",
  "name": "User Name",
  "token": "verification-token",
  "expiresAt": "iso-string",
  "verified": false,
  "verifiedAt": "iso-string",
  "createdAt": "iso-string"
}
```

## 🛠 Troubleshooting

### Common Issues:

1. **OAuth redirect mismatch**: Ensure callback URLs match exactly
2. **Email not sending**: Check Gmail app password and 2FA enabled
3. **CORS issues**: Ensure NEXTAUTH_URL is correctly set
4. **Token expiration**: Check system time and token expiry logic

### Debug Mode:
Add to `.env.local` for debugging:
```env
NEXTAUTH_DEBUG=1
```

## 📱 Mobile App Integration

The OAuth setup also supports mobile app integration:
- Use deep linking for OAuth callbacks
- Store JWT tokens securely
- Implement biometric authentication

This completes the OAuth and email verification setup for the Ajarka platform!