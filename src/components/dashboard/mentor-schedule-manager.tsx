'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Calendar,
  Clock, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  DollarSign,
  Video,
  Globe,
  CheckCircle,
  AlertCircle,
  BookOpen,
  MessageSquare
} from "lucide-react"
import { motion } from "framer-motion"
import { format, addDays, startOfWeek } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import Link from 'next/link'
import BookingCapacityMonitor from './booking-capacity-monitor'
import MentorScheduleCalendar from './mentor-schedule-calendar'
import { NotificationService } from '@/lib/notification-service'
import { useSession } from 'next-auth/react'
import { useMeetingGeneration } from '@/hooks/useMeetingGeneration'
import { AdminService, AdminPricingRule, AdminOfficeLocation } from '@/lib/admin-service'
import { learningService, type LearningMaterial } from '@/lib/learning-service'
import MentorScheduleDialog from './mentor-schedule-manager-dialog'
import MentorSlotRequests from './mentor-slot-requests'

interface MentorSchedule {
  id?: number
  title: string
  description: string
  duration: number
  maxCapacity: number
  materials: string[]
  materialIds?: string[] // Learning material IDs
  requiredLevel?: number // Minimum level required
  maxLevelGap?: number // Max level difference allowed between students
  verificationRequired?: boolean // Require level verification
  autoLevelCheck?: boolean // Automatically check student levels
  allowLevelJumpers?: boolean // Allow students who got level verification
  meetingType: 'online' | 'offline'
  meetingProvider: 'zoom' | 'google-meet'
  locationId?: number
  timezone: string
  isActive: boolean
}

interface AvailabilitySlot {
  id?: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isRecurring: boolean
  specificDate?: string
  isActive: boolean
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Minggu' },
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' }
]

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return { value: `${hour}:00`, label: `${hour}:00` }
})

