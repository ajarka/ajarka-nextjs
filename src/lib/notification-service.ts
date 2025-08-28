const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface Notification {
  id: string
  recipientId: string
  recipientType: 'siswa' | 'mentor' | 'admin'
  senderId: string
  senderType: 'siswa' | 'mentor' | 'admin'
  type: 'schedule_created' | 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'meeting_link_generated' | 'availability_updated' | 'availability_deleted'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  createdAt: string
}

export class NotificationService {
  // Get all notifications for a user
  static async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications?recipientId=${userId}&_sort=createdAt&_order=desc`)
      if (!response.ok) throw new Error('Failed to fetch notifications')
      return await response.json()
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  // Get unread notifications count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications?recipientId=${userId}&read=false`)
      if (!response.ok) throw new Error('Failed to fetch unread count')
      const notifications = await response.json()
      return notifications.length
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
  }

  // Create a new notification
  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      const newNotification = {
        ...notification,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotification)
      })
      
      return response.ok
    } catch (error) {
      console.error('Error creating notification:', error)
      return false
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      })
      
      return response.ok
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const notifications = await this.getNotifications(userId)
      const unreadNotifications = notifications.filter(n => !n.read)
      
      const promises = unreadNotifications.map(notification => 
        this.markAsRead(notification.id)
      )
      
      const results = await Promise.all(promises)
      return results.every(result => result === true)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  // Create notification for new schedule
  static async notifyScheduleCreated(
    mentorId: string,
    mentorName: string,
    scheduleId: string,
    scheduleTitle: string
  ): Promise<void> {
    try {
      // Get all students to notify them
      const response = await fetch(`${API_BASE_URL}/users?role=siswa`)
      const students = await response.json()
      
      const promises = students.map((student: any) =>
        this.createNotification({
          recipientId: student.id.toString(),
          recipientType: 'siswa',
          senderId: mentorId,
          senderType: 'mentor',
          type: 'schedule_created',
          title: 'New Schedule Available',
          message: `${mentorName} has created a new mentoring schedule: ${scheduleTitle}`,
          data: {
            scheduleId,
            mentorName,
            scheduleTitle
          },
          read: false
        })
      )
      
      await Promise.all(promises)
    } catch (error) {
      console.error('Error notifying schedule created:', error)
    }
  }

  // Create notification for new booking
  static async notifyBookingCreated(
    studentId: string,
    studentName: string,
    mentorId: string,
    bookingId: string,
    scheduleTitle: string,
    bookingDate: string,
    meetingLink?: string,
    meetingProvider?: string
  ): Promise<void> {
    try {
      const formattedDate = new Date(bookingDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      let message = `${studentName} has booked your session: ${scheduleTitle} on ${formattedDate}`
      
      if (meetingLink && meetingProvider) {
        message += `. Meeting link (${meetingProvider === 'zoom' ? 'Zoom' : 'Google Meet'}): ${meetingLink}`
      }

      await this.createNotification({
        recipientId: mentorId,
        recipientType: 'mentor',
        senderId: studentId,
        senderType: 'siswa',
        type: 'booking_created',
        title: 'New Booking Request',
        message,
        data: {
          bookingId,
          studentName,
          scheduleTitle,
          bookingDate,
          meetingLink,
          meetingProvider
        },
        read: false
      })
    } catch (error) {
      console.error('Error notifying booking created:', error)
    }
  }

  // Create notification for meeting link generation
  static async notifyMeetingLinkGenerated(
    mentorId: string,
    studentId: string,
    bookingId: string,
    scheduleTitle: string,
    meetingLink: string,
    meetingProvider: string,
    bookingDate: string
  ): Promise<void> {
    try {
      const formattedDate = new Date(bookingDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      const providerName = meetingProvider === 'zoom' ? 'Zoom' : 'Google Meet'

      // Notify mentor
      await this.createNotification({
        recipientId: mentorId,
        recipientType: 'mentor',
        senderId: 'system',
        senderType: 'admin',
        type: 'meeting_link_generated',
        title: `${providerName} Link Generated`,
        message: `Meeting link untuk session "${scheduleTitle}" pada ${formattedDate} telah dibuat. Link: ${meetingLink}`,
        data: {
          bookingId,
          scheduleTitle,
          meetingLink,
          meetingProvider,
          bookingDate
        },
        read: false
      })

      // Notify student
      await this.createNotification({
        recipientId: studentId,
        recipientType: 'siswa',
        senderId: 'system',
        senderType: 'admin',
        type: 'meeting_link_generated',
        title: `${providerName} Link Ready`,
        message: `Meeting link untuk session "${scheduleTitle}" pada ${formattedDate} sudah siap. Link: ${meetingLink}`,
        data: {
          bookingId,
          scheduleTitle,
          meetingLink,
          meetingProvider,
          bookingDate
        },
        read: false
      })
    } catch (error) {
      console.error('Error notifying meeting link generated:', error)
    }
  }

  // Create notification for availability slot updates
  static async notifyAvailabilityUpdated(
    mentorId: string,
    mentorName: string,
    scheduleId: string,
    scheduleTitle: string,
    oldSlot: { dayOfWeek: number, startTime: string, endTime: string },
    newSlot: { dayOfWeek: number, startTime: string, endTime: string }
  ): Promise<void> {
    try {
      // Get all students who have bookings for this schedule
      const bookingsResponse = await fetch(`${API_BASE_URL}/bookings?scheduleId=${scheduleId}`)
      const bookings = await bookingsResponse.json()
      
      // Get unique student IDs
      const studentIds = [...new Set(bookings.map((b: any) => b.studentId.toString()))]
      
      // Also get all students to notify about general availability changes
      const studentsResponse = await fetch(`${API_BASE_URL}/users?role=siswa`)
      const allStudents = await studentsResponse.json()

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const oldDayName = dayNames[oldSlot.dayOfWeek]
      const newDayName = dayNames[newSlot.dayOfWeek]

      // Notify students with existing bookings
      const existingStudentPromises = studentIds.map(async (studentId: string) => {
        await this.createNotification({
          recipientId: studentId,
          recipientType: 'siswa',
          senderId: mentorId,
          senderType: 'mentor',
          type: 'availability_updated',
          title: 'Jadwal Mentor Diperbarui',
          message: `${mentorName} telah memperbarui jadwal "${scheduleTitle}". Perubahan: ${oldDayName} ${oldSlot.startTime}-${oldSlot.endTime} → ${newDayName} ${newSlot.startTime}-${newSlot.endTime}. Mohon periksa booking Anda.`,
          data: {
            scheduleId,
            mentorName,
            scheduleTitle,
            oldSlot,
            newSlot,
            affectsExistingBooking: true
          },
          read: false
        })
      })

      // Notify all other students about availability changes
      const otherStudentPromises = allStudents
        .filter((student: any) => !studentIds.includes(student.id.toString()))
        .map(async (student: any) => {
          await this.createNotification({
            recipientId: student.id.toString(),
            recipientType: 'siswa',
            senderId: mentorId,
            senderType: 'mentor',
            type: 'availability_updated',
            title: 'Jadwal Mentor Tersedia Diperbarui',
            message: `${mentorName} telah memperbarui ketersediaan untuk "${scheduleTitle}". Waktu baru: ${newDayName} ${newSlot.startTime}-${newSlot.endTime}`,
            data: {
              scheduleId,
              mentorName,
              scheduleTitle,
              newSlot,
              affectsExistingBooking: false
            },
            read: false
          })
        })

      await Promise.all([...existingStudentPromises, ...otherStudentPromises])
    } catch (error) {
      console.error('Error notifying availability updated:', error)
    }
  }

  // Create notification for availability slot deletions
  static async notifyAvailabilityDeleted(
    mentorId: string,
    mentorName: string,
    scheduleId: string,
    scheduleTitle: string,
    deletedSlot: { dayOfWeek: number, startTime: string, endTime: string }
  ): Promise<void> {
    try {
      // Get all students who have bookings for this schedule
      const bookingsResponse = await fetch(`${API_BASE_URL}/bookings?scheduleId=${scheduleId}`)
      const bookings = await bookingsResponse.json()
      
      // Get unique student IDs
      const studentIds = [...new Set(bookings.map((b: any) => b.studentId.toString()))]
      
      // Also get all students to notify about general availability changes
      const studentsResponse = await fetch(`${API_BASE_URL}/users?role=siswa`)
      const allStudents = await studentsResponse.json()

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const deletedDayName = dayNames[deletedSlot.dayOfWeek]

      // Notify students with existing bookings (high priority)
      const existingStudentPromises = studentIds.map(async (studentId: string) => {
        await this.createNotification({
          recipientId: studentId,
          recipientType: 'siswa',
          senderId: mentorId,
          senderType: 'mentor',
          type: 'availability_deleted',
          title: 'PENTING: Jadwal Mentor Dihapus',
          message: `${mentorName} telah menghapus ketersediaan untuk "${scheduleTitle}" pada ${deletedDayName} ${deletedSlot.startTime}-${deletedSlot.endTime}. Mohon periksa booking Anda dan hubungi mentor jika diperlukan.`,
          data: {
            scheduleId,
            mentorName,
            scheduleTitle,
            deletedSlot,
            affectsExistingBooking: true,
            urgency: 'high'
          },
          read: false
        })
      })

      // Notify all other students about availability removal
      const otherStudentPromises = allStudents
        .filter((student: any) => !studentIds.includes(student.id.toString()))
        .map(async (student: any) => {
          await this.createNotification({
            recipientId: student.id.toString(),
            recipientType: 'siswa',
            senderId: mentorId,
            senderType: 'mentor',
            type: 'availability_deleted',
            title: 'Jadwal Mentor Tidak Tersedia',
            message: `${mentorName} telah menghapus ketersediaan untuk "${scheduleTitle}" pada ${deletedDayName} ${deletedSlot.startTime}-${deletedSlot.endTime}.`,
            data: {
              scheduleId,
              mentorName,
              scheduleTitle,
              deletedSlot,
              affectsExistingBooking: false
            },
            read: false
          })
        })

      await Promise.all([...existingStudentPromises, ...otherStudentPromises])
    } catch (error) {
      console.error('Error notifying availability deleted:', error)
    }
  }

  // Helper function to get affected bookings for a specific availability slot
  static async getAffectedBookings(
    scheduleId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings?scheduleId=${scheduleId}`)
      const allBookings = await response.json()

      // Filter bookings that fall within the deleted/updated time slot
      const affectedBookings = allBookings.filter((booking: any) => {
        const bookingDate = new Date(booking.bookingDate)
        const bookingDayOfWeek = bookingDate.getDay()
        const bookingTime = bookingDate.toTimeString().slice(0, 5) // HH:mm format

        return (
          bookingDayOfWeek === dayOfWeek &&
          bookingTime >= startTime &&
          bookingTime < endTime &&
          booking.status !== 'cancelled'
        )
      })

      return affectedBookings
    } catch (error) {
      console.error('Error getting affected bookings:', error)
      return []
    }
  }
}