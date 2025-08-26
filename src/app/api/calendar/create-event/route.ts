import { NextRequest, NextResponse } from 'next/server'
import { ServerCalendarService, calendarUtils } from '@/lib/google-calendar'

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    // Fetch booking details from JSON server
    const bookingResponse = await fetch(`http://localhost:3001/bookings/${bookingId}`)
    if (!bookingResponse.ok) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    const booking = await bookingResponse.json()

    // Fetch mentor and student details
    const [mentorResponse, studentResponse, scheduleResponse] = await Promise.all([
      fetch(`http://localhost:3001/users/${booking.mentorId}`),
      fetch(`http://localhost:3001/users/${booking.studentId}`),
      fetch(`http://localhost:3001/mentor_schedules/${booking.scheduleId}`)
    ])

    if (!mentorResponse.ok || !studentResponse.ok || !scheduleResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch user or schedule details' }, { status: 404 })
    }

    const mentor = await mentorResponse.json()
    const student = await studentResponse.json()
    const schedule = await scheduleResponse.json()

    // Format booking data for calendar
    const calendarData = calendarUtils.formatBookingForCalendar(
      { ...booking, scheduleTitle: schedule.title },
      mentor,
      student
    )

    // Create calendar event (if Google Calendar is configured)
    let googleEventId = null
    try {
      const calendarService = new ServerCalendarService()
      const event = await calendarService.createMentoringEvent(calendarData)
      googleEventId = event.id
    } catch (calendarError) {
      console.warn('Failed to create Google Calendar event:', calendarError)
      // Continue without calendar integration if it fails
    }

    // Update booking with calendar event ID
    if (googleEventId) {
      await fetch(`http://localhost:3001/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleCalendarEventId: googleEventId,
          updatedAt: new Date().toISOString()
        })
      })
    }

    // Generate ICS file content for manual calendar import
    const icsContent = calendarUtils.generateICSContent({
      id: booking.id,
      bookingDate: booking.bookingDate,
      endDate: booking.endDate,
      title: schedule.title,
      description: booking.studentNotes || `Mentoring session with ${mentor.name}`,
      meetingLink: booking.meetingLink
    })

    return NextResponse.json({
      success: true,
      googleEventId,
      icsContent,
      message: 'Calendar event created successfully'
    })

  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { bookingId, eventId, updates } = await request.json()

    if (!bookingId || !eventId) {
      return NextResponse.json({ error: 'Booking ID and Event ID are required' }, { status: 400 })
    }

    // Update Google Calendar event
    try {
      const calendarService = new ServerCalendarService()
      await calendarService.updateMentoringEvent(eventId, updates)
    } catch (calendarError) {
      console.warn('Failed to update Google Calendar event:', calendarError)
    }

    return NextResponse.json({
      success: true,
      message: 'Calendar event updated successfully'
    })

  } catch (error) {
    console.error('Error updating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { eventId, reason } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Cancel Google Calendar event
    try {
      const calendarService = new ServerCalendarService()
      await calendarService.cancelMentoringEvent(eventId, reason)
    } catch (calendarError) {
      console.warn('Failed to cancel Google Calendar event:', calendarError)
    }

    return NextResponse.json({
      success: true,
      message: 'Calendar event cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to cancel calendar event' },
      { status: 500 }
    )
  }
}