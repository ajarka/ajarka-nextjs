'use client'

import { useState, useCallback } from 'react'
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar'
import moment from 'moment'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Set up moment localizer
const localizer = momentLocalizer(moment)

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: {
    type: 'available' | 'booked' | 'unavailable'
    capacity?: number
    currentBookings?: number
    price?: number
    mentorName?: string
  }
}

interface ProfessionalCalendarProps {
  events: CalendarEvent[]
  selectedDate?: Date
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void
  onSelectEvent: (event: CalendarEvent) => void
  availableDates?: Date[]
  view?: View
  onView?: (view: View) => void
  height?: number
}

export default function ProfessionalCalendar({
  events,
  selectedDate,
  onSelectSlot,
  onSelectEvent,
  availableDates = [],
  view = Views.MONTH,
  onView,
  height = 400
}: ProfessionalCalendarProps) {
  const [currentView, setCurrentView] = useState<View>(view)
  const [date, setDate] = useState(selectedDate || new Date())

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate)
  }, [])

  const handleViewChange = useCallback((newView: View) => {
    setCurrentView(newView)
    onView?.(newView)
  }, [onView])

  const handleSelectSlot = useCallback((slotInfo: any) => {
    // Only allow selection of available dates
    const slotDate = new Date(slotInfo.start)
    const isAvailable = availableDates.some(availDate => 
      moment(availDate).format('YYYY-MM-DD') === moment(slotDate).format('YYYY-MM-DD')
    )
    
    if (isAvailable) {
      onSelectSlot(slotInfo)
    }
  }, [availableDates, onSelectSlot])

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    onSelectEvent(event)
  }, [onSelectEvent])

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const resource = event.resource
    let backgroundColor = '#3174ad'
    let borderColor = '#3174ad'
    let color = 'white'

    switch (resource?.type) {
      case 'available':
        backgroundColor = 'hsl(var(--primary))'
        borderColor = 'hsl(var(--primary))'
        break
      case 'booked':
        backgroundColor = '#ef4444'
        borderColor = '#dc2626'
        break
      case 'unavailable':
        backgroundColor = '#6b7280'
        borderColor = '#6b7280'
        break
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color,
        border: `2px solid ${borderColor}`,
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        padding: '2px 6px'
      }
    }
  }, [])

  const dayPropGetter = useCallback((date: Date) => {
    const today = new Date()
    const isToday = moment(date).isSame(today, 'day')
    const isPast = moment(date).isBefore(today, 'day')
    const isAvailable = availableDates.some(availDate => 
      moment(availDate).format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD')
    )
    

    let className = 'rbc-day-bg'
    let style: any = {}

    if (isToday) {
      className += ' rbc-today'
      style.backgroundColor = 'hsl(var(--primary) / 0.15)'
      style.fontWeight = 'bold'
      style.color = 'hsl(var(--primary))'
    }

    if (isPast && !isToday) {
      className += ' rbc-past'
      style.color = '#9ca3af'
      style.backgroundColor = '#f9fafb'
    } else if (isAvailable && !isPast) {
      className += ' rbc-available'
      style.backgroundColor = '#dcfce7' // Light green background
      style.border = '3px solid #16a34a' // Darker green border
      style.borderRadius = '8px'
      style.cursor = 'pointer'
      style.fontWeight = '700'
      style.color = '#15803d' // Dark green text
      style.boxShadow = '0 2px 4px rgba(22, 163, 74, 0.2)'
      style.transform = 'scale(1.02)'
      style.transition = 'all 0.2s ease'
    }

    return {
      className,
      style
    }
  }, [availableDates])

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

  const CustomEvent = ({ event }: { event: CalendarEvent }) => {
    const resource = event.resource
    return (
      <div className="flex items-center gap-1 text-xs">
        {resource?.type === 'available' && <CheckCircle2 className="h-3 w-3" />}
        {resource?.type === 'booked' && <Users className="h-3 w-3" />}
        <span className="truncate">{event.title}</span>
        {resource?.capacity && (
          <span className="ml-auto">
            {resource.currentBookings || 0}/{resource.capacity}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="professional-calendar">
      <style jsx global>{`
        .professional-calendar .rbc-calendar {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          border: 1px solid hsl(var(--border));
          overflow: hidden;
        }

        .professional-calendar .rbc-header {
          background-color: hsl(var(--muted));
          color: hsl(var(--muted-foreground));
          font-weight: 600;
          font-size: 14px;
          padding: 12px 8px;
          border-bottom: 1px solid hsl(var(--border));
          text-align: center;
        }

        .professional-calendar .rbc-month-view {
          border: none;
        }

        .professional-calendar .rbc-date-cell {
          padding: 8px;
          text-align: center;
          font-weight: 500;
          font-size: 14px;
          border-right: 1px solid hsl(var(--border));
          border-bottom: 1px solid hsl(var(--border));
          min-height: 80px;
          position: relative;
        }

        .professional-calendar .rbc-date-cell.rbc-today {
          background-color: hsl(var(--primary) / 0.15);
          font-weight: bold;
          color: hsl(var(--primary));
        }

        .professional-calendar .rbc-date-cell.rbc-available {
          background-color: hsl(var(--primary) / 0.1);
          border: 2px solid hsl(var(--primary)) !important;
          font-weight: 600;
          color: hsl(var(--primary));
          cursor: pointer;
        }

        .professional-calendar .rbc-date-cell.rbc-available:hover {
          background-color: #bbf7d0 !important;
          border-color: #059669 !important;
          transform: scale(1.05) !important;
          transition: all 0.2s ease;
          box-shadow: 0 4px 8px rgba(22, 163, 74, 0.3) !important;
        }

        .professional-calendar .rbc-off-range-bg {
          background-color: hsl(var(--muted) / 0.5);
          color: hsl(var(--muted-foreground));
        }

        .professional-calendar .rbc-event {
          border-radius: 6px;
          padding: 2px 6px;
          margin: 1px;
          font-size: 11px;
          font-weight: 500;
          border: none;
          box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
        }

        .professional-calendar .rbc-selected {
          background-color: hsl(var(--primary)) !important;
          color: white !important;
        }

        .professional-calendar .rbc-month-row {
          border-bottom: 1px solid hsl(var(--border));
        }

        .professional-calendar .rbc-row-bg .rbc-day-bg {
          border-right: 1px solid hsl(var(--border));
        }

        .professional-calendar .rbc-button-link {
          color: hsl(var(--foreground));
          text-decoration: none;
        }

        .professional-calendar .rbc-button-link:hover {
          color: hsl(var(--primary));
        }

        .professional-calendar .rbc-show-more {
          background-color: hsl(var(--muted));
          color: hsl(var(--muted-foreground));
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 11px;
          border: 1px solid hsl(var(--border));
        }
      `}</style>

      <Card>
        <CardContent className="p-0">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height }}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            view={currentView}
            date={date}
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            components={{
              toolbar: CustomToolbar,
              event: CustomEvent,
            }}
            popup
            popupOffset={{ x: 30, y: 20 }}
          />
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 border-2 border-green-600 rounded shadow-sm"></div>
          <span className="font-medium">Available dates (clickable)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded shadow-sm"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded shadow-sm"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  )
}