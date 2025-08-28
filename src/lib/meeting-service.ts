import { google } from 'googleapis'

export interface MeetingDetails {
  title: string
  description: string
  startTime: string
  endTime: string
  mentorEmail: string
  studentEmail: string
  duration: number
}

export interface GeneratedMeeting {
  meetingId: string
  meetingLink: string
  joinUrl: string
  password?: string
  provider: 'zoom' | 'google-meet'
}

class MeetingService {
  private googleAuth: any
  
  constructor() {
    this.initializeGoogleAuth()
  }

  private initializeGoogleAuth() {
    const credentials = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI
    }

    this.googleAuth = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uri
    )

    // Set the refresh token if available
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      this.googleAuth.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      })
    }
  }

  async generateGoogleMeetLink(details: MeetingDetails): Promise<GeneratedMeeting> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.googleAuth })

      const event = {
        summary: details.title,
        description: details.description,
        start: {
          dateTime: details.startTime,
          timeZone: 'Asia/Jakarta',
        },
        end: {
          dateTime: details.endTime,
          timeZone: 'Asia/Jakarta',
        },
        attendees: [
          { email: details.mentorEmail },
          { email: details.studentEmail },
        ],
        conferenceData: {
          createRequest: {
            requestId: `meeting-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'email', minutes: 60 }, // 1 hour before
            { method: 'popup', minutes: 10 }, // 10 minutes before
          ],
        },
      }

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      })

      const meetingLink = response.data.conferenceData?.entryPoints?.[0]?.uri || response.data.hangoutLink
      const meetingId = response.data.conferenceData?.conferenceId || response.data.id

      if (!meetingLink) {
        throw new Error('Failed to generate Google Meet link')
      }

      return {
        meetingId: meetingId!,
        meetingLink,
        joinUrl: meetingLink,
        provider: 'google-meet'
      }
    } catch (error) {
      console.error('Error generating Google Meet link:', error)
      throw new Error('Failed to generate Google Meet link')
    }
  }

  async generateZoomMeetingLink(details: MeetingDetails): Promise<GeneratedMeeting> {
    try {
      const zoomApiKey = process.env.ZOOM_API_KEY
      const zoomApiSecret = process.env.ZOOM_API_SECRET
      const zoomJWT = process.env.ZOOM_JWT_TOKEN

      if (!zoomApiKey || !zoomApiSecret) {
        throw new Error('Zoom API credentials not configured')
      }

      // Generate JWT token for Zoom API
      const jwt = require('jsonwebtoken')
      const payload = {
        iss: zoomApiKey,
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
      }
      const token = jwt.sign(payload, zoomApiSecret)

      const meetingData = {
        topic: details.title,
        type: 2, // Scheduled meeting
        start_time: details.startTime,
        duration: details.duration,
        timezone: 'Asia/Jakarta',
        agenda: details.description,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 0,
          audio: 'both',
          auto_recording: 'none',
          enforce_login: false,
          waiting_room: true,
          meeting_authentication: false
        }
      }

      const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Zoom API error:', error)
        throw new Error('Failed to create Zoom meeting')
      }

      const meeting = await response.json()

      return {
        meetingId: meeting.id.toString(),
        meetingLink: meeting.join_url,
        joinUrl: meeting.join_url,
        password: meeting.password,
        provider: 'zoom'
      }
    } catch (error) {
      console.error('Error generating Zoom meeting link:', error)
      throw new Error('Failed to generate Zoom meeting link')
    }
  }

  async generateMeetingLink(
    provider: 'zoom' | 'google-meet',
    details: MeetingDetails
  ): Promise<GeneratedMeeting> {
    switch (provider) {
      case 'google-meet':
        return this.generateGoogleMeetLink(details)
      case 'zoom':
        return this.generateZoomMeetingLink(details)
      default:
        throw new Error(`Unsupported meeting provider: ${provider}`)
    }
  }

  // Fallback method for simple Google Meet links (without calendar integration)
  async generateSimpleGoogleMeetLink(details: MeetingDetails): Promise<GeneratedMeeting> {
    try {
      // Generate a simple Google Meet room ID
      const roomId = this.generateRoomId()
      const meetingLink = `https://meet.google.com/${roomId}`

      return {
        meetingId: roomId,
        meetingLink,
        joinUrl: meetingLink,
        provider: 'google-meet'
      }
    } catch (error) {
      console.error('Error generating simple Google Meet link:', error)
      throw new Error('Failed to generate Google Meet link')
    }
  }

  private generateRoomId(): string {
    // Generate a Google Meet-style room ID (abc-defg-hij format)
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    const generateSegment = (length: number) => {
      let result = ''
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    return `${generateSegment(3)}-${generateSegment(4)}-${generateSegment(3)}`
  }
}

export const meetingService = new MeetingService()
export default meetingService