export default function MentorScheduleManager({ mentorId }: { mentorId: number }) {
  const { data: session } = useSession()
  const { generateMeeting, isGenerating, error: meetingError, clearError } = useMeetingGeneration()
  const [schedules, setSchedules] = useState<MentorSchedule[]>([])
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [activeSchedule, setActiveSchedule] = useState<MentorSchedule | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Admin-controlled data
  const [adminPricingRules, setAdminPricingRules] = useState<AdminPricingRule[]>([])
  const [adminLocations, setAdminLocations] = useState<AdminOfficeLocation[]>([])
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0)
  const [mentorFee, setMentorFee] = useState<number>(0)
  
  // Learning materials data
  const [availableMaterials, setAvailableMaterials] = useState<LearningMaterial[]>([])
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([])
  
  const [newSchedule, setNewSchedule] = useState<MentorSchedule>({
    title: '',
    description: '',
    duration: 60,
    maxCapacity: 1,
    materials: [],
    materialIds: [],
    requiredLevel: 1,
    maxLevelGap: 2,
    verificationRequired: false,
    autoLevelCheck: true,
    allowLevelJumpers: false,
    meetingType: 'online',
    meetingProvider: 'google-meet',
    timezone: 'Asia/Jakarta',
    isActive: true
  })

  const [newAvailability, setNewAvailability] = useState<AvailabilitySlot>({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true,
    isActive: true
  })

  useEffect(() => {
    fetchSchedules()
    fetchAdminSettings()
    fetchLearningMaterials()
  }, [mentorId])

  useEffect(() => {
    // Recalculate pricing when schedule data changes
    const hasMaterials = (newSchedule.materialIds && newSchedule.materialIds.length > 0) || newSchedule.materials.length > 0
    if (hasMaterials && newSchedule.duration > 0) {
      calculatePricing()
    }
  }, [newSchedule.materials, newSchedule.materialIds, newSchedule.duration, newSchedule.meetingType, adminPricingRules, availableMaterials])

  const fetchAdminSettings = async () => {
    try {
      const [pricingRules, locations] = await Promise.all([
        AdminService.getPricingRules(),
        AdminService.getOfficeLocations()
      ])
      setAdminPricingRules(pricingRules)
      setAdminLocations(locations)
    } catch (error) {
      console.error('Error fetching admin settings:', error)
    }
  }

  const fetchLearningMaterials = async () => {
    try {
      const materials = await learningService.getLearningMaterials()
      setAvailableMaterials(materials.filter(m => m.isActive))
    } catch (error) {
      console.error('Error fetching learning materials:', error)
    }
  }

  const calculatePricing = () => {
    const materialsToUse = newSchedule.materialIds && newSchedule.materialIds.length > 0 
      ? newSchedule.materialIds.map(id => {
          const material = availableMaterials.find(m => m.id === id)
          return material?.title || id
        })
      : newSchedule.materials
    
    if (adminPricingRules.length === 0 || materialsToUse.length === 0) return

    const price = AdminService.calculateSessionPrice(adminPricingRules, {
      materials: materialsToUse,
      duration: newSchedule.duration,
      isOnline: newSchedule.meetingType === 'online',
      sessionType: 'mentoring'
    })

    const settings = AdminService.getSettings()
    const mentorFeeAmount = AdminService.calculateMentorFee(price, settings.mentorFeePercentage)

    setCalculatedPrice(price)
    setMentorFee(mentorFeeAmount)
  }

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`http://localhost:3001/mentor_schedules?mentorId=${mentorId}`)
      const schedulesData = await response.json()
      setSchedules(schedulesData)
      
      if (schedulesData.length > 0) {
        setActiveSchedule(schedulesData[0])
        fetchAvailabilities(schedulesData[0].id)
        fetchBookings()
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailabilities = async (scheduleId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/mentor_availability?scheduleId=${scheduleId}`)
      const availData = await response.json()
      setAvailabilities(availData)
    } catch (error) {
      console.error('Error fetching availabilities:', error)
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await fetch(`http://localhost:3001/bookings?mentorId=${mentorId}`)
      const bookingsData = await response.json()
      setBookings(bookingsData)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const createSchedule = async () => {
    setSaving(true)
    try {
      const response = await fetch('http://localhost:3001/mentor_schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSchedule,
          mentorId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        const scheduleData = await response.json()
        
        // Send notifications to all students
        if (session?.user) {
          try {
            await NotificationService.notifyScheduleCreated(
              session.user.id,
              session.user.name || 'Mentor',
              scheduleData.id.toString(),
              newSchedule.title
            )
            console.log('Notifications sent to students')
          } catch (notificationError) {
            console.warn('Failed to send notifications:', notificationError)
          }
        }

        await fetchSchedules()
        setNewSchedule({
          title: '',
          description: '',
          duration: 60,
          maxCapacity: 1,
          materials: [],
          meetingType: 'online',
          meetingProvider: 'google-meet',
          timezone: 'Asia/Jakarta',
          isActive: true
        })
        setCalculatedPrice(0)
        setMentorFee(0)
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Error creating schedule:', error)
    } finally {
      setSaving(false)
    }
  }

  const addAvailability = async (availabilityData: any) => {
    if (!activeSchedule?.id) return
    
    setSaving(true)
    try {
      const response = await fetch('http://localhost:3001/mentor_availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...availabilityData,
          mentorId,
          isActive: true,
          createdAt: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        await fetchAvailabilities(activeSchedule.id)
      }
    } catch (error) {
      console.error('Error adding availability:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  const updateAvailability = async (availabilityId: number, availabilityData: any) => {
    if (!activeSchedule?.id) return
    
    setSaving(true)
    try {
      // Get current availability data for comparison
      const currentResponse = await fetch(`http://localhost:3001/mentor_availability/${availabilityId}`)
      const currentAvailability = await currentResponse.json()

      const response = await fetch(`http://localhost:3001/mentor_availability/${availabilityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...availabilityData,
          mentorId,
          id: availabilityId,
          isActive: true,
          updatedAt: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        // Send notifications to students about the availability update
        if (session?.user) {
          try {
            await NotificationService.notifyAvailabilityUpdated(
              session.user.id,
              session.user.name || 'Mentor',
              activeSchedule.id.toString(),
              activeSchedule.title,
              {
                dayOfWeek: currentAvailability.dayOfWeek,
                startTime: currentAvailability.startTime,
                endTime: currentAvailability.endTime
              },
              {
                dayOfWeek: availabilityData.dayOfWeek,
                startTime: availabilityData.startTime,
                endTime: availabilityData.endTime
              }
            )
            console.log('Availability update notifications sent to students')
          } catch (notificationError) {
            console.warn('Failed to send availability update notifications:', notificationError)
          }
        }

        await fetchAvailabilities(activeSchedule.id)
      }
    } catch (error) {
      console.error('Error updating availability:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  const deleteAvailability = async (availabilityId: number) => {
    if (!activeSchedule?.id) return
    
    try {
      // Get availability data before deletion for notifications
      const availabilityResponse = await fetch(`http://localhost:3001/mentor_availability/${availabilityId}`)
      const availabilityData = await availabilityResponse.json()

      const response = await fetch(`http://localhost:3001/mentor_availability/${availabilityId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Send notifications to students about the availability deletion
        if (session?.user && availabilityData) {
          try {
            await NotificationService.notifyAvailabilityDeleted(
              session.user.id,
              session.user.name || 'Mentor',
              activeSchedule.id.toString(),
              activeSchedule.title,
              {
                dayOfWeek: availabilityData.dayOfWeek,
                startTime: availabilityData.startTime,
                endTime: availabilityData.endTime
              }
            )
            console.log('Availability deletion notifications sent to students')
          } catch (notificationError) {
            console.warn('Failed to send availability deletion notifications:', notificationError)
          }
        }

        await fetchAvailabilities(activeSchedule.id)
      }
    } catch (error) {
      console.error('Error deleting availability:', error)
    }
  }

  const toggleScheduleActive = async (schedule: MentorSchedule) => {
    try {
      const response = await fetch(`http://localhost:3001/mentor_schedules/${schedule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...schedule,
          isActive: !schedule.isActive,
          updatedAt: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        await fetchSchedules()
      }
    } catch (error) {
      console.error('Error updating schedule:', error)
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manajemen Jadwal</h2>
          <p className="text-muted-foreground">
            Kelola jadwal dan ketersediaan mentoring Anda
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="#slot-requests">
              <MessageSquare className="h-4 w-4" />
              Slot Requests
            </Link>
          </Button>
          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Buat Jadwal Baru
          </Button>
        </div>
        
        <MentorScheduleDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          newSchedule={newSchedule}
          setNewSchedule={setNewSchedule}
          availableMaterials={availableMaterials}
          adminPricingRules={adminPricingRules}
          adminLocations={adminLocations}
          calculatedPrice={calculatedPrice}
          mentorFee={mentorFee}
          saving={saving}
          onSubmit={createSchedule}
        />
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum Ada Jadwal</h3>
            <p className="text-muted-foreground mb-4">
              Buat jadwal mentoring pertama Anda untuk mulai menerima booking dari siswa
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Buat Jadwal Sekarang
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeSchedule?.id?.toString()} onValueChange={(value) => {
          const schedule = schedules.find(s => s.id?.toString() === value)
          if (schedule) {
            setActiveSchedule(schedule)
            fetchAvailabilities(schedule.id!)
            fetchBookings()
          }
        }}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${schedules.length}, 1fr)` }}>
            {schedules.map((schedule) => (
              <TabsTrigger key={schedule.id} value={schedule.id!.toString()}>
                {schedule.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {schedules.map((schedule) => (
            <TabsContent key={schedule.id} value={schedule.id!.toString()} className="space-y-6">
              {/* Schedule Details */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {schedule.title}
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{schedule.description}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleScheduleActive(schedule)}
                    >
                      {schedule.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{schedule.duration} menit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Max {schedule.maxCapacity} orang</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {schedule.meetingType === 'online' ? <Video className="h-4 w-4 text-muted-foreground" /> : <Globe className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm capitalize">{schedule.meetingType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Admin Pricing</span>
                      </div>
                    </div>

                    {/* Materials Display */}
                    {schedule.materials && schedule.materials.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Materials: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {schedule.materials.map((material, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {material}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mentor Fee Information */}
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-green-800 font-medium">Your Earnings per Session:</span>
                          <span className="font-bold text-lg text-green-600">
                            {AdminService.calculateMentorFee(
                              AdminService.calculateSessionPrice(adminPricingRules, {
                                materials: schedule.materials || [],
                                duration: schedule.duration,
                                isOnline: schedule.meetingType === 'online',
                                sessionType: 'mentoring'
                              }),
                              AdminService.getSettings().mentorFeePercentage
                            ).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Fee dihitung otomatis berdasarkan admin pricing (70% dari harga siswa)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Schedule Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Calendar</CardTitle>
                  <CardDescription>
                    Manage your availability using the professional calendar interface
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MentorScheduleCalendar
                    scheduleId={activeSchedule.id!}
                    mentorId={mentorId}
                    availabilities={availabilities.filter(a => a.scheduleId === activeSchedule.id)}
                    bookings={bookings.filter(b => b.scheduleId === activeSchedule.id)}
                    onAddAvailability={addAvailability}
                    onUpdateAvailability={updateAvailability}
                    onDeleteAvailability={deleteAvailability}
                    schedule={activeSchedule}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      {/* Capacity Monitor */}
      <div className="mt-8">
        <BookingCapacityMonitor mentorId={mentorId} />
      </div>

      {/* Slot Requests Section */}
      <div id="slot-requests" className="mt-8">
        <MentorSlotRequests mentorId={mentorId} />
      </div>
    </div>
  )
}