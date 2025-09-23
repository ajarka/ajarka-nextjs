'use client'

import { BaseService } from './base/base-service'
import type { Id } from '../../convex/_generated/dataModel'

/**
 * Notification Service - Real Implementation using Convex
 * Handles notification management and real-time updates
 */

export interface Notification {
  _id: Id<"notifications">
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
  updatedAt: string
}

export interface CreateNotificationRequest {
  recipientId: string
  recipientType: 'siswa' | 'mentor' | 'admin'
  senderId: string
  senderType: 'siswa' | 'mentor' | 'admin'
  type: 'schedule_created' | 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'meeting_link_generated' | 'availability_updated' | 'availability_deleted'
  title: string
  message: string
  data?: Record<string, any>
  read?: boolean
}

export interface UpdateNotificationRequest {
  title?: string
  message?: string
  data?: Record<string, any>
  read?: boolean
}

export interface NotificationStats {
  total: number
  read: number
  unread: number
  byType: Record<string, number>
}

export class NotificationService extends BaseService {
  /**
   * Get all notifications
   */
  static async useNotifications() {
    return this.withConvex(async (convex) => {
      return await convex.query("notifications:getAll")
    })
  }

  /**
   * Get notification by ID
   */
  static async useNotificationById(id: Id<"notifications">) {
    return this.withConvex(async (convex) => {
      return await convex.query("notifications:getById", { id })
    })
  }

  /**
   * Get notifications by recipient
   */
  static async useNotificationsByRecipient(recipientId: string, limit?: number) {
    return this.withConvex(async (convex) => {
      return await convex.query("notifications:getByRecipient", { recipientId, limit })
    })
  }

  /**
   * Get unread notifications by recipient
   */
  static async useUnreadNotificationsByRecipient(recipientId: string) {
    return this.withConvex(async (convex) => {
      return await convex.query("notifications:getUnreadByRecipient", { recipientId })
    })
  }

  /**
   * Get unread count by recipient
   */
  static async useUnreadCountByRecipient(recipientId: string) {
    return this.withConvex(async (convex) => {
      return await convex.query("notifications:getUnreadCountByRecipient", { recipientId })
    })
  }

  /**
   * Get notifications by type
   */
  static async useNotificationsByType(type: CreateNotificationRequest['type']) {
    return this.withConvex(async (convex) => {
      return await convex.query("notifications:getByType", { type })
    })
  }

  /**
   * Get notification statistics
   */
  static async useNotificationStats(recipientId?: string): Promise<NotificationStats> {
    return this.withConvex(async (convex) => {
      return await convex.query("notifications:getNotificationStats", { recipientId })
    })
  }

  /**
   * Create a new notification
   */
  static async createNotification(request: CreateNotificationRequest): Promise<Id<"notifications">> {
    return this.withConvex(async (convex) => {
      return await convex.mutation("notifications:create", request)
    })
  }

  /**
   * Create multiple notifications (bulk operation)
   */
  static async createBulkNotifications(notifications: CreateNotificationRequest[]): Promise<Id<"notifications">[]> {
    return this.withConvex(async (convex) => {
      return await convex.mutation("notifications:createBulk", { notifications })
    })
  }

  /**
   * Update a notification
   */
  static async updateNotification(id: Id<"notifications">, request: UpdateNotificationRequest): Promise<Id<"notifications">> {
    return this.withConvex(async (convex) => {
      return await convex.mutation("notifications:update", { id, ...request })
    })
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: Id<"notifications">): Promise<Id<"notifications">> {
    return this.withConvex(async (convex) => {
      return await convex.mutation("notifications:markAsRead", { id })
    })
  }

