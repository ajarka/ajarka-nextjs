'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import ProfessionalCalendar from "@/components/ui/professional-calendar"
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
  CheckCircle2,
  Shield,
  AlertTriangle,
  TrendingUp,
  Award,
  Lock
} from "lucide-react"
import { motion } from "framer-motion"
import { format, addDays, startOfDay, isToday, isTomorrow, addMinutes, setHours, setMinutes } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

// Safe date parsing utility
const safeParseDate = (dateInput: string | Date | null | undefined): Date | null => {
  if (!dateInput) return null
  
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) {
    console.warn('Invalid date encountered:', dateInput)
    return null
  }
  
  return date
}
import { NotificationService } from '@/lib/notification-service'
import { useSession } from 'next-auth/react'
import { useMeetingGeneration } from '@/hooks/useMeetingGeneration'
import { AdminService, AdminPricingRule } from '@/lib/admin-service'
import { PaymentService, PaymentRequest } from '@/lib/payment-service'
import { BundleService, BundlePackage, StudentSubscription } from '@/lib/bundle-service'
import PaymentButton from '@/components/payment/payment-button'
import { StudentLevelService, MentorScheduleWithLevels, LevelCheckResult, StudentProgress } from '@/lib/student-level-service'

interface Mentor {
  id: number
  name: string
  avatar: string
  bio: string
  skills: string[]
  rating: number
  totalStudents: number
}

interface MentorSchedule extends MentorScheduleWithLevels {
  meetingLink: string
  locationId?: number
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
  const { data: session } = useSession()
  const { generateMeeting, isGenerating, error: meetingError, clearError } = useMeetingGeneration()
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
  
