'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Calendar,
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye
} from "lucide-react"
import { motion } from "framer-motion"
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface Booking {
  id: number
  mentorId: number
  studentId: number
  scheduleId: number
  bookingDate: string
  endDate: string
  duration: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  price: number
  paymentStatus: 'pending' | 'paid' | 'failed'
}

interface MentorSchedule {
  id: number
  mentorId: number
  title: string
  description: string
  duration: number
  maxCapacity: number
  price: number
  meetingType: 'online' | 'offline'
  meetingLink: string
  timezone: string
  isActive: boolean
}

interface CapacitySlot {
  scheduleId: number
  scheduleTitle: string
  date: string
  time: string
  maxCapacity: number
  currentBookings: number
  availableSpots: number
  bookings: Booking[]
  status: 'available' | 'full' | 'almost-full'
}

export default function BookingCapacityMonitor({ mentorId }: { mentorId: number }) {
  const [capacitySlots, setCapacitySlots] = useState<CapacitySlot[]>([])
  const [schedules, setSchedules] = useState<MentorSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchCapacityData()
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchCapacityData, 30000)
    return () => clearInterval(interval)
  }, [mentorId])

  const fetchCapacityData = async () => {
    if (loading) setLoading(true)
    else setRefreshing(true)
    
    try {
      // Fetch mentor schedules
      const schedulesResponse = await fetch(`http://localhost:3001/mentor_schedules?mentorId=${mentorId}`)
      const schedulesData = await schedulesResponse.json()
      const activeSchedules = schedulesData.filter((s: MentorSchedule) => s.isActive)
      setSchedules(activeSchedules)

      // Fetch all bookings for this mentor
      const bookingsResponse = await fetch(`http://localhost:3001/bookings?mentorId=${mentorId}`)
      const bookingsData = await bookingsResponse.json()

      // Process capacity data for next 7 days
      const capacityData: CapacitySlot[] = []
      const today = new Date()
      
      for (let i = 0; i < 7; i++) {
        const checkDate = addDays(today, i)
        const dateString = format(checkDate, 'yyyy-MM-dd')
        
        activeSchedules.forEach((schedule: MentorSchedule) => {
          // Get bookings for this schedule and date
          const dayBookings = bookingsData.filter((booking: Booking) => {
            const bookingDate = new Date(booking.bookingDate)
            return booking.scheduleId === schedule.id &&
                   format(bookingDate, 'yyyy-MM-dd') === dateString &&
                   booking.status !== 'cancelled'
          })

          // Group by time slots
          const timeSlots = new Map<string, Booking[]>()
          dayBookings.forEach((booking: Booking) => {
            const timeSlot = format(new Date(booking.bookingDate), 'HH:mm')
            if (!timeSlots.has(timeSlot)) {
              timeSlots.set(timeSlot, [])
            }
            timeSlots.get(timeSlot)!.push(booking)
          })

          // Create capacity slots
          timeSlots.forEach((slotBookings, time) => {
            const currentBookings = slotBookings.length
            const availableSpots = schedule.maxCapacity - currentBookings
            let status: 'available' | 'full' | 'almost-full' = 'available'
            
            if (availableSpots === 0) {
              status = 'full'
            } else if (availableSpots <= Math.ceil(schedule.maxCapacity * 0.3)) {
              status = 'almost-full'
            }

            capacityData.push({
              scheduleId: schedule.id!,
              scheduleTitle: schedule.title,
              date: dateString,
              time,
              maxCapacity: schedule.maxCapacity,
              currentBookings,
              availableSpots,
              bookings: slotBookings,
              status
            })
          })
        })
      }

      // Sort by date and time
      capacityData.sort((a, b) => {
        const dateTimeA = new Date(`${a.date} ${a.time}`)
        const dateTimeB = new Date(`${b.date} ${b.time}`)
        return dateTimeA.getTime() - dateTimeB.getTime()
      })

      setCapacitySlots(capacityData)
    } catch (error) {
      console.error('Error fetching capacity data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'almost-full':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'full':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />
      case 'almost-full':
        return <AlertTriangle className="h-4 w-4" />
      case 'full':
        return <XCircle className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return 'Hari Ini'
    if (isTomorrow(date)) return 'Besok'
    return format(date, 'dd/MM/yyyy', { locale: localeId })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Room Capacity Monitor
            </CardTitle>
            <CardDescription>
              Real-time booking capacity for your sessions
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCapacityData}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {capacitySlots.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No upcoming sessions scheduled</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {capacitySlots.filter(s => s.status === 'available').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Available Slots</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {capacitySlots.filter(s => s.status === 'almost-full').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Almost Full</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {capacitySlots.filter(s => s.status === 'full').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Full Sessions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Capacity View */}
            <div className="space-y-4">
              <h4 className="font-medium">Upcoming Sessions</h4>
              {capacitySlots.slice(0, 10).map((slot, index) => (
                <motion.div
                  key={`${slot.scheduleId}-${slot.date}-${slot.time}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground">
                        {getDateLabel(slot.date)}
                      </span>
                      <span className="font-medium">{slot.time}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{slot.scheduleTitle}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {slot.currentBookings}/{slot.maxCapacity} booked
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {slot.availableSpots} spots left
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Progress 
                        value={(slot.currentBookings / slot.maxCapacity) * 100} 
                        className="w-16 h-2"
                      />
                      <span className="text-xs text-muted-foreground">
                        {Math.round((slot.currentBookings / slot.maxCapacity) * 100)}%
                      </span>
                    </div>
                    <Badge 
                      className={`${getStatusColor(slot.status)} gap-1`}
                    >
                      {getStatusIcon(slot.status)}
                      {slot.status === 'available' ? 'Available' : 
                       slot.status === 'almost-full' ? 'Almost Full' : 'Full'}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {capacitySlots.length > 10 && (
              <p className="text-center text-sm text-muted-foreground">
                Showing next 10 sessions • Total {capacitySlots.length} sessions scheduled
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}