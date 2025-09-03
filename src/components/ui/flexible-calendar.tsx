'use client'

import { useState } from 'react'
import { Button } from './button'
import { Badge } from './badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  MessageSquare
} from 'lucide-react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  getDay,
  isBefore
} from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isPast: boolean
  availability: 'available' | 'partial' | 'full' | 'unavailable'
  availableSlots: number
  totalSlots: number
  hasRequests?: boolean
}

interface FlexibleCalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  onRequestSlot?: (date: Date) => void
  getDateAvailability: (date: Date) => {
    status: 'available' | 'partial' | 'full' | 'unavailable'
    availableSlots: number
    totalSlots: number
    hasRequests?: boolean
  }
  minDate?: Date
  maxDate?: Date
  showRequestOption?: boolean
  className?: string
}

export default function FlexibleCalendar({
  selectedDate,
  onDateSelect,
  onRequestSlot,
  getDateAvailability,
  minDate = new Date(),
  maxDate,
  showRequestOption = false,
  className = ''
}: FlexibleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Start on Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days: CalendarDay[] = []
  let day = calendarStart

  while (day <= calendarEnd) {
    const availability = getDateAvailability(day)
    const isPast = isBefore(day, startOfWeek(new Date(), { weekStartsOn: 0 }))
    
    days.push({
      date: day,
      isCurrentMonth: isSameMonth(day, currentMonth),
      isToday: isToday(day),
      isPast,
      availability: isPast ? 'unavailable' : availability.status,
      availableSlots: availability.availableSlots,
      totalSlots: availability.totalSlots,
      hasRequests: availability.hasRequests
    })
    
    day = addDays(day, 1)
  }

  const canGoToPrevMonth = !minDate || !isSameMonth(subMonths(currentMonth, 1), minDate)
  const canGoToNextMonth = !maxDate || !isSameMonth(addMonths(currentMonth, 1), maxDate)

  const handlePrevMonth = () => {
    if (canGoToPrevMonth) {
      setCurrentMonth(subMonths(currentMonth, 1))
    }
  }

  const handleNextMonth = () => {
    if (canGoToNextMonth) {
      setCurrentMonth(addMonths(currentMonth, 1))
    }
  }

  const handleDateClick = (day: CalendarDay) => {
    if (day.isPast || !day.isCurrentMonth) return
    
    if (day.availability === 'available' || day.availability === 'partial') {
      onDateSelect(day.date)
    } else if (showRequestOption && day.availability === 'unavailable' && onRequestSlot) {
      onRequestSlot(day.date)
    }
  }

  const getDateButtonClass = (day: CalendarDay) => {
    const baseClass = "w-full h-16 p-2 rounded-lg border transition-all duration-200 text-left relative"
    
    if (!day.isCurrentMonth) {
      return `${baseClass} text-gray-300 border-gray-100 cursor-not-allowed`
    }
    
    if (day.isPast) {
      return `${baseClass} text-gray-400 border-gray-200 cursor-not-allowed opacity-50`
    }

    if (selectedDate && isSameDay(day.date, selectedDate)) {
      return `${baseClass} bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200`
    }

    switch (day.availability) {
      case 'available':
        return `${baseClass} border-green-300 bg-green-50 hover:bg-green-100 text-green-900 cursor-pointer`
      case 'partial':
        return `${baseClass} border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-900 cursor-pointer`
      case 'full':
        return `${baseClass} border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed`
      case 'unavailable':
        return `${baseClass} border-red-200 bg-red-50 text-red-700 ${
          showRequestOption ? 'hover:bg-red-100 cursor-pointer' : 'cursor-not-allowed'
        }`
      default:
        return `${baseClass} border-gray-200 hover:border-gray-300 cursor-pointer`
    }
  }

  const getAvailabilityIndicator = (day: CalendarDay) => {
    if (!day.isCurrentMonth || day.isPast) return null

    const dotClass = "absolute top-1 right-1 w-3 h-3 rounded-full"
    
    switch (day.availability) {
      case 'available':
        return <div className={`${dotClass} bg-green-500`} />
      case 'partial':
        return <div className={`${dotClass} bg-orange-500`} />
      case 'full':
        return <div className={`${dotClass} bg-gray-500`} />
      case 'unavailable':
        return showRequestOption ? 
          <MessageSquare className="absolute top-1 right-1 w-3 h-3 text-red-500" /> :
          <div className={`${dotClass} bg-red-500`} />
      default:
        return null
    }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevMonth}
          disabled={!canGoToPrevMonth}
          className="p-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale: localeId })}
          </h3>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          disabled={!canGoToNextMonth}
          className="p-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <span>Full</span>
        </div>
        {showRequestOption && (
          <div className="flex items-center gap-1">
            <MessageSquare className="w-2 h-2 text-red-500" />
            <span>Request</span>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            className={getDateButtonClass(day)}
            title={
              day.availability === 'unavailable' && showRequestOption
                ? 'Click to request this slot from mentor'
                : `${day.availableSlots}/${day.totalSlots} slots available`
            }
          >
            {getAvailabilityIndicator(day)}
            
            <div className="flex flex-col h-full">
              <span className={`text-sm font-medium ${
                day.isToday ? 'font-bold' : ''
              }`}>
                {format(day.date, 'd')}
              </span>
              
              {day.isCurrentMonth && !day.isPast && (
                <div className="mt-auto">
                  {day.availability !== 'unavailable' && (
                    <div className="text-xs">
                      {day.availableSlots}/{day.totalSlots}
                    </div>
                  )}
                  {day.availability === 'unavailable' && showRequestOption && (
                    <div className="text-xs">
                      Request
                    </div>
                  )}
                  {day.hasRequests && (
                    <div className="flex items-center gap-1 text-xs mt-1">
                      <AlertCircle className="w-2 h-2" />
                      <span>Req</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">How to book:</p>
          <ul className="list-disc list-inside text-xs space-y-1">
            <li>Green dates: Available slots - click to select</li>
            <li>Orange dates: Partially booked - limited slots</li>
            <li>Gray dates: Fully booked</li>
            {showRequestOption && (
              <li>Red dates: No availability - click to request slot from mentor</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}