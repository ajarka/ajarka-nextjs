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
  AlertCircle
} from "lucide-react"
import { motion } from "framer-motion"
import { format, addDays, startOfWeek } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import BookingCapacityMonitor from './booking-capacity-monitor'
import MentorScheduleCalendar from './mentor-schedule-calendar'
import { NotificationService } from '@/lib/notification-service'
import { useSession } from 'next-auth/react'
import { useMeetingGeneration } from '@/hooks/useMeetingGeneration'
import { AdminService, AdminPricingRule, AdminOfficeLocation } from '@/lib/admin-service'

interface MentorSchedule {
  id?: number
  title: string
  description: string
  duration: number
  maxCapacity: number
  materials: string[]
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
  
  const [newSchedule, setNewSchedule] = useState<MentorSchedule>({
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
  }, [mentorId])

  useEffect(() => {
    // Recalculate pricing when schedule data changes
    if (newSchedule.materials.length > 0 && newSchedule.duration > 0) {
      calculatePricing()
    }
  }, [newSchedule.materials, newSchedule.duration, newSchedule.meetingType, adminPricingRules])

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

  const calculatePricing = () => {
    if (adminPricingRules.length === 0 || newSchedule.materials.length === 0) return

    const price = AdminService.calculateSessionPrice(adminPricingRules, {
      materials: newSchedule.materials,
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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Buat Jadwal Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Buat Jadwal Mentoring Baru</DialogTitle>
              <DialogDescription>
                Atur detail jadwal mentoring yang akan tersedia untuk booking siswa
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Session</Label>
                  <Input
                    id="title"
                    value={newSchedule.title}
                    onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                    placeholder="Frontend Mentoring"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Durasi (menit)</Label>
                  <Select value={newSchedule.duration.toString()} onValueChange={(value) => setNewSchedule({ ...newSchedule, duration: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 menit</SelectItem>
                      <SelectItem value="60">60 menit</SelectItem>
                      <SelectItem value="90">90 menit</SelectItem>
                      <SelectItem value="120">120 menit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                  placeholder="Deskripsi session mentoring..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Materials to Cover</Label>
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md min-h-[100px]">
                    {adminPricingRules.map((rule) => 
                      rule.materials.map((material) => (
                        <button
                          key={material}
                          type="button"
                          onClick={() => {
                            const isSelected = newSchedule.materials.includes(material)
                            if (isSelected) {
                              setNewSchedule({
                                ...newSchedule,
                                materials: newSchedule.materials.filter(m => m !== material)
                              })
                            } else {
                              setNewSchedule({
                                ...newSchedule,
                                materials: [...newSchedule.materials, material]
                              })
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            newSchedule.materials.includes(material)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {material}
                        </button>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Select materials that will be covered in this session. Pricing is automatically calculated based on admin settings.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Maksimal Peserta</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      max="20"
                      value={newSchedule.maxCapacity}
                      onChange={(e) => setNewSchedule({ ...newSchedule, maxCapacity: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meetingType">Tipe Meeting</Label>
                    <Select value={newSchedule.meetingType} onValueChange={(value: 'online' | 'offline') => setNewSchedule({ ...newSchedule, meetingType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Tatap Muka</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Admin-Calculated Pricing Display */}
                {calculatedPrice > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="w-full">
                        <h4 className="font-medium text-green-800">Your Earnings per Session</h4>
                        <div className="mt-2 text-center">
                          <span className="text-2xl font-bold text-green-600">Rp {mentorFee.toLocaleString('id-ID')}</span>
                          <p className="text-xs text-green-700 mt-1">
                            Dihitung otomatis oleh admin (70% dari harga siswa)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {newSchedule.meetingType === 'online' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meetingProvider">Platform Meeting</Label>
                    <Select value={newSchedule.meetingProvider} onValueChange={(value: 'zoom' | 'google-meet') => setNewSchedule({ ...newSchedule, meetingProvider: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google-meet">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Google Meet
                          </div>
                        </SelectItem>
                        <SelectItem value="zoom">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Zoom
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Link meeting otomatis akan dibuat!</p>
                        <p className="mt-1">Sistem akan secara otomatis generate link {newSchedule.meetingProvider === 'zoom' ? 'Zoom' : 'Google Meet'} ketika ada booking baru. Link akan dikirim ke mentor dan student melalui notifikasi.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {newSchedule.meetingType === 'offline' && (
                <div className="space-y-2">
                  <Label htmlFor="location">Office Location</Label>
                  <Select 
                    value={newSchedule.locationId?.toString() || ''} 
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, locationId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an office location" />
                    </SelectTrigger>
                    <SelectContent>
                      {adminLocations.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          <div>
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-gray-500">{location.address}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Select from admin-managed office locations for offline sessions.</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={createSchedule} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Jadwal'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
    </div>
  )
}