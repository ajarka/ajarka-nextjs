# Automatic Meeting Link Generation Setup Guide

This guide explains how to set up automatic meeting link generation for Zoom and Google Meet in the Ajarka mentoring platform.

## Features

- ✅ Automatic Zoom meeting generation
- ✅ Automatic Google Meet link generation
- ✅ Meeting type selection (Online/Offline) for mentors
- ✅ Platform selection (Zoom/Google Meet) for online sessions
- ✅ Automatic notifications with meeting links
- ✅ Fallback mechanisms for reliability
- ✅ Professional calendar integration

## Setup Instructions

### 1. Google Meet Setup

#### Option A: Using Google Calendar API (Recommended)

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Calendar API

2. **Setup OAuth Credentials**
   - Go to "Credentials" in Google Cloud Console
   - Create OAuth 2.0 Client IDs
   - Add your domain to authorized origins
   - Add redirect URI: `http://localhost:3000/api/auth/callback/google`

3. **Environment Variables**
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
   ```

4. **Get Refresh Token (Optional but Recommended)**
   - Use Google OAuth playground or implement OAuth flow
   - Store refresh token for persistent access
   ```env
   GOOGLE_REFRESH_TOKEN=your_refresh_token
   ```

#### Option B: Simple Google Meet Links (Fallback)
- No additional setup required
- Generates simple meet.google.com/xxx-xxxx-xxx links
- Works without API credentials

### 2. Zoom Setup

1. **Create Zoom App**
   - Go to [Zoom App Marketplace](https://marketplace.zoom.us/)
   - Create a JWT app (for server-to-server)
   - Or create OAuth app (for user authorization)

2. **Get API Credentials**
   - Copy API Key and API Secret from your app
   - Generate JWT token if using JWT authentication

3. **Environment Variables**
   ```env
   ZOOM_API_KEY=your_zoom_api_key
   ZOOM_API_SECRET=your_zoom_api_secret
   ZOOM_JWT_TOKEN=your_jwt_token
   ```

### 3. Database Schema Updates

Make sure your database includes these fields in the relevant tables:

#### mentor_schedules table:
```sql
ALTER TABLE mentor_schedules ADD COLUMN meetingProvider VARCHAR(20) DEFAULT 'google-meet';
```

#### bookings table:
```sql
ALTER TABLE bookings ADD COLUMN meetingId VARCHAR(255);
ALTER TABLE bookings ADD COLUMN meetingProvider VARCHAR(20);
ALTER TABLE bookings ADD COLUMN meetingPassword VARCHAR(255);
```

### 4. Installation & Dependencies

The required dependencies are already included in package.json:
- `googleapis`: For Google Calendar/Meet integration
- `jsonwebtoken`: For Zoom JWT token generation

## Usage

### For Mentors

1. **Create Schedule**
   - Select "Online" as meeting type
   - Choose between "Zoom" or "Google Meet"
   - System automatically handles link generation

2. **Offline Sessions**
   - Select "Tatap Muka" (Offline)
   - Enter meeting location/address

### For Students

1. **Booking Process**
   - Select mentor and schedule
   - Choose date and time
   - System automatically generates meeting link during booking
   - Meeting details sent via notifications

### For Both

1. **Notifications**
   - Automatic email notifications with meeting links
   - In-app notifications with meeting details
   - Calendar invitations (Google Meet integration)

## API Endpoints

### Generate Meeting Link
```
POST /api/meeting/generate
Content-Type: application/json

{
  "provider": "zoom" | "google-meet",
  "title": "Session Title",
  "description": "Session Description",
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T11:00:00Z",
  "mentorEmail": "mentor@example.com",
  "studentEmail": "student@example.com",
  "duration": 60
}
```

## Error Handling & Fallbacks

1. **Google Meet Fallback**
   - If Calendar API fails, uses simple meet.google.com links
   - No interruption to booking process

2. **Zoom Fallback**
   - Logs error and continues with booking
   - Mentor can manually create meeting link

3. **General Fallback**
   - System continues booking process even if meeting generation fails
   - Users are notified of the issue
   - Manual meeting setup option available

## Testing

1. **Development Testing**
   ```bash
   npm run dev
   ```
   - Create a mentor schedule with online meeting type
   - Book a session as a student
   - Check notifications for meeting links

2. **Production Testing**
   - Test with real Google/Zoom accounts
   - Verify meeting links work correctly
   - Test email notifications

## Troubleshooting

### Google Meet Issues
- Verify API credentials are correct
- Check Calendar API is enabled
- Ensure proper OAuth scopes
- Check refresh token validity

### Zoom Issues
- Verify API credentials
- Check JWT token expiry
- Ensure proper Zoom account permissions
- Test with Zoom API directly

### General Issues
- Check environment variables
- Verify database schema updates
- Check network connectivity
- Review application logs

## Security Considerations

1. **API Keys**
   - Store in environment variables only
   - Never commit to version control
   - Use different keys for development/production

2. **OAuth Tokens**
   - Securely store refresh tokens
   - Implement proper token refresh logic
   - Monitor for unauthorized access

3. **Meeting Links**
   - Consider meeting passwords for Zoom
   - Implement proper access controls
   - Log meeting generation activities

## Support

For issues or questions:
1. Check application logs for errors
2. Verify environment configuration
3. Test API endpoints independently
4. Contact system administrator if needed