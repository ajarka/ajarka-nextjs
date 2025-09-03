'use client'

import { useState, useCallback, useEffect } from 'react'
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar'
import moment from 'moment'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  Bell,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { SlotRequestService } from '@/lib/slot-request-service'

const localizer = momentLocalizer(moment)

interface ScheduleEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: {
    type: 'availability' | 'booking' | 'blocked' | 'slot_request'
    scheduleId?: number
    capacity?: number
    currentBookings?: number
    price?: number
    dayOfWeek: number
    startTime: string
    endTime: string
    isRecurring: boolean
    slotRequest?: any
  }
}

interface AvailabilityForm {
  dayOfWeek: number
  startTime: string
  endTime: string
  scheduleId: number
  isRecurring: boolean
}

interface MentorScheduleCalendarProps {
  scheduleId: number
  mentorId: number
  availabilities: any[]
  bookings: any[]
  onAddAvailability: (availability: AvailabilityForm) => Promise<void>
  onUpdateAvailability: (availabilityId: number, availability: AvailabilityForm) => Promise<void>
  onDeleteAvailability: (availabilityId: number) => Promise<void>
  schedule: any
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
]

export default function MentorScheduleCalendar({
  scheduleId,
  mentorId,
  availabilities,
  bookings,
  onAddAvailability,
  onUpdateAvailability,
  onDeleteAvailability,
  schedule
}: MentorScheduleCalendarProps) {
  const [currentView, setCurrentView] = useState<View>(Views.WEEK)
  const [date, setDate] = useState(new Date())
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{start: Date, end: Date} | null>(null)
  const [selectedAvailability, setSelectedAvailability] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [slotRequests, setSlotRequests] = useState<any[]>([])

  const [availabilityForm, setAvailabilityForm] = useState<AvailabilityForm>({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    scheduleId: scheduleId,
    isRecurring: true
  })

  useEffect(() => {
    fetchSlotRequests()
  }, [mentorId, scheduleId])

  const fetchSlotRequests = async () => {
    try {
      const requests = await SlotRequestService.getMentorSlotRequests(mentorId)
      const relevantRequests = requests.filter(request => 
        request.scheduleId === scheduleId && request.status === 'pending'
      )
      setSlotRequests(relevantRequests)
    } catch (error) {
      console.error('Error fetching slot requests:', error)
      setSlotRequests([])
    }
  }

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate)
  }, [])

  const handleViewChange = useCallback((newView: View) => {
    setCurrentView(newView)
  }, [])

  const getCalendarEvents = useCallback(() => {
    const events: ScheduleEvent[] = []

    // Add availability events
    availabilities.forEach(avail => {
      if (!avail.isActive || avail.scheduleId !== scheduleId) return

      // Generate events for the next 8 weeks
      const startDate = moment().startOf('week')
      for (let week = 0; week < 8; week++) {
        const eventDate = moment(startDate).add(week, 'weeks').day(avail.dayOfWeek)
        
        if (eventDate.isAfter(moment().subtract(1, 'day'))) {
          const startTime = moment(eventDate).set({
            hour: parseInt(avail.startTime.split(':')[0]),
            minute: parseInt(avail.startTime.split(':')[1])
          })
          const endTime = moment(eventDate).set({
            hour: parseInt(avail.endTime.split(':')[0]),
            minute: parseInt(avail.endTime.split(':')[1])
          })

          events.push({
            id: `availability-${avail.id}-${week}`,
            title: `Available (${avail.startTime} - ${avail.endTime})`,
            start: startTime.toDate(),
            end: endTime.toDate(),
            resource: {
              type: 'availability',
              scheduleId: avail.scheduleId,
              dayOfWeek: avail.dayOfWeek,
              startTime: avail.startTime,
              endTime: avail.endTime,
              isRecurring: avail.isRecurring,
              availabilityId: avail.id,
              originalAvailability: avail
            }
          })
        }
      }
    })

    // Add booking events
    bookings.forEach(booking => {
      if (booking.scheduleId !== scheduleId || booking.status === 'cancelled') return

      events.push({
        id: `booking-${booking.id}`,
        title: `Booked (${booking.studentName || 'Student'})`,
        start: new Date(booking.bookingDate),
        end: new Date(booking.endDate),
        resource: {
          type: 'booking',
          scheduleId: booking.scheduleId,
          dayOfWeek: 0,
          startTime: '',
          endTime: '',
          isRecurring: false
        }
      })
    })

    // Add slot request events
    slotRequests.forEach(request => {
      const requestDate = new Date(request.requestedDate)
      const [startHour, startMinute] = request.requestedTime.split(':')
      const startDateTime = new Date(requestDate)
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute))
      
      const endDateTime = new Date(startDateTime)
      endDateTime.setMinutes(endDateTime.getMinutes() + request.duration)

      events.push({
        id: `slot-request-${request.id}`,
        title: `Slot Request (${request.requestedTime})`,
        start: startDateTime,
        end: endDateTime,
        resource: {
          type: 'slot_request',
          scheduleId: request.scheduleId,
          dayOfWeek: requestDate.getDay(),
          startTime: request.requestedTime,
          endTime: moment(endDateTime).format('HH:mm'),
          isRecurring: false,
          slotRequest: request
        }
      })
    })

    return events
  }, [availabilities, bookings, scheduleId, slotRequests])

  const handleSelectSlot = useCallback((slotInfo: any) => {
    setSelectedSlot(slotInfo)
    setDialogMode('add')
    setAvailabilityForm({
      ...availabilityForm,
      dayOfWeek: slotInfo.start.getDay(),
      startTime: moment(slotInfo.start).format('HH:mm'),
      endTime: moment(slotInfo.end).format('HH:mm'),
      scheduleId: scheduleId
    })
    setShowAddDialog(true)
  }, [availabilityForm, scheduleId])

  const handleSelectEvent = useCallback((event: ScheduleEvent) => {
    if (event.resource?.type === 'availability') {
      const originalAvailability = event.resource.originalAvailability
      setSelectedAvailability(originalAvailability)
      setAvailabilityForm({
        dayOfWeek: originalAvailability.dayOfWeek,
        startTime: originalAvailability.startTime,
        endTime: originalAvailability.endTime,
        scheduleId: originalAvailability.scheduleId,
        isRecurring: originalAvailability.isRecurring
      })
      setDialogMode('edit')
      setShowEditDialog(true)
    } else if (event.resource?.type === 'slot_request') {
      // Navigate to slot requests section to handle this request
      const slotRequestsSection = document.getElementById('slot-requests')
      if (slotRequestsSection) {
        slotRequestsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [])

  const handleAddAvailability = async () => {
    setSaving(true)
    try {
      await onAddAvailability(availabilityForm)
      setShowAddDialog(false)
      setSelectedSlot(null)
      resetForm()
    } catch (error) {
      console.error('Error adding availability:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateAvailability = async () => {
    if (!selectedAvailability) return
    
    setSaving(true)
    try {
      await onUpdateAvailability(selectedAvailability.id, availabilityForm)
      setShowEditDialog(false)
      setSelectedAvailability(null)
      resetForm()
    } catch (error) {
      console.error('Error updating availability:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = () => {
    setShowEditDialog(false)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedAvailability) return
    
    setSaving(true)
    try {
      await onDeleteAvailability(selectedAvailability.id)
      setShowDeleteDialog(false)
      setSelectedAvailability(null)
      resetForm()
    } catch (error) {
      console.error('Error deleting availability:', error)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setAvailabilityForm({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      scheduleId: scheduleId,
      isRecurring: true
    })
  }

  const closeAllDialogs = () => {
    setShowAddDialog(false)
    setShowEditDialog(false)
    setShowDeleteDialog(false)
    setSelectedSlot(null)
    setSelectedAvailability(null)
    resetForm()
  }

  const eventStyleGetter = useCallback((event: ScheduleEvent) => {
    const resource = event.resource
    let backgroundColor = '#3174ad'
    let borderColor = '#3174ad'
    let color = 'white'

    switch (resource?.type) {
      case 'availability':
        backgroundColor = '#22c55e'  // Green for availability
        borderColor = '#16a34a'
        color = 'white'
        break
      case 'booking':
        backgroundColor = '#ef4444'  // Red for bookings
        borderColor = '#dc2626'
        color = 'white'
        break
      case 'blocked':
        backgroundColor = '#6b7280'  // Gray for blocked
        borderColor = '#4b5563'
        color = 'white'
        break
      case 'slot_request':
        backgroundColor = '#f59e0b'  // Orange for slot requests
        borderColor = '#d97706'
        color = 'white'
        break
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color,
        border: `2px solid ${borderColor}`,
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '600',
        padding: '4px 8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        opacity: 0.95
      }
    }
  }, [])

  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="flex items-center justify-between mb-6 p-4 bg-white border rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('PREV')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('TODAY')}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('NEXT')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {label}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={currentView === Views.MONTH ? "default" : "outline"}
            size="sm"
            onClick={() => onView(Views.MONTH)}
          >
            Month
          </Button>
          <Button
            variant={currentView === Views.WEEK ? "default" : "outline"}
            size="sm"
            onClick={() => onView(Views.WEEK)}
          >
            Week
          </Button>
          <Button
            variant={currentView === Views.DAY ? "default" : "outline"}
            size="sm"
            onClick={() => onView(Views.DAY)}
          >
            Day
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mentor-schedule-calendar">
      <style jsx global>{`
        .mentor-schedule-calendar .rbc-calendar {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          border: 1px solid hsl(var(--border));
          overflow: hidden;
        }

        .mentor-schedule-calendar .rbc-header {
          background-color: hsl(var(--muted));
          color: hsl(var(--muted-foreground));
          font-weight: 600;
          font-size: 14px;
          padding: 12px 8px;
          border-bottom: 1px solid hsl(var(--border));
          text-align: center;
        }

        .mentor-schedule-calendar .rbc-time-slot {
          border-top: 1px solid hsl(var(--border));
        }

        .mentor-schedule-calendar .rbc-timeslot-group {
          border-bottom: 1px solid hsl(var(--border));
        }

        .mentor-schedule-calendar .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid hsl(var(--border) / 0.3);
        }

        .mentor-schedule-calendar .rbc-event {
          border-radius: 6px;
          padding: 2px 6px;
          margin: 1px;
          font-size: 11px;
          font-weight: 500;
          border: none;
          box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
        }

        .mentor-schedule-calendar .rbc-selected {
          background-color: hsl(var(--primary)) !important;
          color: white !important;
        }
      `}</style>

      <Card>
        <CardContent className="p-0">
          <Calendar
            localizer={localizer}
            events={getCalendarEvents()}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            view={currentView}
            date={date}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar,
            }}
            popup
            step={30}
            timeslots={2}
            min={moment().hour(6).minute(0).toDate()}
            max={moment().hour(23).minute(0).toDate()}
            defaultView={Views.WEEK}
          />
        </CardContent>
      </Card>

      {/* Legend & Instructions */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded shadow-sm"></div>
            <span>Available slots</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded shadow-sm"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded shadow-sm"></div>
            <span>Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded shadow-sm"></div>
            <span>Slot Requests</span>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          💡 Click on empty slots to add availability • Click on green slots to edit or delete • Click on orange slots to handle student requests
        </div>
      </div>

      {/* Add Availability Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Availability Slot</DialogTitle>
            <DialogDescription>
              Set when you're available for {schedule?.title} sessions
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label>Day of Week</Label>
              <Select 
                value={availabilityForm.dayOfWeek.toString()} 
                onValueChange={(value) => setAvailabilityForm({ ...availabilityForm, dayOfWeek: parseInt(value) })}
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
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={availabilityForm.startTime}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={availabilityForm.endTime}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recurring"
                checked={availabilityForm.isRecurring}
                onChange={(e) => setAvailabilityForm({ ...availabilityForm, isRecurring: e.target.checked })}
              />
              <Label htmlFor="recurring">Recurring weekly</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAvailability} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Availability
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Availability Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Availability Slot</DialogTitle>
            <DialogDescription>
              Update your availability for {schedule?.title} sessions
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label>Day of Week</Label>
              <Select 
                value={availabilityForm.dayOfWeek.toString()} 
                onValueChange={(value) => setAvailabilityForm({ ...availabilityForm, dayOfWeek: parseInt(value) })}
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
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={availabilityForm.startTime}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={availabilityForm.endTime}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recurring-edit"
                checked={availabilityForm.isRecurring}
                onChange={(e) => setAvailabilityForm({ ...availabilityForm, isRecurring: e.target.checked })}
              />
              <Label htmlFor="recurring-edit">Recurring weekly</Label>
            </div>

            {/* Notification Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Bell className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Notifikasi Otomatis</p>
                  <p className="mt-1">Student akan mendapat notifikasi tentang perubahan jadwal ini.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={handleDeleteClick}
                disabled={saving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAvailability} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Update Availability
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Availability Slot
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this availability slot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAvailability && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm">
                  <p><strong>Day:</strong> {DAYS_OF_WEEK.find(d => d.value === selectedAvailability.dayOfWeek)?.label}</p>
                  <p><strong>Time:</strong> {selectedAvailability.startTime} - {selectedAvailability.endTime}</p>
                  <p><strong>Recurring:</strong> {selectedAvailability.isRecurring ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {/* Critical Notification Warning */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Peringatan Penting</p>
                    <p className="mt-1">
                      Menghapus jadwal ini akan mengirim notifikasi darurat ke semua student. 
                      Student yang sudah booking akan mendapat notifikasi prioritas tinggi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}