// Slot Request Service for handling student requests for unavailable slots
export interface SlotRequest {
  id: string
  studentId: number
  mentorId: number
  scheduleId: number
  requestedDate: string // ISO date string
  requestedTime: string // HH:mm format
  duration: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  studentNotes?: string
  mentorResponse?: string
  priority: 'normal' | 'urgent'
  type: 'single_session' | 'recurring_request'
  createdAt: string
  updatedAt: string
  respondedAt?: string
}

export interface SlotRequestNotification {
  id: string
  requestId: string
  mentorId: number
  studentId: number
  type: 'new_request' | 'request_approved' | 'request_rejected'
  title: string
  message: string
  read: boolean
  createdAt: string
}

export class SlotRequestService {
  private static readonly BASE_URL = 'http://localhost:3001'

  // Create a new slot request
  static async createSlotRequest(
    studentId: number,
    mentorId: number,
    scheduleId: number,
    requestedDate: Date,
    requestedTime: string,
    duration: number,
    notes?: string
  ): Promise<SlotRequest> {
    try {
      const request: Omit<SlotRequest, 'id'> = {
        studentId,
        mentorId,
        scheduleId,
        requestedDate: requestedDate.toISOString().split('T')[0], // YYYY-MM-DD format
        requestedTime,
        duration,
        status: 'pending',
        studentNotes: notes,
        priority: 'normal',
        type: 'single_session',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await fetch(`${this.BASE_URL}/slot_requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          id: `SLOT_REQ_${Date.now()}_${studentId}_${mentorId}`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create slot request')
      }

      const createdRequest = await response.json()

      // Create notification for mentor
      await this.createSlotRequestNotification(createdRequest, 'new_request')

      return createdRequest
    } catch (error) {
      console.error('Error creating slot request:', error)
      throw error
    }
  }

  // Get slot requests for a mentor
  static async getMentorSlotRequests(mentorId: number): Promise<SlotRequest[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/slot_requests?mentorId=${mentorId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch slot requests')
      }
      
      const requests = await response.json()
      return requests.sort((a: SlotRequest, b: SlotRequest) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } catch (error) {
      console.error('Error fetching mentor slot requests:', error)
      return []
    }
  }

  // Get slot requests for a student
  static async getStudentSlotRequests(studentId: number): Promise<SlotRequest[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/slot_requests?studentId=${studentId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch slot requests')
      }
      
      const requests = await response.json()
      return requests.sort((a: SlotRequest, b: SlotRequest) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } catch (error) {
      console.error('Error fetching student slot requests:', error)
      return []
    }
  }

  // Update slot request status (approve/reject)
  static async updateSlotRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected',
    mentorResponse?: string
  ): Promise<SlotRequest> {
    try {
      // First, get the current request
      const getCurrentRequest = await fetch(`${this.BASE_URL}/slot_requests/${requestId}`)
      const currentRequest = await getCurrentRequest.json()

      const updatedRequest = {
        ...currentRequest,
        status,
        mentorResponse,
        respondedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await fetch(`${this.BASE_URL}/slot_requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRequest)
      })

      if (!response.ok) {
        throw new Error('Failed to update slot request')
      }

      const result = await response.json()

      // Create notification for student
      await this.createSlotRequestNotification(
        result, 
        status === 'approved' ? 'request_approved' : 'request_rejected'
      )

      return result
    } catch (error) {
      console.error('Error updating slot request status:', error)
      throw error
    }
  }

  // Cancel slot request (student)
  static async cancelSlotRequest(requestId: string): Promise<void> {
    try {
      const getCurrentRequest = await fetch(`${this.BASE_URL}/slot_requests/${requestId}`)
      const currentRequest = await getCurrentRequest.json()

      const updatedRequest = {
        ...currentRequest,
        status: 'cancelled' as const,
        updatedAt: new Date().toISOString()
      }

      const response = await fetch(`${this.BASE_URL}/slot_requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRequest)
      })

      if (!response.ok) {
        throw new Error('Failed to cancel slot request')
      }
    } catch (error) {
      console.error('Error cancelling slot request:', error)
      throw error
    }
  }

  // Create notification for slot request
  private static async createSlotRequestNotification(
    request: SlotRequest,
    type: 'new_request' | 'request_approved' | 'request_rejected'
  ): Promise<void> {
    try {
      let title: string
      let message: string
      let recipientId: number

      switch (type) {
        case 'new_request':
          title = 'New Slot Request'
          message = `Student has requested a slot on ${request.requestedDate} at ${request.requestedTime}`
          recipientId = request.mentorId
          break
        case 'request_approved':
          title = 'Slot Request Approved'
          message = `Your slot request for ${request.requestedDate} at ${request.requestedTime} has been approved`
          recipientId = request.studentId
          break
        case 'request_rejected':
          title = 'Slot Request Rejected'
          message = `Your slot request for ${request.requestedDate} at ${request.requestedTime} has been rejected`
          recipientId = request.studentId
          break
      }

      const notification: Omit<SlotRequestNotification, 'id'> = {
        requestId: request.id,
        mentorId: request.mentorId,
        studentId: request.studentId,
        type,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString()
      }

      // Add to regular notifications table
      await fetch(`${this.BASE_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `SLOT_NOTIF_${Date.now()}_${recipientId}`,
          userId: recipientId,
          title,
          message,
          type: 'slot_request',
          read: false,
          createdAt: new Date().toISOString(),
          metadata: {
            requestId: request.id,
            requestType: type,
            scheduleId: request.scheduleId,
            requestedDate: request.requestedDate,
            requestedTime: request.requestedTime
          }
        })
      })
    } catch (error) {
      console.error('Error creating slot request notification:', error)
    }
  }

  // Get slot requests for a specific date
  static async getSlotRequestsForDate(mentorId: number, date: Date): Promise<SlotRequest[]> {
    try {
      const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD format
      const response = await fetch(`${this.BASE_URL}/slot_requests?mentorId=${mentorId}&requestedDate=${dateString}`)
      
      if (!response.ok) {
        return []
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching slot requests for date:', error)
      return []
    }
  }

  // Get pending slot requests count for mentor
  static async getPendingRequestsCount(mentorId: number): Promise<number> {
    try {
      const response = await fetch(`${this.BASE_URL}/slot_requests?mentorId=${mentorId}&status=pending`)
      
      if (!response.ok) {
        return 0
      }
      
      const requests = await response.json()
      return requests.length
    } catch (error) {
      console.error('Error fetching pending requests count:', error)
      return 0
    }
  }

  // Convert approved slot request to actual availability
  static async createAvailabilityFromRequest(request: SlotRequest): Promise<void> {
    try {
      const requestDate = new Date(request.requestedDate)
      const dayOfWeek = requestDate.getDay()
      
      // Create a specific availability slot for this request
      const availability = {
        id: `AVAIL_FROM_REQ_${request.id}`,
        mentorId: request.mentorId,
        scheduleId: request.scheduleId,
        dayOfWeek,
        startTime: request.requestedTime,
        endTime: this.addMinutesToTime(request.requestedTime, request.duration),
        isRecurring: false,
        specificDate: request.requestedDate,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdFrom: 'slot_request',
        originalRequestId: request.id
      }

      await fetch(`${this.BASE_URL}/mentor_availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availability)
      })
    } catch (error) {
      console.error('Error creating availability from request:', error)
      throw error
    }
  }

  // Helper function to add minutes to time string
  private static addMinutesToTime(timeString: string, minutes: number): string {
    const [hours, mins] = timeString.split(':').map(Number)
    const totalMinutes = (hours * 60) + mins + minutes
    const newHours = Math.floor(totalMinutes / 60) % 24
    const newMins = totalMinutes % 60
    
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
  }

  // Get all slot requests with related data (for admin/reporting)
  static async getAllSlotRequestsWithDetails(): Promise<Array<SlotRequest & { 
    studentName?: string,
    mentorName?: string,
    scheduleTitle?: string 
  }>> {
    try {
      const [requests, users, schedules] = await Promise.all([
        fetch(`${this.BASE_URL}/slot_requests`).then(r => r.json()),
        fetch(`${this.BASE_URL}/users`).then(r => r.json()),
        fetch(`${this.BASE_URL}/mentor_schedules`).then(r => r.json())
      ])

      return requests.map((request: SlotRequest) => {
        const student = users.find((u: any) => u.id === request.studentId.toString())
        const mentor = users.find((u: any) => u.id === request.mentorId.toString())
        const schedule = schedules.find((s: any) => s.id === request.scheduleId)

        return {
          ...request,
          studentName: student?.name,
          mentorName: mentor?.name,
          scheduleTitle: schedule?.title
        }
      })
    } catch (error) {
      console.error('Error fetching all slot requests with details:', error)
      return []
    }
  }
}