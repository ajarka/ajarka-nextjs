'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Clock, 
  Users, 
  DollarSign,
  Video,
  Globe,
  Star,
  Search,
  CalendarDays,
  CheckCircle2
} from "lucide-react"
import { motion } from "framer-motion"
import { format, addDays, startOfDay, isToday, isTomorrow, addMinutes, setHours, setMinutes } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface Mentor {
  id: number
  name: string
  avatar: string
  bio: string
  skills: string[]
  rating: number
  totalStudents: number
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

interface AvailabilitySlot {
  id: number
  mentorId: number
  scheduleId: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isRecurring: boolean
  specificDate?: string
  isActive: boolean
}

interface Booking {
  id: number
  mentorId: number
  studentId: number
  scheduleId: number
  bookingDate: string
  endDate: string
  duration: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  meetingLink?: string
  studentNotes?: string
  mentorNotes?: string
  price: number
  paymentStatus: 'pending' | 'paid' | 'failed'
}

interface BookingFormData {
  scheduleId: number
  mentorId: number
  selectedDate: Date | null
  selectedTime: string
  notes: string
}

export default function StudentBookingInterface({ studentId }: { studentId: number }) {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [schedules, setSchedules] = useState<MentorSchedule[]>([])
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<MentorSchedule | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    scheduleId: 0,
    mentorId: 0,
    selectedDate: null,
    selectedTime: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedSchedule && showBookingDialog) {
      calculateAvailableDates()
    }
  }, [selectedSchedule, showBookingDialog, availabilities, bookings])

  useEffect(() => {
    if (bookingForm.selectedDate && selectedSchedule) {
      calculateAvailableTimeSlots()
    }
  }, [bookingForm.selectedDate, selectedSchedule, availabilities, bookings])

  const fetchData = async () => {
    try {
      // Fetch mentors
      const mentorsResponse = await fetch('http://localhost:3001/users?role=mentor')
      const mentorsData = await mentorsResponse.json()
      setMentors(mentorsData)

      // Fetch all schedules
      const schedulesResponse = await fetch('http://localhost:3001/mentor_schedules')
      const schedulesData = await schedulesResponse.json()
      setSchedules(schedulesData.filter((s: MentorSchedule) => s.isActive))

      // Fetch all availabilities
      const availResponse = await fetch('http://localhost:3001/mentor_availability')
      const availData = await availResponse.json()
      setAvailabilities(availData.filter((a: AvailabilitySlot) => a.isActive))

      // Fetch existing bookings
      const bookingsResponse = await fetch('http://localhost:3001/bookings')
      const bookingsData = await bookingsResponse.json()
      setBookings(bookingsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAvailableDates = () => {
    if (!selectedSchedule) return

    const dates: Date[] = []
    const today = startOfDay(new Date())
    
    // Calculate available dates for the next 30 days
    for (let i = 0; i < 30; i++) {
      const checkDate = addDays(today, i)
      const dayOfWeek = checkDate.getDay()
      
      // Check if mentor has availability on this day of week for this schedule
      const hasAvailability = availabilities.some(avail => 
        avail.scheduleId === selectedSchedule.id &&
        avail.dayOfWeek === dayOfWeek &&
        avail.isActive
      )
      
      if (hasAvailability) {
        dates.push(checkDate)
      }
    }
    
    setAvailableDates(dates)
  }

  const calculateAvailableTimeSlots = () => {
    if (!bookingForm.selectedDate || !selectedSchedule) return

    const dayOfWeek = bookingForm.selectedDate.getDay()
    const dateString = format(bookingForm.selectedDate, 'yyyy-MM-dd')
    
    // Get availability slots for this day and schedule
    const relevantAvailabilities = availabilities.filter(
      avail => avail.scheduleId === selectedSchedule.id && 
      avail.dayOfWeek === dayOfWeek &&
      avail.isActive
    )

    const timeSlots: string[] = []

    relevantAvailabilities.forEach(availability => {
      const [startHour, startMinute] = availability.startTime.split(':').map(Number)
      const [endHour, endMinute] = availability.endTime.split(':').map(Number)
      
      const slotDuration = selectedSchedule.duration
      let currentTime = setMinutes(setHours(new Date(), startHour), startMinute)
      const endTime = setMinutes(setHours(new Date(), endHour), endMinute)
      
      while (currentTime < endTime) {
        const slotEnd = addMinutes(currentTime, slotDuration)
        if (slotEnd <= endTime) {
          const timeString = format(currentTime, 'HH:mm')
          
          // Check if this time slot is already at capacity
          const existingBookings = bookings.filter(booking => {
            if (booking.scheduleId !== selectedSchedule.id || booking.status === 'cancelled') {
              return false
            }
            
            const bookingDate = new Date(booking.bookingDate)
            return format(bookingDate, 'yyyy-MM-dd') === dateString && 
                   format(bookingDate, 'HH:mm') === timeString
          })
          
          if (existingBookings.length < selectedSchedule.maxCapacity) {
            timeSlots.push(timeString)
          }
        }
        currentTime = addMinutes(currentTime, slotDuration)
      }
    })

    setAvailableTimeSlots(timeSlots.sort())
  }

  const openBookingDialog = (mentor: Mentor, schedule: MentorSchedule) => {
    setSelectedMentor(mentor)
    setSelectedSchedule(schedule)
    setBookingForm({
      scheduleId: schedule.id!,
      mentorId: mentor.id,
      selectedDate: null,
      selectedTime: '',
      notes: ''
    })
    setAvailableDates([])
    setAvailableTimeSlots([])
    setShowBookingDialog(true)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setBookingForm(prev => ({ 
        ...prev, 
        selectedDate: date,
        selectedTime: '' // Reset time selection when date changes
      }))
    }
  }

  const handleTimeSelect = (time: string) => {
    setBookingForm(prev => ({ ...prev, selectedTime: time }))
  }

  const createBooking = async () => {
    if (!bookingForm.selectedDate || !bookingForm.selectedTime || !selectedSchedule) {
      return
    }

    setBooking(true)
    try {
      const [hours, minutes] = bookingForm.selectedTime.split(':').map(Number)
      const bookingDate = new Date(bookingForm.selectedDate)
      bookingDate.setHours(hours, minutes, 0, 0)
      
      const endDate = addMinutes(bookingDate, selectedSchedule.duration)

      const newBooking = {
        mentorId: bookingForm.mentorId,
        studentId,
        scheduleId: bookingForm.scheduleId,
        bookingDate: bookingDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: selectedSchedule.duration,
        status: 'pending',
        meetingLink: selectedSchedule.meetingLink,
        studentNotes: bookingForm.notes,
        price: selectedSchedule.price,
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await fetch('http://localhost:3001/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      })

      if (response.ok) {
        const bookingData = await response.json()
        
        // Create calendar event
        try {
          const calendarResponse = await fetch('/api/calendar/create-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: bookingData.id })
          })
          
          if (calendarResponse.ok) {
            console.log('Calendar event created successfully')
          }
        } catch (calendarError) {
          console.warn('Failed to create calendar event:', calendarError)
        }

        await fetchData() // Refresh data
        setShowBookingDialog(false)
        setBookingForm({
          scheduleId: 0,
          mentorId: 0,
          selectedDate: null,
          selectedTime: '',
          notes: ''
        })
      }
    } catch (error) {
      console.error('Error creating booking:', error)
    } finally {
      setBooking(false)
    }
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEE, MMM d', { locale: localeId })
  }

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availDate => 
      format(availDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
  }

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Book Mentoring Session</h2>
        <p className="text-muted-foreground">
          Find and book sessions with our expert mentors
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mentors by name or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor, index) => {
          const mentorSchedules = schedules.filter(s => s.mentorId === mentor.id)
          
          return (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{mentor.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-orange-500 fill-current" />
                          <span className="text-sm font-medium">{mentor.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {mentor.totalStudents} students
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {mentor.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {mentor.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mentor.skills.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Available Sessions */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Available Sessions:</Label>
                    <div className="space-y-2">
                      {mentorSchedules.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No sessions available</p>
                      ) : (
                        mentorSchedules.slice(0, 2).map((schedule) => (
                          <div
                            key={schedule.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">{schedule.title}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {schedule.duration} min
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Max {schedule.maxCapacity}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  Rp {schedule.price.toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => openBookingDialog(mentor, schedule)}
                            >
                              Book
                            </Button>
                          </div>
                        ))
                      )}
                      {mentorSchedules.length > 2 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{mentorSchedules.length - 2} more sessions available
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Enhanced Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Session with {selectedMentor?.name}</DialogTitle>
            <DialogDescription>
              {selectedSchedule?.title} - {selectedSchedule?.duration} minutes
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Session Details */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedSchedule?.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Max {selectedSchedule?.maxCapacity} people</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Rp {selectedSchedule?.price.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSchedule?.meetingType === 'online' ? 
                      <Video className="h-4 w-4 text-muted-foreground" /> : 
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    }
                    <span className="capitalize">{selectedSchedule?.meetingType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Date Selection */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                <CalendarDays className="h-4 w-4" />
                Select Date
              </Label>
              <div className="border rounded-lg p-4 bg-muted/5">
                <Calendar
                  mode="single"
                  selected={bookingForm.selectedDate || undefined}
                  onSelect={handleDateSelect}
                  disabled={(date) => {
                    const today = startOfDay(new Date())
                    return date < today || !isDateAvailable(date)
                  }}
                  modifiers={{
                    available: availableDates,
                  }}
                  modifiersStyles={{
                    available: {
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      fontWeight: 'bold',
                    }
                  }}
                  className="rounded-md border-0"
                />
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span>Available dates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-muted rounded-full"></div>
                    <span>Unavailable</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Selection */}
            {bookingForm.selectedDate && availableTimeSlots.length > 0 && (
              <div>
                <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" />
                  Select Time - {getDateLabel(bookingForm.selectedDate)}
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={bookingForm.selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTimeSelect(time)}
                      className="h-10"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {bookingForm.selectedDate && availableTimeSlots.length === 0 && (
              <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg text-center">
                <p className="text-sm text-orange-800">
                  No available time slots for {getDateLabel(bookingForm.selectedDate)}. 
                  Please select a different date.
                </p>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes for Mentor (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Let your mentor know what you'd like to focus on..."
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                className="mt-2"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createBooking} 
              disabled={booking || !bookingForm.selectedDate || !bookingForm.selectedTime}
              className="gap-2"
            >
              {booking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Book Session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}