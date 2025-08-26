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

interface MentorSchedule {
  id?: number
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
  const [schedules, setSchedules] = useState<MentorSchedule[]>([])
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([])
  const [activeSchedule, setActiveSchedule] = useState<MentorSchedule | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [newSchedule, setNewSchedule] = useState<MentorSchedule>({
    title: '',
    description: '',
    duration: 60,
    maxCapacity: 1,
    price: 150000,
    meetingType: 'online',
    meetingLink: '',
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
  }, [mentorId])

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`http://localhost:3001/mentor_schedules?mentorId=${mentorId}`)
      const schedulesData = await response.json()
      setSchedules(schedulesData)
      
      if (schedulesData.length > 0) {
        setActiveSchedule(schedulesData[0])
        fetchAvailabilities(schedulesData[0].id)
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
        await fetchSchedules()
        setNewSchedule({
          title: '',
          description: '',
          duration: 60,
          maxCapacity: 1,
          price: 150000,
          meetingType: 'online',
          meetingLink: '',
          timezone: 'Asia/Jakarta',
          isActive: true
        })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Error creating schedule:', error)
    } finally {
      setSaving(false)
    }
  }

  const addAvailability = async () => {
    if (!activeSchedule?.id) return
    
    setSaving(true)
    try {
      const response = await fetch('http://localhost:3001/mentor_availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAvailability,
          mentorId,
          scheduleId: activeSchedule.id,
          createdAt: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        await fetchAvailabilities(activeSchedule.id)
        setNewAvailability({
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: true,
          isActive: true
        })
        setIsAvailabilityOpen(false)
      }
    } catch (error) {
      console.error('Error adding availability:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteAvailability = async (availabilityId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/mentor_availability/${availabilityId}`, {
        method: 'DELETE'
      })
      
      if (response.ok && activeSchedule?.id) {
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

              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="price">Harga (Rp)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newSchedule.price}
                    onChange={(e) => setNewSchedule({ ...newSchedule, price: parseInt(e.target.value) })}
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
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newSchedule.meetingType === 'online' && (
                <div className="space-y-2">
                  <Label htmlFor="meetingLink">Link Meeting</Label>
                  <Input
                    id="meetingLink"
                    value={newSchedule.meetingLink}
                    onChange={(e) => setNewSchedule({ ...newSchedule, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/abc-def-ghi"
                  />
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
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Rp {schedule.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {schedule.meetingType === 'online' ? <Video className="h-4 w-4 text-muted-foreground" /> : <Globe className="h-4 w-4 text-muted-foreground" />}
                      <span className="text-sm capitalize">{schedule.meetingType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Availability Management */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Ketersediaan Waktu</CardTitle>
                      <CardDescription>
                        Atur hari dan jam kapan Anda tersedia untuk mentoring
                      </CardDescription>
                    </div>
                    
                    <Dialog open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Tambah Slot
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Ketersediaan</DialogTitle>
                          <DialogDescription>
                            Tentukan hari dan jam ketersediaan Anda
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label>Hari</Label>
                            <Select 
                              value={newAvailability.dayOfWeek.toString()} 
                              onValueChange={(value) => setNewAvailability({ ...newAvailability, dayOfWeek: parseInt(value) })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DAYS_OF_WEEK.map((day) => (
                                  <SelectItem key={day.value} value={day.value.toString()}>
                                    {day.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Jam Mulai</Label>
                              <Select 
                                value={newAvailability.startTime} 
                                onValueChange={(value) => setNewAvailability({ ...newAvailability, startTime: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map((time) => (
                                    <SelectItem key={time.value} value={time.value}>
                                      {time.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Jam Selesai</Label>
                              <Select 
                                value={newAvailability.endTime} 
                                onValueChange={(value) => setNewAvailability({ ...newAvailability, endTime: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map((time) => (
                                    <SelectItem key={time.value} value={time.value}>
                                      {time.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAvailabilityOpen(false)}>
                            Batal
                          </Button>
                          <Button onClick={addAvailability} disabled={saving}>
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Menyimpan...
                              </>
                            ) : (
                              'Tambah Slot'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {availabilities.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Belum ada ketersediaan waktu yang diatur
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {availabilities
                        .filter(avail => avail.isActive)
                        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                        .map((availability) => (
                          <motion.div
                            key={availability.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="font-medium">
                                {DAYS_OF_WEEK.find(d => d.value === availability.dayOfWeek)?.label}
                              </span>
                              <span className="text-muted-foreground">
                                {availability.startTime} - {availability.endTime}
                              </span>
                              {availability.isRecurring && (
                                <Badge variant="outline" className="text-xs">
                                  Berulang
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAvailability(availability.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                    </div>
                  )}
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