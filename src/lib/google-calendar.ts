import { google } from 'googleapis'

// Google Calendar integration service
export class GoogleCalendarService {
  private calendar = google.calendar('v3')
  
  constructor(private accessToken?: string) {
    if (accessToken) {
      google.auth.setCredentials({
        access_token: accessToken
      })
    }
  }

  // Create a calendar event for a mentoring session
  async createMentoringEvent(booking: {
    id: number
    mentorId: number
    studentId: number
    bookingDate: string
    endDate: string
    title: string
    description?: string
    meetingLink?: string
    mentorEmail: string
    studentEmail: string
    studentName: string
    mentorName: string
  }) {
    try {
      const event = {
        summary: `${booking.title} - Mentoring Session`,
        description: `
Mentoring Session Details:
- Mentor: ${booking.mentorName}
- Student: ${booking.studentName}
- Booking ID: ${booking.id}
- Description: ${booking.description || 'No description provided'}
${booking.meetingLink ? `- Meeting Link: ${booking.meetingLink}` : ''}

This session was booked through Ajarka Platform.
        `.trim(),
        start: {
          dateTime: booking.bookingDate,
          timeZone: 'Asia/Jakarta',
        },
        end: {
          dateTime: booking.endDate,
          timeZone: 'Asia/Jakarta',
        },
        attendees: [
          { email: booking.mentorEmail, responseStatus: 'accepted' },
          { email: booking.studentEmail, responseStatus: 'needsAction' }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours
            { method: 'email', minutes: 60 },      // 1 hour
            { method: 'popup', minutes: 30 },      // 30 minutes
          ],
        },
        conferenceData: booking.meetingLink ? {
          createRequest: {
            requestId: `mentoring-${booking.id}-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        } : undefined,
      }

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      })

      return response.data
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw error
    }
  }

  // Update an existing calendar event
  async updateMentoringEvent(eventId: string, updates: {
    title?: string
    description?: string
    startTime?: string
    endTime?: string
    meetingLink?: string
  }) {
    try {
      // Get the existing event first
      const existingEvent = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      })

      const updatedEvent = {
        ...existingEvent.data,
        summary: updates.title || existingEvent.data.summary,
        description: updates.description || existingEvent.data.description,
        start: updates.startTime ? {
          dateTime: updates.startTime,
          timeZone: 'Asia/Jakarta'
        } : existingEvent.data.start,
        end: updates.endTime ? {
          dateTime: updates.endTime,
          timeZone: 'Asia/Jakarta'
        } : existingEvent.data.end,
      }

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: updatedEvent,
        sendUpdates: 'all'
      })

      return response.data
    } catch (error) {
      console.error('Error updating calendar event:', error)
      throw error
    }
  }

  // Cancel a calendar event
  async cancelMentoringEvent(eventId: string, reason?: string) {
    try {
      // Update the event to cancelled status
      const existingEvent = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      })

      const cancelledEvent = {
        ...existingEvent.data,
        summary: `[CANCELLED] ${existingEvent.data.summary}`,
        description: `${existingEvent.data.description}\n\nCANCELLED${reason ? `: ${reason}` : ''}`,
        status: 'cancelled'
      }

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: cancelledEvent,
        sendUpdates: 'all'
      })

      return response.data
    } catch (error) {
      console.error('Error cancelling calendar event:', error)
      throw error
    }
  }

  // Get calendar events for a specific time range
  async getMentoringEvents(startDate: string, endDate: string) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate,
        timeMax: endDate,
        singleEvents: true,
        orderBy: 'startTime',
        q: 'Mentoring Session'
      })

      return response.data.items || []
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      throw error
    }
  }

  // Check for calendar conflicts
  async checkConflicts(startTime: string, endTime: string, excludeEventId?: string) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: startTime,
        timeMax: endTime,
        singleEvents: true,
        orderBy: 'startTime'
      })

      const conflicts = (response.data.items || []).filter(event => 
        event.id !== excludeEventId && 
        event.status !== 'cancelled'
      )

      return conflicts
    } catch (error) {
      console.error('Error checking calendar conflicts:', error)
      throw error
    }
  }

  // Create a recurring availability block
  async createAvailabilityBlock(availability: {
    title: string
    description: string
    dayOfWeek: number
    startTime: string
    endTime: string
    timezone: string
  }) {
    try {
      // Convert day of week to Google Calendar format
      const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
      const recurDay = dayMap[availability.dayOfWeek]

      const event = {
        summary: `${availability.title} - Available for Mentoring`,
        description: availability.description,
        start: {
          dateTime: `2024-01-01T${availability.startTime}:00`,
          timeZone: availability.timezone,
        },
        end: {
          dateTime: `2024-01-01T${availability.endTime}:00`,
          timeZone: availability.timezone,
        },
        recurrence: [
          `RRULE:FREQ=WEEKLY;BYDAY=${recurDay}`
        ],
        transparency: 'transparent', // Won't block other events
        status: 'confirmed'
      }

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event
      })

      return response.data
    } catch (error) {
      console.error('Error creating availability block:', error)
      throw error
    }
  }
}

// Server-side calendar service for API routes
export class ServerCalendarService extends GoogleCalendarService {
  constructor() {
    super()
    
    // Use service account authentication for server-side
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
      
      const auth = new google.auth.JWT(
        serviceAccount.client_email,
        undefined,
        serviceAccount.private_key,
        ['https://www.googleapis.com/auth/calendar']
      )

      google.options({ auth })
    }
  }

  // Create event on behalf of mentor (using mentor's calendar if they've authorized)
  async createEventForMentor(mentorCalendarId: string, eventData: object) {
    try {
      const response = await this.calendar.events.insert({
        calendarId: mentorCalendarId,
        requestBody: eventData,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      })

      return response.data
    } catch (error) {
      console.error('Error creating event for mentor:', error)
      throw error
    }
  }
}

// Utility functions for calendar integration
export const calendarUtils = {
  // Format booking data for calendar event creation
  formatBookingForCalendar: (booking: Record<string, unknown>, mentor: Record<string, unknown>, student: Record<string, unknown>) => ({
    id: booking.id,
    mentorId: booking.mentorId,
    studentId: booking.studentId,
    bookingDate: booking.bookingDate,
    endDate: booking.endDate,
    title: booking.scheduleTitle || 'Mentoring Session',
    description: booking.studentNotes,
    meetingLink: booking.meetingLink,
    mentorEmail: mentor.email,
    studentEmail: student.email,
    studentName: student.name,
    mentorName: mentor.name,
  }),

  // Generate ICS calendar invite content
  generateICSContent: (booking: Record<string, unknown>) => {
    const startDate = new Date(booking.bookingDate).toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z'
    const endDate = new Date(booking.endDate).toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z'
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ajarka//Mentoring Session//EN
BEGIN:VEVENT
UID:mentoring-${booking.id}@ajarka.com
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${booking.title} - Mentoring Session
DESCRIPTION:${booking.description || 'Mentoring session booked through Ajarka Platform'}
LOCATION:${booking.meetingLink || 'Online'}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Mentoring session starts in 30 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`.replace(/\n/g, '\r\n')
  }
}