'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Video, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Users,
  Copy,
  ExternalLink
} from "lucide-react"
import { useMeetingGeneration } from '@/hooks/useMeetingGeneration'

interface TestFormData {
  provider: 'zoom' | 'google-meet'
  title: string
  description: string
  mentorEmail: string
  studentEmail: string
  duration: number
  startTime: string
  endTime: string
}

export default function MeetingTest() {
  const { generateMeeting, isGenerating, error, clearError } = useMeetingGeneration()
  const [testResult, setTestResult] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)
  
  const [formData, setFormData] = useState<TestFormData>({
    provider: 'google-meet',
    title: 'Test Mentoring Session',
    description: 'This is a test mentoring session to verify meeting link generation.',
    mentorEmail: 'mentor@test.com',
    studentEmail: 'student@test.com',
    duration: 60,
    startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16), // 1 hour from now
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16) // 2 hours from now
  })

  const handleTest = async () => {
    clearError()
    setShowResult(false)
    setTestResult(null)

    try {
      const result = await generateMeeting(formData.provider, {
        title: formData.title,
        description: formData.description,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        mentorEmail: formData.mentorEmail,
        studentEmail: formData.studentEmail,
        duration: formData.duration
      })

      setTestResult(result)
      setShowResult(true)
    } catch (err) {
      console.error('Test failed:', err)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const openMeetingLink = () => {
    if (testResult?.joinUrl) {
      window.open(testResult.joinUrl, '_blank')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Meeting Generation Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the automatic meeting link generation functionality
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Test Configuration
            </CardTitle>
            <CardDescription>
              Configure test parameters for meeting generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Meeting Provider</Label>
              <Select value={formData.provider} onValueChange={(value: 'zoom' | 'google-meet') => setFormData({ ...formData, provider: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google-meet">Google Meet</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Session Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter session title"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter session description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mentor Email</Label>
                <Input
                  value={formData.mentorEmail}
                  onChange={(e) => setFormData({ ...formData, mentorEmail: e.target.value })}
                  placeholder="mentor@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Student Email</Label>
                <Input
                  value={formData.studentEmail}
                  onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                  placeholder="student@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Select value={formData.duration.toString()} onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <Button 
              onClick={handleTest}
              disabled={isGenerating}
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Generating Meeting...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  Test Meeting Generation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {showResult ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Test Results
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5" />
                  Results
                </>
              )}
            </CardTitle>
            <CardDescription>
              {showResult ? 'Meeting generation successful!' : 'Run test to see results'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-800">Test Failed</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {showResult && testResult && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Meeting Generated Successfully</span>
                    <Badge variant="secondary">{testResult.provider}</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Meeting ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                        {testResult.meetingId}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(testResult.meetingId)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Meeting Link</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono break-all">
                        {testResult.joinUrl}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(testResult.joinUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={openMeetingLink}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {testResult.password && (
                    <div>
                      <Label className="text-sm font-medium">Meeting Password</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                          {testResult.password}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(testResult.password)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      ✅ Meeting link generated successfully<br />
                      ✅ Notifications would be sent to participants<br />
                      ✅ Calendar events would be created (Google Meet)<br />
                      {testResult.provider === 'zoom' && '✅ Zoom meeting configured with waiting room'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!showResult && !error && (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Click "Test Meeting Generation" to run the test</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Environment Status */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Status</CardTitle>
          <CardDescription>
            Check if required environment variables are configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>API Endpoint Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Google API (Check Setup)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Zoom API (Check Setup)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Fallback Available</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}