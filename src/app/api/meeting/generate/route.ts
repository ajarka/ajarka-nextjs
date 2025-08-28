import { NextRequest, NextResponse } from 'next/server'
import { meetingService, MeetingDetails } from '@/lib/meeting-service'
import { getServerSession } from 'next-auth/next'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      provider,
      title,
      description,
      startTime,
      endTime,
      mentorEmail,
      studentEmail,
      duration
    } = body

    // Validate required fields
    if (!provider || !title || !startTime || !endTime || !mentorEmail || !studentEmail || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate provider
    if (!['zoom', 'google-meet'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid meeting provider. Must be "zoom" or "google-meet"' },
        { status: 400 }
      )
    }

    const meetingDetails: MeetingDetails = {
      title,
      description,
      startTime,
      endTime,
      mentorEmail,
      studentEmail,
      duration
    }

    let meeting
    try {
      meeting = await meetingService.generateMeetingLink(provider, meetingDetails)
    } catch (error) {
      // If the main provider fails, try fallback for Google Meet
      if (provider === 'google-meet') {
        console.warn('Primary Google Meet generation failed, using fallback method')
        meeting = await meetingService.generateSimpleGoogleMeetLink(meetingDetails)
      } else {
        throw error
      }
    }

    return NextResponse.json({
      success: true,
      meeting
    }, { status: 200 })

  } catch (error) {
    console.error('Error generating meeting link:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate meeting link',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Meeting generation endpoint',
    methods: ['POST'],
    requiredFields: [
      'provider', // 'zoom' or 'google-meet'
      'title',
      'description',
      'startTime', // ISO string
      'endTime', // ISO string
      'mentorEmail',
      'studentEmail',
      'duration' // in minutes
    ]
  })
}