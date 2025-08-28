'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Play,
  Edit3,
  Trash2
} from "lucide-react"
import MentorScheduleCalendar from "@/components/dashboard/mentor-schedule-calendar"

// Test data
const mockSchedule = {
  id: 1,
  title: 'Frontend Development Mentoring',
  description: 'Learn React, TypeScript, and modern web development',
  meetingType: 'online',
  meetingProvider: 'google-meet'
}

const mockMentorId = 1

export default function CalendarTestPage() {
  const [availabilities, setAvailabilities] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch test data
  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Try both ports to find the active JSON server
      const ports = [3001, 3002, 3003]
      let successfulPort = null
      
      for (const port of ports) {
        try {
          const response = await fetch(`http://localhost:${port}/mentor_availability`)
          if (response.ok) {
            successfulPort = port
            break
          }
        } catch (error) {
          continue
        }
      }

      if (!successfulPort) {
        throw new Error('JSON server not found on any port')
      }

      const [availResponse, bookingsResponse] = await Promise.all([
        fetch(`http://localhost:${successfulPort}/mentor_availability`),
        fetch(`http://localhost:${successfulPort}/bookings`)
      ])

      if (availResponse.ok && bookingsResponse.ok) {
        const availData = await availResponse.json()
        const bookingsData = await bookingsResponse.json()
        
        setAvailabilities(availData.filter((a: any) => a.scheduleId === mockSchedule.id))
        setBookings(bookingsData.filter((b: any) => b.scheduleId === mockSchedule.id))
        
        addTestResult(`✅ Successfully loaded data from port ${successfulPort}`)
        addTestResult(`📊 Found ${availData.length} availability slots`)
        addTestResult(`📅 Found ${bookingsData.length} bookings`)
      }
    } catch (error) {
      addTestResult(`❌ Error loading data: ${error}`)
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Test handlers for the calendar component
  const handleAddAvailability = async (availabilityData: any) => {
    addTestResult(`🔄 Adding availability: ${JSON.stringify(availabilityData)}`)
    
    try {
      const response = await fetch('http://localhost:3001/mentor_availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...availabilityData,
          mentorId: mockMentorId,
          id: Date.now(), // Simple ID generation for testing
          isActive: true,
          createdAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        addTestResult('✅ Successfully added availability')
        await fetchData() // Refresh data
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      addTestResult(`❌ Error adding availability: ${error}`)
      throw error
    }
  }

  const handleUpdateAvailability = async (availabilityId: number, availabilityData: any) => {
    addTestResult(`🔄 Updating availability ID ${availabilityId}: ${JSON.stringify(availabilityData)}`)
    
    try {
      const response = await fetch(`http://localhost:3001/mentor_availability/${availabilityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...availabilityData,
          mentorId: mockMentorId,
          id: availabilityId,
          isActive: true,
          updatedAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        addTestResult('✅ Successfully updated availability')
        await fetchData() // Refresh data
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      addTestResult(`❌ Error updating availability: ${error}`)
      throw error
    }
  }

  const handleDeleteAvailability = async (availabilityId: number) => {
    addTestResult(`🗑️ Deleting availability ID ${availabilityId}`)
    
    try {
      const response = await fetch(`http://localhost:3001/mentor_availability/${availabilityId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        addTestResult('✅ Successfully deleted availability')
        await fetchData() // Refresh data
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      addTestResult(`❌ Error deleting availability: ${error}`)
      throw error
    }
  }

  // Create some test data
  const createTestData = async () => {
    const testAvailabilities = [
      {
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '12:00',
        scheduleId: mockSchedule.id,
        isRecurring: true
      },
      {
        dayOfWeek: 3, // Wednesday  
        startTime: '14:00',
        endTime: '17:00',
        scheduleId: mockSchedule.id,
        isRecurring: true
      },
      {
        dayOfWeek: 5, // Friday
        startTime: '10:00',
        endTime: '15:00',
        scheduleId: mockSchedule.id,
        isRecurring: true
      }
    ]

    addTestResult('🔄 Creating test availability data...')
    
    try {
      for (const availability of testAvailabilities) {
        await handleAddAvailability(availability)
      }
      addTestResult('✅ Test data created successfully')
    } catch (error) {
      addTestResult(`❌ Error creating test data: ${error}`)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Calendar Edit/Delete Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the mentor calendar edit and delete functionality
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Test Controls
              </CardTitle>
              <CardDescription>
                Actions to test the calendar functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={fetchData} disabled={isLoading} className="w-full">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              
              <Button onClick={createTestData} variant="outline" className="w-full">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Create Test Data
              </Button>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Instructions:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Click empty slots to add availability</li>
                  <li>• Click green slots to edit</li>
                  <li>• Use delete button in edit dialog</li>
                  <li>• Check test results below</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Availability Slots:</span>
                <Badge variant="secondary">{availabilities.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Bookings:</span>
                <Badge variant="secondary">{bookings.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Test Results:</span>
                <Badge variant="secondary">{testResults.length}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No test results yet...</p>
                ) : (
                  testResults.slice(-10).map((result, index) => (
                    <div key={index} className="text-xs p-2 bg-muted rounded font-mono">
                      {result}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Mentor Schedule Calendar
              </CardTitle>
              <CardDescription>
                Interactive calendar with edit/delete functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MentorScheduleCalendar
                scheduleId={mockSchedule.id}
                mentorId={mockMentorId}
                availabilities={availabilities}
                bookings={bookings}
                onAddAvailability={handleAddAvailability}
                onUpdateAvailability={handleUpdateAvailability}
                onDeleteAvailability={handleDeleteAvailability}
                schedule={mockSchedule}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}