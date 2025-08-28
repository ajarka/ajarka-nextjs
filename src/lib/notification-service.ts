const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface Notification {
  id: string
  recipientId: string
  recipientType: 'siswa' | 'mentor' | 'admin'
  senderId: string
  senderType: 'siswa' | 'mentor' | 'admin'
  type: 'schedule_created' | 'booking_created' | 'booking_confirmed' | 'booking_cancelled'
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

      await this.createNotification({
        recipientId: mentorId,
        recipientType: 'mentor',
        senderId: studentId,
        senderType: 'siswa',
        type: 'booking_created',
        title: 'New Booking Request',
        message: `${studentName} has booked your session: ${scheduleTitle} on ${formattedDate}`,
        data: {
          bookingId,
          studentName,
          scheduleTitle,
          bookingDate
        },
        read: false
      })
    } catch (error) {
      console.error('Error notifying booking created:', error)
    }
  }
}