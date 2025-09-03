'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  MessageSquare, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  Calendar,
  AlertTriangle,
  Filter,
  ChevronDown
} from "lucide-react"
import { motion } from "framer-motion"
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { SlotRequestService, SlotRequest } from '@/lib/slot-request-service'

interface MentorSlotRequestsProps {
  mentorId: number
}

export default function MentorSlotRequests({ mentorId }: MentorSlotRequestsProps) {
  const [requests, setRequests] = useState<SlotRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<SlotRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<SlotRequest | null>(null)
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [responseAction, setResponseAction] = useState<'approve' | 'reject'>('approve')
  const [responseMessage, setResponseMessage] = useState('')
  const [responding, setResponding] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  })

  useEffect(() => {
    fetchRequests()
  }, [mentorId])

  useEffect(() => {
    filterRequests()
    calculateStats()
  }, [requests, statusFilter])

  const fetchRequests = async () => {
    try {
      const data = await SlotRequestService.getMentorSlotRequests(mentorId)
      setRequests(data)
    } catch (error) {
      console.error('Error fetching slot requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = requests
    
    if (statusFilter !== 'all') {
      filtered = requests.filter(req => req.status === statusFilter)
    }
    
    setFilteredRequests(filtered)
  }

  const calculateStats = () => {
    const pending = requests.filter(r => r.status === 'pending').length
    const approved = requests.filter(r => r.status === 'approved').length
    const rejected = requests.filter(r => r.status === 'rejected').length
    
    setStats({
      pending,
      approved,
      rejected,
      total: requests.length
    })
  }

  const handleRequestAction = (request: SlotRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setResponseAction(action)
    setResponseMessage('')
    setShowResponseDialog(true)
  }

  const submitResponse = async () => {
    if (!selectedRequest) return

    setResponding(true)
    try {
      await SlotRequestService.updateSlotRequestStatus(
        selectedRequest.id,
        responseAction,
        responseMessage
      )

      // If approved, create availability slot
      if (responseAction === 'approved') {
        await SlotRequestService.createAvailabilityFromRequest(selectedRequest)
      }

      await fetchRequests()
      setShowResponseDialog(false)
      setSelectedRequest(null)
      setResponseMessage('')
      
      const actionText = responseAction === 'approved' ? 'approved' : 'rejected'
      alert(`Slot request ${actionText} successfully!`)
    } catch (error) {
      console.error('Error responding to slot request:', error)
      alert('Failed to respond to slot request. Please try again.')
    } finally {
      setResponding(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'approved': return 'bg-green-100 text-green-800 border-green-300'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'normal': return 'text-gray-600'
      default: return 'text-gray-600'
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
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-blue-600" />
          Slot Requests
        </h2>
        <p className="text-muted-foreground">
          Review and respond to student requests for additional time slots
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-200 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-green-700">Approved</p>
                <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-200 rounded-lg">
                <XCircle className="h-5 w-5 text-red-700" />
              </div>
              <div>
                <p className="text-sm text-red-700">Rejected</p>
                <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Total</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">Filter by status:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Requests ({stats.total})</option>
          <option value="pending">Pending ({stats.pending})</option>
          <option value="approved">Approved ({stats.approved})</option>
          <option value="rejected">Rejected ({stats.rejected})</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {statusFilter === 'all' ? 'No Slot Requests' : `No ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Requests`}
              </h3>
              <p className="text-muted-foreground">
                {statusFilter === 'all' 
                  ? 'Students will see your available time slots and can request additional ones if needed.' 
                  : `There are currently no ${statusFilter} slot requests to display.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          Slot Request from Student #{request.studentId}
                        </CardTitle>
                        <Badge className={`${getStatusColor(request.status)} border`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                        {request.priority === 'urgent' && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        Submitted on {format(new Date(request.createdAt), 'PPP', { locale: localeId })} at {format(new Date(request.createdAt), 'p')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Request Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Date</p>
                          <p className="font-medium">{format(new Date(request.requestedDate), 'MMM d, yyyy', { locale: localeId })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-600">Time</p>
                          <p className="font-medium">{request.requestedTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-xs text-gray-600">Duration</p>
                          <p className="font-medium">{request.duration} minutes</p>
                        </div>
                      </div>
                    </div>

                    {/* Student Notes */}
                    {request.studentNotes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Student Message:</h4>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">{request.studentNotes}</p>
                        </div>
                      </div>
                    )}

                    {/* Mentor Response */}
                    {request.mentorResponse && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Your Response:</h4>
                        <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
                          <p className="text-sm text-gray-700">{request.mentorResponse}</p>
                          {request.respondedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Responded on {format(new Date(request.respondedAt), 'PPP p', { locale: localeId })}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {request.status === 'pending' && (
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          onClick={() => handleRequestAction(request, 'approve')}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Request
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRequestAction(request, 'reject')}
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Decline Request
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {responseAction === 'approve' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {responseAction === 'approve' ? 'Approve' : 'Decline'} Slot Request
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Student request for {format(new Date(selectedRequest.requestedDate), 'MMM d, yyyy')} at {selectedRequest.requestedTime}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {responseAction === 'approve' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">This will:</p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      <li>Create an available time slot for the requested date and time</li>
                      <li>Allow the student to book this slot</li>
                      <li>Send a notification to the student</li>
                      <li>Add this slot to your calendar availability</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="response">
                Message to Student {responseAction === 'approve' ? '(Optional)' : '*'}
              </Label>
              <Textarea
                id="response"
                placeholder={
                  responseAction === 'approve' 
                    ? 'Add any additional notes about the approved slot...'
                    : 'Please explain why this request cannot be accommodated and suggest alternatives...'
                }
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-500">
                This message will be sent to the student along with your decision.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitResponse}
              disabled={responding || (responseAction === 'reject' && !responseMessage.trim())}
              className={`gap-2 ${
                responseAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {responding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Processing...
                </>
              ) : (
                <>
                  {responseAction === 'approve' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {responseAction === 'approve' ? 'Approve Request' : 'Decline Request'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}