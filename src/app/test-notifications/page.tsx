'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Bell,
  TestTube,
  Users,
  Calendar,
  Edit3,
  Trash2,
  Send,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import NotificationDisplay from "@/components/dashboard/notification-display"
import { NotificationService } from '@/lib/notification-service'

interface TestUser {
  id: string
  name: string
  role: 'siswa' | 'mentor'
}

const TEST_USERS: TestUser[] = [
  { id: '1', name: 'John Student', role: 'siswa' },
  { id: '2', name: 'Jane Mentor', role: 'mentor' },
  { id: '3', name: 'Bob Student', role: 'siswa' },
  { id: '4', name: 'Alice Mentor', role: 'mentor' },
]

export default function NotificationTestPage() {
  const [selectedUser, setSelectedUser] = useState<TestUser>(TEST_USERS[0])
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Test availability update notification
  const testAvailabilityUpdate = async () => {
    setIsLoading(true)
    addTestResult('🔄 Testing availability update notification...')
    
    try {
      await NotificationService.notifyAvailabilityUpdated(
        '2', // Jane Mentor
        'Jane Mentor',
        '1', // Schedule ID
        'Frontend Development Mentoring',
        { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' }, // Old slot
        { dayOfWeek: 2, startTime: '10:00', endTime: '13:00' }  // New slot
      )
      addTestResult('✅ Availability update notifications sent successfully')
    } catch (error) {
      addTestResult(`❌ Failed to send availability update: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Test availability deletion notification
  const testAvailabilityDelete = async () => {
    setIsLoading(true)
    addTestResult('🔄 Testing availability deletion notification...')
    
    try {
      await NotificationService.notifyAvailabilityDeleted(
        '2', // Jane Mentor
        'Jane Mentor',
        '1', // Schedule ID
        'Frontend Development Mentoring',
        { dayOfWeek: 3, startTime: '14:00', endTime: '17:00' } // Deleted slot
      )
      addTestResult('✅ Availability deletion notifications sent successfully')
    } catch (error) {
      addTestResult(`❌ Failed to send availability deletion: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Test schedule creation notification
  const testScheduleCreation = async () => {
    setIsLoading(true)
    addTestResult('🔄 Testing schedule creation notification...')
    
    try {
      await NotificationService.notifyScheduleCreated(
        '2', // Jane Mentor
        'Jane Mentor',
        '2', // New Schedule ID
        'Backend Development Workshop'
      )
      addTestResult('✅ Schedule creation notifications sent successfully')
    } catch (error) {
      addTestResult(`❌ Failed to send schedule creation: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Test booking notification
  const testBookingCreation = async () => {
    setIsLoading(true)
    addTestResult('🔄 Testing booking notification...')
    
    try {
      await NotificationService.notifyBookingCreated(
        '1', // John Student
        'John Student',
        '2', // Jane Mentor
        'booking-123',
        'Frontend Development Mentoring',
        new Date().toISOString(),
        'https://meet.google.com/test-123',
        'google-meet'
      )
      addTestResult('✅ Booking notifications sent successfully')
    } catch (error) {
      addTestResult(`❌ Failed to send booking notification: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Test meeting link generation
  const testMeetingLink = async () => {
    setIsLoading(true)
    addTestResult('🔄 Testing meeting link notification...')
    
    try {
      await NotificationService.notifyMeetingLinkGenerated(
        '2', // Jane Mentor
        '1', // John Student
        'booking-123',
        'Frontend Development Mentoring',
        'https://meet.google.com/auto-generated-123',
        'google-meet',
        new Date().toISOString()
      )
      addTestResult('✅ Meeting link notifications sent successfully')
    } catch (error) {
      addTestResult(`❌ Failed to send meeting link notification: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Run all tests
  const runAllTests = async () => {
    addTestResult('🚀 Running all notification tests...')
    await testScheduleCreation()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testAvailabilityUpdate()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testBookingCreation()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testMeetingLink()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testAvailabilityDelete()
    addTestResult('🎉 All tests completed!')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Notification System Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the mentor-student notification system for availability changes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Notification Tests
              </CardTitle>
              <CardDescription>
                Test different types of notifications for mentor actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={testAvailabilityUpdate} 
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Test Update
                </Button>
                
                <Button 
                  onClick={testAvailabilityDelete} 
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Test Delete
                </Button>
                
                <Button 
                  onClick={testScheduleCreation} 
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Test Schedule
                </Button>
                
                <Button 
                  onClick={testBookingCreation} 
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Test Booking
                </Button>
              </div>

              <Button 
                onClick={runAllTests} 
                disabled={isLoading}
                className="w-full gap-2"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Run All Tests
                  </>
                )}
              </Button>

              <div className="pt-4 border-t">
                <Label>View notifications as:</Label>
                <Select 
                  value={selectedUser.id} 
                  onValueChange={(value) => setSelectedUser(TEST_USERS.find(u => u.id === value) || TEST_USERS[0])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEST_USERS.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Test Results
              </CardTitle>
              <CardDescription>
                Real-time test execution results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
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
              {testResults.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setTestResults([])}
                  className="mt-2 w-full"
                >
                  Clear Results
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Test Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-start gap-2">
                <Edit3 className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Update Test:</strong> Simulates mentor changing availability time from Monday 09:00-12:00 to Tuesday 10:00-13:00
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Trash2 className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Delete Test:</strong> Simulates mentor removing Wednesday 14:00-17:00 availability (sends urgent notifications)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Schedule Test:</strong> Simulates mentor creating new "Backend Development Workshop" schedule
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Booking Test:</strong> Simulates student booking a session with automatic meeting link generation
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Display */}
        <div>
          <NotificationDisplay 
            userId={selectedUser.id}
            userType={selectedUser.role}
          />
        </div>
      </div>
    </div>
  )
}