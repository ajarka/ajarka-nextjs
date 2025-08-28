'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Bell,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Users,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react"
import { NotificationService, Notification } from '@/lib/notification-service'

interface NotificationDisplayProps {
  userId: string
  userType: 'siswa' | 'mentor' | 'admin'
}

export default function NotificationDisplay({ userId, userType }: NotificationDisplayProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const data = await NotificationService.getNotifications(userId)
      setNotifications(data)
      
      const unread = await NotificationService.getUnreadCount(userId)
      setUnreadCount(unread)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId)
      await fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead(userId)
      await fetchNotifications()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [userId])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'schedule_created':
        return <Calendar className="h-4 w-4 text-green-600" />
      case 'booking_created':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'availability_updated':
        return <Edit3 className="h-4 w-4 text-orange-600" />
      case 'availability_deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />
      case 'meeting_link_generated':
        return <Users className="h-4 w-4 text-purple-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'schedule_created':
        return 'border-l-green-500 bg-green-50'
      case 'booking_created':
        return 'border-l-blue-500 bg-blue-50'
      case 'availability_updated':
        return 'border-l-orange-500 bg-orange-50'
      case 'availability_deleted':
        return 'border-l-red-500 bg-red-50'
      case 'meeting_link_generated':
        return 'border-l-purple-500 bg-purple-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getNotificationPriority = (notification: Notification) => {
    if (notification.data?.urgency === 'high' || notification.type === 'availability_deleted') {
      return 'high'
    }
    if (notification.data?.affectsExistingBooking) {
      return 'medium'
    }
    return 'normal'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const groupedNotifications = {
    all: notifications,
    unread: notifications.filter(n => !n.read),
    schedule: notifications.filter(n => n.type.includes('schedule') || n.type.includes('availability')),
    booking: notifications.filter(n => n.type.includes('booking') || n.type.includes('meeting'))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifikasi</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifications}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                Mark All Read
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          {userType === 'siswa' ? 'Notifikasi dari mentor dan sistem' : 'Notifikasi sistem dan aktivitas siswa'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({groupedNotifications.unread.length})
            </TabsTrigger>
            <TabsTrigger value="schedule">
              Schedule ({groupedNotifications.schedule.length})
            </TabsTrigger>
            <TabsTrigger value="booking">
              Booking ({groupedNotifications.booking.length})
            </TabsTrigger>
          </TabsList>

          {Object.entries(groupedNotifications).map(([key, notificationList]) => (
            <TabsContent key={key} value={key} className="space-y-3 max-h-96 overflow-y-auto">
              {notificationList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No notifications in this category</p>
                </div>
              ) : (
                notificationList.map((notification) => {
                  const priority = getNotificationPriority(notification)
                  
                  return (
                    <div
                      key={notification.id}
                      className={`border-l-4 rounded-lg p-4 transition-all duration-200 ${
                        getNotificationColor(notification.type)
                      } ${!notification.read ? 'shadow-md' : 'opacity-75'} ${
                        priority === 'high' ? 'ring-2 ring-red-200' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm">
                                {notification.title}
                              </h4>
                              {priority === 'high' && (
                                <Badge variant="destructive" className="text-xs">
                                  URGENT
                                </Badge>
                              )}
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs h-6"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}