  // Level-based filtering state
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null)
  const [scheduleCompatibility, setScheduleCompatibility] = useState<Map<number, LevelCheckResult>>(new Map())
  const [showLevelVerificationDialog, setShowLevelVerificationDialog] = useState(false)
  const [recommendedSchedules, setRecommendedSchedules] = useState<MentorSchedule[]>([])
  const [showAllSchedules, setShowAllSchedules] = useState(false)
  
  // Admin pricing rules
  const [adminPricingRules, setAdminPricingRules] = useState<AdminPricingRule[]>([])
  
  // Bundle and subscription state
  const [bundlePackages, setBundlePackages] = useState<BundlePackage[]>([])
  const [activeSubscription, setActiveSubscription] = useState<StudentSubscription | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'per_booking' | 'bundle'>('per_booking')
  const [selectedBundle, setSelectedBundle] = useState<BundlePackage | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [currentBookingData, setCurrentBookingData] = useState<any>(null)
  
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    scheduleId: 0,
    mentorId: 0,
    selectedDate: null,
    selectedTime: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
    fetchAdminPricingRules()
    fetchBundleData()
    fetchStudentProgress()
  }, [])

  useEffect(() => {
    if (schedules.length > 0 && studentProgress) {
      checkScheduleCompatibility()
      getRecommendedSchedules()
    }
  }, [schedules, studentProgress])

  const fetchAdminPricingRules = async () => {
    try {
      const rules = await AdminService.getPricingRules()
      setAdminPricingRules(rules)
    } catch (error) {
      console.error('Error fetching admin pricing rules:', error)
    }
  }

  const fetchBundleData = async () => {
    try {
      const [bundles, subscription] = await Promise.all([
        BundleService.getAllBundlePackages(),
        BundleService.getActiveSubscription(studentId)
      ])
      
      setBundlePackages(bundles)
      setActiveSubscription(subscription)
    } catch (error) {
      console.error('Error fetching bundle data:', error)
    }
  }

  const fetchStudentProgress = async () => {
    try {
      const progress = await StudentLevelService.getStudentProgress(studentId)
      setStudentProgress(progress)
    } catch (error) {
      console.error('Error fetching student progress:', error)
    }
  }

  const checkScheduleCompatibility = async () => {
    try {
      const compatibilityMap = new Map<number, LevelCheckResult>()
      
      for (const schedule of schedules) {
        const levelCheck = await StudentLevelService.checkLevelRequirement(studentId, schedule)
        compatibilityMap.set(schedule.id, levelCheck)
      }
      
      setScheduleCompatibility(compatibilityMap)
    } catch (error) {
      console.error('Error checking schedule compatibility:', error)
    }
  }

  const getRecommendedSchedules = async () => {
    try {
      const recommended = await StudentLevelService.getRecommendedSchedules(studentId, schedules)
      setRecommendedSchedules(recommended)
    } catch (error) {
      console.error('Error getting recommended schedules:', error)
    }
  }

  const handleLevelVerificationRequest = async (targetLevel: number) => {
    try {
      await StudentLevelService.requestLevelVerification(studentId, targetLevel)
      setShowLevelVerificationDialog(false)
      alert('Level verification request submitted! We will review your request and notify you.')
      
      // Refresh compatibility checks
      await checkScheduleCompatibility()
    } catch (error) {
      console.error('Error requesting level verification:', error)
      alert('Failed to submit level verification request. Please try again.')
    }
  }

  const calculateSchedulePrice = (schedule: MentorSchedule): number => {
    if (!schedule || !schedule.materials || schedule.materials.length === 0) return 150000 // Default price
    
    return AdminService.calculateSessionPrice(adminPricingRules, {
      materials: schedule.materials,
      duration: schedule.duration,
      isOnline: schedule.meetingType === 'online',
      sessionType: 'mentoring'
    })
  }

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
      
      // Filter out bookings with invalid dates
      const validBookings = bookingsData.filter((booking: Booking) => {
        return safeParseDate(booking.bookingDate) !== null
      })
      
      setBookings(validBookings)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAvailableDates = () => {
    if (!selectedSchedule) {
      return
    }

    const dates: Date[] = []
    const today = startOfDay(new Date())
    
    // Calculate available dates for the next 60 days
    for (let i = 0; i < 60; i++) {
      const checkDate = addDays(today, i)
      const dayOfWeek = checkDate.getDay()
      
      // Check if mentor has availability on this day of week for this schedule
      const hasAvailability = availabilities.some(avail => 
        avail.scheduleId === parseInt(selectedSchedule.id.toString()) &&
        avail.dayOfWeek === dayOfWeek &&
        avail.isActive
      )
      
      if (hasAvailability) {
        dates.push(checkDate)
      }
    }
    
    setAvailableDates(dates)
  }

  const getDateAvailabilityStatus = (date: Date) => {
    if (!selectedSchedule) return { status: 'unavailable', availableSlots: 0, totalSlots: 0 }
    
    const dayOfWeek = date.getDay()
    const dateString = format(date, 'yyyy-MM-dd')
    
    // Get availability slots for this day and schedule
    const relevantAvailabilities = availabilities.filter(
      avail => avail.scheduleId === selectedSchedule.id && 
      avail.dayOfWeek === dayOfWeek &&
      avail.isActive
    )

    if (relevantAvailabilities.length === 0) {
      return { status: 'unavailable', availableSlots: 0, totalSlots: 0 }
    }

    let totalSlots = 0
    let availableSlots = 0

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
            
            // Validate booking date
            if (!booking.bookingDate) {
              return false
            }
            
            const bookingDate = new Date(booking.bookingDate)
            if (isNaN(bookingDate.getTime())) {
              console.warn('Invalid booking date found:', booking.bookingDate, 'for booking:', booking.id)
              return false
            }
            
            return format(bookingDate, 'yyyy-MM-dd') === dateString && 
                   format(bookingDate, 'HH:mm') === timeString
          })
          
          totalSlots += selectedSchedule.maxCapacity
          const currentBookings = existingBookings.length
          availableSlots += Math.max(0, selectedSchedule.maxCapacity - currentBookings)
        }
        currentTime = addMinutes(currentTime, slotDuration)
      }
    })

    if (availableSlots === 0) {
      return { status: 'full', availableSlots: 0, totalSlots }
    } else if (availableSlots === totalSlots) {
      return { status: 'available', availableSlots, totalSlots }
    } else {
      return { status: 'partial', availableSlots, totalSlots }
    }
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
            
            // Validate booking date
            if (!booking.bookingDate) {
              return false
            }
            
            const bookingDate = new Date(booking.bookingDate)
            if (isNaN(bookingDate.getTime())) {
              console.warn('Invalid booking date found:', booking.bookingDate, 'for booking:', booking.id)
              return false
            }
            
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

  const openBookingDialog = async (mentor: Mentor, schedule: MentorSchedule) => {
    // Check level requirements before opening booking dialog
    const levelCheck = scheduleCompatibility.get(schedule.id)
    if (levelCheck && !levelCheck.canBook) {
      alert(`Unable to book: ${levelCheck.reason}\n\nSuggested action: ${levelCheck.suggestedAction}`)
      
      // If level verification is allowed, offer the option
      if (schedule.allowLevelJumpers && levelCheck.reason?.includes('level')) {
        const shouldRequestVerification = window.confirm(
          'Would you like to request level verification to access this session?'
        )
        if (shouldRequestVerification) {
          await handleLevelVerificationRequest(levelCheck.requiredLevel)
        }
      }
      return
    }

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

  const handlePaymentSuccess = (transactionId: string) => {
    setShowPaymentDialog(false)
    setShowBookingDialog(false)
    // Refresh data and show success message
    fetchData()
    fetchBundleData()
    alert('Booking successful! Payment confirmed.')
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    alert(`Payment failed: ${error}`)
  }

  const processSubscriptionBooking = async () => {
    if (!activeSubscription || !currentBookingData) return

    try {
      // Create the actual booking
      const response = await fetch('http://localhost:3001/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentBookingData,
          paymentStatus: 'paid',
          status: 'confirmed'
        })
      })

      if (response.ok) {
        const bookingData = await response.json()
        
        // Use one session from subscription
        await BundleService.useSubscriptionSession(activeSubscription.id, bookingData.id)
        
        // Send notifications and create calendar event
        await handlePostBookingActions(bookingData)
        
        setShowBookingDialog(false)
        fetchData()
        fetchBundleData()
        alert('Session booked using your subscription!')
      }
    } catch (error) {
      console.error('Error processing subscription booking:', error)
      alert('Failed to process subscription booking')
    }
  }

  const handlePostBookingActions = async (bookingData: any) => {
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

    // Send notifications
    if (selectedMentor && session?.user) {
      try {
        await NotificationService.notifyBookingCreated(
          session.user.id,
          session.user.name || 'Student',
          selectedMentor.id.toString(),
          bookingData.id.toString(),
          selectedSchedule!.title,
          bookingData.bookingDate,
          bookingData.meetingLink,
          selectedSchedule!.meetingProvider
        )
      } catch (notificationError) {
        console.warn('Failed to send notification:', notificationError)
      }
    }
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

      let meetingLink = selectedSchedule.meetingLink
      let generatedMeetingData: any = null

      // Generate meeting link automatically for online sessions
      if (selectedSchedule.meetingType === 'online' && selectedMentor && session?.user?.email) {
        try {
          clearError()
          
          // Get mentor email - you might need to fetch this from the mentor data
          const mentorEmail = `mentor${selectedMentor.id}@ajarka.com` // placeholder - replace with real email
          const studentEmail = session.user.email

          const meetingDetails = {
            title: `${selectedSchedule.title} - ${selectedMentor.name} & ${session.user.name}`,
            description: `Mentoring session: ${selectedSchedule.title}\n\nMentor: ${selectedMentor.name}\nStudent: ${session.user.name}\n\nNotes: ${bookingForm.notes}`,
            startTime: bookingDate.toISOString(),
            endTime: endDate.toISOString(),
            mentorEmail,
            studentEmail,
            duration: selectedSchedule.duration
          }

          const meetingResult = await generateMeeting(selectedSchedule.meetingProvider, meetingDetails)
          
          if (meetingResult) {
            meetingLink = meetingResult.joinUrl
            generatedMeetingData = meetingResult
          }
        } catch (meetingError) {
          console.warn('Failed to generate meeting link, using fallback:', meetingError)
          // Continue with booking even if meeting generation fails
        }
      }

      const bookingPrice = calculateSchedulePrice(selectedSchedule)
      const newBooking = {
        mentorId: bookingForm.mentorId,
        studentId,
        scheduleId: bookingForm.scheduleId,
        bookingDate: bookingDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: selectedSchedule.duration,
        status: 'pending',
        meetingLink,
        meetingId: generatedMeetingData?.meetingId,
        meetingProvider: selectedSchedule.meetingProvider,
        meetingPassword: generatedMeetingData?.password,
        studentNotes: bookingForm.notes,
        price: bookingPrice,
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Store booking data for payment processing
      setCurrentBookingData(newBooking)

      // Check if student wants to use subscription
      if (selectedPaymentMethod === 'bundle' && activeSubscription && activeSubscription.remainingSessions > 0) {
        await processSubscriptionBooking()
        return
      }

      // Show payment dialog for per-booking payment
      if (selectedPaymentMethod === 'per_booking') {
        setShowPaymentDialog(true)
        setBooking(false)
        return
      }

      // This should not happen, but handle as fallback
      const response = await fetch('http://localhost:3001/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      })

      if (response.ok) {
        const bookingData = await response.json()
        await handlePostBookingActions(bookingData)
        await fetchData()
        setShowBookingDialog(false)
        resetBookingForm()
      }
    } catch (error) {
      console.error('Error creating booking:', error)
    } finally {
      setBooking(false)
    }
  }

  const resetBookingForm = () => {
    setBookingForm({
      scheduleId: 0,
      mentorId: 0,
      selectedDate: null,
      selectedTime: '',
      notes: ''
    })
    setSelectedPaymentMethod('per_booking')
    setSelectedBundle(null)
    setCurrentBookingData(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
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

  const getCalendarEvents = () => {
    if (!selectedSchedule) return []
    
    const events: any[] = []
    
    // Create events for available time slots
    availableDates.forEach(date => {
      const dayOfWeek = date.getDay()
      const relevantAvailabilities = availabilities.filter(
        avail => avail.scheduleId === selectedSchedule.id && 
        avail.dayOfWeek === dayOfWeek &&
        avail.isActive
      )

      relevantAvailabilities.forEach(availability => {
        const [startHour, startMinute] = availability.startTime.split(':').map(Number)
        const [endHour, endMinute] = availability.endTime.split(':').map(Number)
        
        let currentTime = new Date(date)
        currentTime.setHours(startHour, startMinute, 0, 0)
        
        const endTime = new Date(date)
        endTime.setHours(endHour, endMinute, 0, 0)
        
        while (currentTime < endTime) {
          const slotEnd = addMinutes(currentTime, selectedSchedule.duration)
          if (slotEnd <= endTime) {
            const dateString = format(date, 'yyyy-MM-dd')
            const timeString = format(currentTime, 'HH:mm')
            
            // Check existing bookings for this slot
            const existingBookings = bookings.filter(booking => {
              if (booking.scheduleId !== selectedSchedule.id || booking.status === 'cancelled') {
                return false
              }
              
              // Validate booking date
              const bookingDate = safeParseDate(booking.bookingDate)
              if (!bookingDate) {
                return false
              }
              
              return format(bookingDate, 'yyyy-MM-dd') === dateString && 
                     format(bookingDate, 'HH:mm') === timeString
            })
            
            const currentBookings = existingBookings.length
            const isAvailable = currentBookings < selectedSchedule.maxCapacity
            
            events.push({
              id: `${selectedSchedule.id}-${dateString}-${timeString}`,
              title: isAvailable ? 
                `${timeString} (${selectedSchedule.maxCapacity - currentBookings} spots left)` :
                `${timeString} (Full)`,
              start: new Date(currentTime),
              end: new Date(slotEnd),
              resource: {
                type: isAvailable ? 'available' : 'booked',
                capacity: selectedSchedule.maxCapacity,
                currentBookings: currentBookings,
                price: calculateSchedulePrice(selectedSchedule),
                mentorName: selectedMentor?.name,
                timeSlot: timeString,
                date: dateString
              }
            })
          }
          currentTime = addMinutes(currentTime, selectedSchedule.duration)
        }
      })
    })
    
    return events
  }

  const handleCalendarSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    const slotDate = startOfDay(slotInfo.start)
    const isAvailable = isDateAvailable(slotDate)
    
    if (isAvailable) {
      setBookingForm(prev => ({
        ...prev,
        selectedDate: slotDate,
        selectedTime: format(slotInfo.start, 'HH:mm')
      }))
    }
  }

  const handleCalendarEventSelect = (event: any) => {
    if (event.resource?.type === 'available') {
      setBookingForm(prev => ({
        ...prev,
        selectedDate: startOfDay(event.start),
        selectedTime: event.resource.timeSlot
      }))
    }
  }

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getScheduleDisplayData = (schedule: MentorSchedule) => {
    const levelCheck = scheduleCompatibility.get(schedule.id)
    const isRecommended = recommendedSchedules.some(rec => rec.id === schedule.id)
    
    return {
      levelCheck,
      isRecommended,
      canBook: levelCheck?.canBook ?? true,
      levelStatus: levelCheck ? {
        requiredLevel: levelCheck.requiredLevel,
        studentLevel: levelCheck.studentLevel,
        hasVerification: levelCheck.hasVerification
      } : null
    }
  }

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
        
        {/* Student Level Display */}
        {studentProgress && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Your Level: {studentProgress.currentLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-700">
                  Skills: {studentProgress.skillsAcquired.slice(0, 3).join(', ')}
                  {studentProgress.skillsAcquired.length > 3 && ` +${studentProgress.skillsAcquired.length - 3} more`}
                </span>
              </div>
              {studentProgress.averageScore > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-700">Average Score: {studentProgress.averageScore}%</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
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
        
        {/* Smart Filtering Toggle */}
        {recommendedSchedules.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant={!showAllSchedules ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAllSchedules(false)}
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              Recommended ({recommendedSchedules.length})
            </Button>
            <Button
              variant={showAllSchedules ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAllSchedules(true)}
              className="gap-2"
            >
              All Sessions ({schedules.length})
            </Button>
          </div>
        )}
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor, index) => {
          const mentorSchedules = schedules.filter(s => s.mentorId === parseInt(mentor.id.toString()))
          
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
                        mentorSchedules
                          .filter(schedule => showAllSchedules || recommendedSchedules.some(rec => rec.id === schedule.id))
                          .slice(0, showAllSchedules ? 3 : 2)
                          .map((schedule) => {
                            const displayData = getScheduleDisplayData(schedule)
                            const levelCheck = displayData.levelCheck
                            
                            return (
                              <div
                                key={schedule.id}
                                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                                  displayData.canBook 
                                    ? 'hover:bg-muted/50 border-gray-200' 
                                    : 'border-red-200 bg-red-50 opacity-75'
                                } ${
                                  displayData.isRecommended ? 'ring-2 ring-blue-200 bg-blue-50' : ''
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-sm">{schedule.title}</p>
                                    {displayData.isRecommended && (
                                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Recommended
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* Level Requirements Display */}
                                  {levelCheck && (schedule.requiredLevel || schedule.autoLevelCheck) && (
                                    <div className="mb-2">
                                      <div className={`flex items-center gap-1 text-xs ${
                                        levelCheck.canBook ? 'text-green-700' : 'text-red-700'
                                      }`}>
                                        {levelCheck.canBook ? (
                                          <>
                                            <CheckCircle2 className="h-3 w-3" />
                                            <span>Level requirement met</span>
                                          </>
                                        ) : (
                                          <>
                                            {schedule.allowLevelJumpers ? (
                                              <AlertTriangle className="h-3 w-3" />
                                            ) : (
                                              <Lock className="h-3 w-3" />
                                            )}
                                            <span>
                                              Requires Level {levelCheck.requiredLevel} (You: Level {levelCheck.studentLevel})
                                            </span>
                                          </>
                                        )}
                                        {levelCheck.hasVerification && (
                                          <Badge variant="outline" className="text-xs">
                                            Under Review
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Materials Display */}
                                  {schedule.materials && schedule.materials.length > 0 && (
                                    <div className="mb-1">
                                      <div className="flex flex-wrap gap-1">
                                        {schedule.materials.slice(0, 3).map((material, index) => (
                                          <span key={index} className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">
                                            {material}
                                          </span>
                                        ))}
                                        {schedule.materials.length > 3 && (
                                          <span className="text-xs text-muted-foreground">+{schedule.materials.length - 3}</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
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
                                      Rp {calculateSchedulePrice(schedule).toLocaleString('id-ID')}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => openBookingDialog(mentor, schedule)}
                                  disabled={!displayData.canBook}
                                  className={displayData.canBook ? '' : 'opacity-50'}
                                >
                                  {displayData.canBook ? 'Book' : 'Level Required'}
                                </Button>
                              </div>
                            )
                          })
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
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <DialogTitle className="text-xl">Book Session with {selectedMentor?.name}</DialogTitle>
            <DialogDescription className="text-base">
              {selectedSchedule?.title} - {selectedSchedule?.duration} minutes
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto min-h-0 p-6">
            {/* Payment Method Selection */}
            {(activeSubscription || bundlePackages.length > 0) && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-3">Payment Options</h4>
                
                <div className="space-y-3">
                  {/* Per Booking Option */}
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-white/50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="per_booking"
                      checked={selectedPaymentMethod === 'per_booking'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as any)}
                      className="text-purple-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Pay Per Session</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(calculateSchedulePrice(selectedSchedule!))} per session
                      </p>
                    </div>
                  </label>

                  {/* Active Subscription Option */}
                  {activeSubscription && activeSubscription.remainingSessions > 0 && (
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-white/50 transition-colors border-green-300 bg-green-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bundle"
                        checked={selectedPaymentMethod === 'bundle'}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value as any)}
                        className="text-green-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-green-800">Use Active Subscription</p>
                        <p className="text-sm text-green-600">
                          {activeSubscription.bundleName} - {activeSubscription.remainingSessions} sessions remaining
                        </p>
                        <div className="mt-2 bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(activeSubscription.remainingSessions / activeSubscription.totalSessions) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <Badge className="bg-green-600 text-white">FREE</Badge>
                    </label>
                  )}

                  {/* Bundle Purchase Options */}
                  {bundlePackages.length > 0 && !activeSubscription && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-purple-700">Or purchase a bundle:</p>
                      {bundlePackages.slice(0, 3).map((bundle) => (
                        <label key={bundle.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-white/50 transition-colors border-blue-300 bg-blue-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={`bundle_${bundle.id}`}
                            checked={selectedBundle?.id === bundle.id}
                            onChange={(e) => {
                              setSelectedBundle(bundle)
                              setSelectedPaymentMethod('bundle')
                            }}
                            className="text-blue-600"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-blue-800">{bundle.name}</p>
                            <p className="text-sm text-blue-600">
                              {bundle.sessionCount} sessions • {bundle.validityDays} days validity
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {bundle.discountPercentage > 0 && (
                                <span className="text-xs line-through text-gray-500">
                                  {formatCurrency(bundle.originalPrice)}
                                </span>
                              )}
                              <span className="font-bold text-blue-800">
                                {formatCurrency(bundle.finalPrice)}
                              </span>
                              {bundle.discountPercentage > 0 && (
                                <Badge className="bg-red-500 text-white text-xs">
                                  -{bundle.discountPercentage}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Session Info Bar */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{selectedSchedule?.duration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Max {selectedSchedule?.maxCapacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Rp {calculateSchedulePrice(selectedSchedule!).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSchedule?.meetingType === 'online' ? 
                    <Video className="h-4 w-4 text-blue-600" /> : 
                    <Globe className="h-4 w-4 text-blue-600" />
                  }
                  <span className="font-medium">
                    {selectedSchedule?.meetingType === 'online' 
                      ? `Online via ${selectedSchedule.meetingProvider === 'zoom' ? 'Zoom' : 'Google Meet'}`
                      : 'Tatap Muka'
                    }
                  </span>
                </div>
              </div>
              
              {/* Level Requirements Display */}
              {selectedSchedule && studentProgress && (selectedSchedule.requiredLevel || selectedSchedule.autoLevelCheck) && (
                <div className="p-3 bg-white border border-blue-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Level Requirements</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Required Level:</span>
                      <span className="font-medium ml-2">{selectedSchedule.requiredLevel || 1}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Your Level:</span>
                      <span className={`font-medium ml-2 ${
                        studentProgress.currentLevel >= (selectedSchedule.requiredLevel || 1) 
                          ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {studentProgress.currentLevel}
                      </span>
                    </div>
                  </div>
                  {selectedSchedule.maxLevelGap && (
                    <div className="mt-2 text-xs text-gray-600">
                      Max level gap for group sessions: {selectedSchedule.maxLevelGap} levels
                    </div>
                  )}
                </div>
              )}

              {/* Materials covered in this session */}
              {selectedSchedule?.materials && selectedSchedule.materials.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-blue-800">Materials covered in this session:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSchedule.materials.map((material, index) => (
                      <span key={index} className="bg-white text-blue-800 px-2 py-1 rounded text-sm border border-blue-200">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Step 1: Select Date
              </Label>
              
              {/* Availability Legend */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Partially Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                    <span>Fully Booked</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {availableDates.slice(0, 15).map((date) => {
                  const isSelected = bookingForm.selectedDate && 
                    format(date, 'yyyy-MM-dd') === format(bookingForm.selectedDate, 'yyyy-MM-dd')
                  const availability = getDateAvailabilityStatus(date)
                  
                  // Define colors and styles based on availability
                  const getStatusStyle = (status: string, selected: boolean) => {
                    if (selected) return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                    
                    switch (status) {
                      case 'available':
                        return 'border-green-300 bg-green-50 hover:bg-green-100 text-green-800'
                      case 'partial':
                        return 'border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-800'
                      case 'full':
                        return 'border-red-300 bg-red-50 hover:bg-red-100 text-red-800 opacity-75'
                      default:
                        return 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500'
                    }
                  }

                  const getStatusIndicator = (status: string) => {
                    switch (status) {
                      case 'available':
                        return <div className="w-2 h-2 bg-green-500 rounded-full absolute top-1 right-1"></div>
                      case 'partial':
                        return <div className="w-2 h-2 bg-orange-500 rounded-full absolute top-1 right-1"></div>
                      case 'full':
                        return <div className="w-2 h-2 bg-red-500 rounded-full absolute top-1 right-1"></div>
                      default:
                        return null
                    }
                  }
                  
                  return (
                    <Button
                      key={format(date, 'yyyy-MM-dd')}
                      variant="outline"
                      className={`h-auto py-3 px-2 flex flex-col gap-1 relative transition-all duration-200 ${
                        getStatusStyle(availability.status, isSelected)
                      }`}
                      onClick={() => handleDateSelect(date)}
                      disabled={availability.status === 'full'}
                    >
                      {getStatusIndicator(availability.status)}
                      <span className="text-xs font-medium">
                        {format(date, 'MMM', { locale: localeId })}
                      </span>
                      <span className="text-lg font-bold">
                        {format(date, 'd')}
                      </span>
                      <span className="text-xs">
                        {format(date, 'EEE', { locale: localeId })}
                      </span>
                      {availability.status !== 'unavailable' && (
                        <span className="text-xs font-medium mt-1">
                          {availability.availableSlots}/{availability.totalSlots} slots
                        </span>
                      )}
                    </Button>
                  )
                })}
              </div>
              {availableDates.length > 15 && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Showing first 15 available dates
                </p>
              )}
            </div>

            {/* Time Selection */}
            {bookingForm.selectedDate && (
              <div className="mb-6">
                <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Step 2: Select Time
                </Label>
                {availableTimeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {availableTimeSlots.map((time) => {
                      const isSelected = bookingForm.selectedTime === time
                      
                      // Get booking info for this time slot
                      const dateString = format(bookingForm.selectedDate!, 'yyyy-MM-dd')
                      const existingBookings = bookings.filter(booking => {
                        if (booking.scheduleId !== selectedSchedule!.id || booking.status === 'cancelled') {
                          return false
                        }
                        
                        // Validate booking date
                        const bookingDate = safeParseDate(booking.bookingDate)
                        if (!bookingDate) {
                          return false
                        }
                        
                        return format(bookingDate, 'yyyy-MM-dd') === dateString && 
                               format(bookingDate, 'HH:mm') === time
                      })
                      
                      const maxCapacity = selectedSchedule?.maxCapacity || 1
                      const currentBookings = existingBookings.length
                      const availableSpots = Math.max(0, maxCapacity - currentBookings)
                      const isNearlyFull = availableSpots <= 1 && availableSpots > 0
                      
                      return (
                        <Button
                          key={time}
                          variant={isSelected ? "default" : "outline"}
                          className={`py-3 px-2 h-auto flex flex-col gap-1 relative transition-all duration-200 ${
                            isSelected 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : isNearlyFull
                              ? 'border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-800'
                              : 'border-green-300 bg-green-50 hover:bg-green-100 text-green-800'
                          }`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          {/* Status indicator dot */}
                          {!isSelected && (
                            <div className={`w-2 h-2 rounded-full absolute top-1 right-1 ${
                              isNearlyFull ? 'bg-orange-500' : 'bg-green-500'
                            }`}></div>
                          )}
                          
                          <span className="font-semibold">{time}</span>
                          <span className="text-xs">
                            {availableSpots} spot{availableSpots !== 1 ? 's' : ''} left
                          </span>
                        </Button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No available time slots for this date</p>
                    <p className="text-sm mt-2">Try selecting a different date</p>
                  </div>
                )}
              </div>
            )}

            {/* Selected Summary */}
            {bookingForm.selectedDate && bookingForm.selectedTime && (
              <div className="mb-6 space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-800">
                        Session Confirmed for {getDateLabel(bookingForm.selectedDate)} at {bookingForm.selectedTime}
                      </h4>
                      <p className="text-sm text-green-600 mt-1">
                        Duration: {selectedSchedule?.duration} minutes • 
                        Price: Rp {calculateSchedulePrice(selectedSchedule!).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedSchedule?.meetingType === 'online' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Video className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">
                          {selectedSchedule.meetingProvider === 'zoom' ? 'Zoom' : 'Google Meet'} Link Otomatis
                        </p>
                        <p className="mt-1">
                          Link meeting akan dibuat secara otomatis dan dikirim melalui email serta notifikasi setelah booking dikonfirmasi.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {meetingError && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium">Meeting Link Generation Issue</p>
                        <p className="mt-1">
                          {meetingError}. Anda masih bisa melanjutkan booking, link meeting akan dibuat manual oleh mentor.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes Section */}
            <div>
              <Label htmlFor="notes" className="text-base font-semibold mb-3 flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                  3
                </div>
                Notes for Mentor (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Let your mentor know what you'd like to focus on during this session..."
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                className="min-h-[100px]"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50 flex justify-between">
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createBooking} 
              disabled={booking || isGenerating || !bookingForm.selectedDate || !bookingForm.selectedTime}
              className="gap-2 min-w-[180px]"
              size="lg"
            >
              {booking || isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {isGenerating ? 'Generating Meeting...' : 'Booking...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {selectedPaymentMethod === 'bundle' && activeSubscription ? 'Book with Subscription' : 'Continue to Payment'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Secure payment for your mentoring session
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {currentBookingData && selectedSchedule && selectedMentor && session?.user && (
              <>                
                {selectedBundle ? (
                  <PaymentButton
                    paymentRequest={{
                      studentId,
                      mentorId: 0, // Bundle payments are not mentor-specific
                      scheduleId: 0,
                      sessionTitle: `Bundle: ${selectedBundle.name}`,
                      amount: selectedBundle.finalPrice,
                      mentorFee: 0,
                      adminFee: selectedBundle.finalPrice,
                      bookingDetails: {
                        date: format(currentBookingData.bookingDate, 'yyyy-MM-dd'),
                        time: format(currentBookingData.bookingDate, 'HH:mm'),
                        duration: selectedBundle.sessionCount * selectedSchedule.duration,
                        meetingType: 'bundle',
                        materials: selectedBundle.features,
                        notes: `Bundle subscription: ${selectedBundle.description}`
                      },
                      studentDetails: {
                        name: session.user.name || 'Student',
                        email: session.user.email || '',
                        phone: '+6281234567890' // You might want to get this from user profile
                      }
                    }}
                    onPaymentSuccess={(transactionId) => {
                      // Create subscription after successful bundle payment
                      BundleService.createSubscription({
                        studentId,
                        bundlePackage: selectedBundle!,
                        transactionId
                      }).then(() => {
                        handlePaymentSuccess(transactionId)
                        fetchBundleData() // Refresh bundle data
                      })
                    }}
                    onPaymentError={handlePaymentError}
                  />
                ) : (
                  <PaymentButton
                    paymentRequest={{
                      studentId: currentBookingData.studentId,
                      mentorId: currentBookingData.mentorId,
                      scheduleId: currentBookingData.scheduleId,
                      sessionTitle: selectedSchedule.title,
                      amount: currentBookingData.price,
                      mentorFee: Math.round(currentBookingData.price * 0.7),
                      adminFee: Math.round(currentBookingData.price * 0.3),
                      bookingDetails: {
                        date: format(new Date(currentBookingData.bookingDate), 'yyyy-MM-dd'),
                        time: format(new Date(currentBookingData.bookingDate), 'HH:mm'),
                        duration: currentBookingData.duration,
                        meetingType: selectedSchedule.meetingType,
                        materials: selectedSchedule.materials,
                        notes: currentBookingData.studentNotes
                      },
                      studentDetails: {
                        name: session.user.name || 'Student',
                        email: session.user.email || '',
                        phone: '+6281234567890'
                      }
                    }}
                    onPaymentSuccess={async (transactionId) => {
                      try {
                        // Create the actual booking after successful payment
                        const response = await fetch('http://localhost:3001/bookings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            ...currentBookingData,
                            paymentStatus: 'paid',
                            status: 'confirmed',
                            transactionId
                          })
                        })

                        if (response.ok) {
                          const bookingData = await response.json()
                          await handlePostBookingActions(bookingData)
                          handlePaymentSuccess(transactionId)
                        }
                      } catch (error) {
                        handlePaymentError('Failed to create booking after payment')
                      }
                    }}
                    onPaymentError={handlePaymentError}
                  />
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Level Verification Dialog */}
      <Dialog open={showLevelVerificationDialog} onOpenChange={setShowLevelVerificationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Level Verification Request
            </DialogTitle>
            <DialogDescription>
              Request to verify your skills for access to higher-level sessions
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {studentProgress && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Your Current Progress</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Current Level:</span>
                    <span className="font-medium ml-2">{studentProgress.currentLevel}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Skills Acquired:</span>
                    <span className="font-medium ml-2">{studentProgress.skillsAcquired.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Average Score:</span>
                    <span className="font-medium ml-2">{studentProgress.averageScore || 0}%</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Completed Projects:</span>
                    <span className="font-medium ml-2">{studentProgress.completedProjects.length}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-2">Level Verification Process</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>You'll be given assignments and projects to demonstrate your skills</li>
                    <li>Our mentors will review your submissions</li>
                    <li>Upon approval, you'll gain access to higher-level sessions</li>
                    <li>This process typically takes 3-5 business days</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-2">What You'll Get</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Access to advanced mentoring sessions</li>
                    <li>Certification of your verified skill level</li>
                    <li>Priority booking for specialized sessions</li>
                    <li>Recognition in your learning profile</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLevelVerificationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedSchedule && handleLevelVerificationRequest(selectedSchedule.requiredLevel || 1)}
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              Submit Verification Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}