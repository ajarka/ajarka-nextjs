// Simple Notification Service - Temporary wrapper to fix immediate notification errors
// This provides mock/stub implementations to prevent console errors while we migrate to Convex

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
      console.log('🔔 Mock notification service - getNotifications for user:', userId);
      // Return empty array to prevent errors
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  // Get unread notifications count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      console.log('🔔 Mock notification service - getUnreadCount for user:', userId);
      // Return 0 to prevent errors
      return 0;
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
  }

  // Create a new notification
  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      console.log('🔔 Mock notification service - createNotification:', notification.title);
      return true;
    } catch (error) {
      console.error('Error creating notification:', error)
      return false
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      console.log('🔔 Mock notification service - markAsRead:', notificationId);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      console.log('🔔 Mock notification service - markAllAsRead for user:', userId);
      return true;
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
    console.log('🔔 Mock notification service - notifyScheduleCreated:', scheduleTitle);
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
    console.log('🔔 Mock notification service - notifyBookingCreated:', scheduleTitle);
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
    console.log('🔔 Mock notification service - notifyMeetingLinkGenerated:', scheduleTitle);
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
    console.log('🔔 Mock notification service - notifyAvailabilityUpdated:', scheduleTitle);
  }

  // Create notification for availability slot deletions
  static async notifyAvailabilityDeleted(
    mentorId: string,
    mentorName: string,
    scheduleId: string,
    scheduleTitle: string,
    deletedSlot: { dayOfWeek: number, startTime: string, endTime: string }
  ): Promise<void> {
    console.log('🔔 Mock notification service - notifyAvailabilityDeleted:', scheduleTitle);
  }

  // Helper function to get affected bookings for a specific availability slot
  static async getAffectedBookings(
    scheduleId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ): Promise<any[]> {
    console.log('🔔 Mock notification service - getAffectedBookings:', scheduleId);
    return [];
  }
}