  /**
   * Mark all notifications as read for a recipient
   */
  static async markAllAsReadByRecipient(recipientId: string): Promise<{ updated: number }> {
    return this.withConvex(async (convex) => {
      return await convex.mutation("notifications:markAllAsReadByRecipient", { recipientId })
    })
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(id: Id<"notifications">): Promise<{ success: boolean }> {
    return this.withConvex(async (convex) => {
      return await convex.mutation("notifications:remove", { id })
    })
  }

  // Helper methods for specific notification types

  /**
   * Notify about new schedule created
   */
  static async notifyScheduleCreated(
    mentorId: string,
    mentorName: string,
    scheduleId: string,
    scheduleTitle: string
  ): Promise<void> {
    try {
      // Get all students to notify them
      const users = await this.withConvex(async (convex) => {
        return await convex.query("users:getByRole", { role: "siswa" })
      })

      const notifications: CreateNotificationRequest[] = users.map(student => ({
        recipientId: student._id,
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
      }))

      await this.createBulkNotifications(notifications)
    } catch (error) {
      console.error('Error notifying schedule created:', error)
    }
  }

  /**
   * Notify about new booking created
   */
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

  /**
   * Notify about meeting link generated
   */
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

      const notifications: CreateNotificationRequest[] = [
        // Notify mentor
        {
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
        },
        // Notify student
        {
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
        }
      ]

      await this.createBulkNotifications(notifications)
    } catch (error) {
      console.error('Error notifying meeting link generated:', error)
    }
  }

  /**
   * Notify about availability updates
   */
  static async notifyAvailabilityUpdated(
    mentorId: string,
    mentorName: string,
    scheduleId: string,
    scheduleTitle: string,
    oldSlot: { dayOfWeek: number, startTime: string, endTime: string },
    newSlot: { dayOfWeek: number, startTime: string, endTime: string }
  ): Promise<void> {
    try {
      // Get all students
      const students = await this.withConvex(async (convex) => {
        return await convex.query("users:getByRole", { role: "siswa" })
      })

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const oldDayName = dayNames[oldSlot.dayOfWeek]
      const newDayName = dayNames[newSlot.dayOfWeek]

      const notifications: CreateNotificationRequest[] = students.map(student => ({
        recipientId: student._id,
        recipientType: 'siswa',
        senderId: mentorId,
        senderType: 'mentor',
        type: 'availability_updated',
        title: 'Jadwal Mentor Diperbarui',
        message: `${mentorName} telah memperbarui jadwal "${scheduleTitle}". Perubahan: ${oldDayName} ${oldSlot.startTime}-${oldSlot.endTime} → ${newDayName} ${newSlot.startTime}-${newSlot.endTime}`,
        data: {
          scheduleId,
          mentorName,
          scheduleTitle,
          oldSlot,
          newSlot
        },
        read: false
      }))

      await this.createBulkNotifications(notifications)
    } catch (error) {
      console.error('Error notifying availability updated:', error)
    }
  }

  /**
   * Notify about availability deletion
   */
  static async notifyAvailabilityDeleted(
    mentorId: string,
    mentorName: string,
    scheduleId: string,
    scheduleTitle: string,
    deletedSlot: { dayOfWeek: number, startTime: string, endTime: string }
  ): Promise<void> {
    try {
      // Get all students
      const students = await this.withConvex(async (convex) => {
        return await convex.query("users:getByRole", { role: "siswa" })
      })

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const deletedDayName = dayNames[deletedSlot.dayOfWeek]

      const notifications: CreateNotificationRequest[] = students.map(student => ({
        recipientId: student._id,
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
          urgency: 'high'
        },
        read: false
      }))

      await this.createBulkNotifications(notifications)
    } catch (error) {
      console.error('Error notifying availability deleted:', error)
    }
  }

  // Utility functions

  /**
   * Format notification date for display
   */
  static formatNotificationDate(createdAt: string): string {
    const date = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Get notification icon based on type
   */
  static getNotificationIcon(type: CreateNotificationRequest['type']): string {
    const icons = {
      'schedule_created': '📅',
      'booking_created': '📝',
      'booking_confirmed': '✅',
      'booking_cancelled': '❌',
      'meeting_link_generated': '🔗',
      'availability_updated': '🔄',
      'availability_deleted': '🗑️'
    }
    return icons[type] || '📢'
  }

  /**
   * Get notification color based on type
   */
  static getNotificationColor(type: CreateNotificationRequest['type']): string {
    const colors = {
      'schedule_created': 'text-blue-600 bg-blue-100',
      'booking_created': 'text-green-600 bg-green-100',
      'booking_confirmed': 'text-green-600 bg-green-100',
      'booking_cancelled': 'text-red-600 bg-red-100',
      'meeting_link_generated': 'text-purple-600 bg-purple-100',
      'availability_updated': 'text-orange-600 bg-orange-100',
      'availability_deleted': 'text-red-600 bg-red-100'
    }
    return colors[type] || 'text-gray-600 bg-gray-100'
  }
}