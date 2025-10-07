'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Eye,
  Send,
  BookOpen,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  ArrowLeft,
  Loader2,
  Maximize2,
  Minimize2
} from "lucide-react"
import { MaterialContentService } from '@/services/material-content-service'
import MaterialEditor from '@/components/materials/material-editor'
import MaterialViewer from '@/components/materials/material-viewer'
import Link from 'next/link'
import { useMutation } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'

export default function MentorMaterialsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const userId = session?.user?.id || ''

  // Convex hooks
  const myMaterials = MaterialContentService.useMaterialsByAuthor(userId) || []
  const createMaterial = MaterialContentService.useCreateMaterial()
  const updateMaterial = MaterialContentService.useUpdateMaterial()
  const submitForReview = MaterialContentService.useSubmitForReview()
  const createNotification = useMutation(api.notifications.create)
  const createBulkNotifications = useMutation(api.notifications.createBulk)
  const adminUsers = MaterialContentService.useAdminUsers() || []

  const [showDialog, setShowDialog] = useState(false)
  const [viewingMaterial, setViewingMaterial] = useState<any>(null)
  const [editingMaterial, setEditingMaterial] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'pending' | 'rejected'>('all')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const filteredMaterials = myMaterials.filter(m => {
    if (filter === 'all') return true
    if (filter === 'pending') return m.status === 'pending_review'
    return m.status === filter
  })

  const handleCreate = async (data: any) => {
    setIsSubmitting(true)
    try {
      await createMaterial({
        ...data,
        authorId: userId,
        authorRole: 'mentor',
        status: 'draft',
        isPublic: false,
        isActive: true,
      })
      setShowDialog(false)
      setEditingMaterial(null)
    } catch (error) {
      console.error('Error creating material:', error)
      alert('Failed to create material')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (data: any) => {
    if (!editingMaterial) return
    setIsSubmitting(true)
    try {
      await updateMaterial({
        id: editingMaterial._id,
        ...data,
      })
      setShowDialog(false)
      setEditingMaterial(null)
    } catch (error) {
      console.error('Error updating material:', error)
      alert('Failed to update material')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitForReview = async (materialId: string, materialTitle: string) => {
    setIsSubmitting(true)
    try {
      await submitForReview({ id: materialId as any })

      // Create notifications for all admins
      if (adminUsers && adminUsers.length > 0) {
        const notifications = adminUsers.map(admin => ({
          userId: admin._id,
          type: 'material_review_request' as const,
          title: 'New Material Review Request',
          message: `${session?.user?.name || 'A mentor'} has submitted "${materialTitle}" for review`,
          relatedId: materialId,
          relatedType: 'material',
          recipientType: 'admin' as const,
          senderId: userId,
          senderType: 'mentor' as const,
        }))

        await createBulkNotifications({ notifications })
      }

      alert('Material submitted for review successfully!')
    } catch (error) {
      console.error('Error submitting for review:', error)
      alert('Failed to submit for review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCreateDialog = () => {
    setEditingMaterial(null)
    setShowDialog(true)
  }

  const openEditDialog = (material: any) => {
    setEditingMaterial(material)
    setShowDialog(true)
  }

  const stats = {
    total: myMaterials.length,
    published: myMaterials.filter(m => m.status === 'published').length,
    draft: myMaterials.filter(m => m.status === 'draft').length,
    pending: myMaterials.filter(m => m.status === 'pending_review').length,
    rejected: myMaterials.filter(m => m.status === 'rejected').length,
  }

  if (viewingMaterial) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <MaterialViewer
          material={viewingMaterial}
          onBack={() => setViewingMaterial(null)}
        />
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">My Learning Materials</h1>
          <p className="text-muted-foreground">
            Create and manage your educational content
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Material
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileCheck className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">How it works</h3>
              <p className="text-sm text-blue-800">
                Create materials as drafts → Submit for review → Admin reviews → Get approved → Material becomes available to all mentors!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setFilter('published')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setFilter('pending')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setFilter('draft')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileCheck className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setFilter('rejected')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
          All
        </Button>
        <Button variant={filter === 'published' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('published')}>
          Published
        </Button>
        <Button variant={filter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('pending')}>
          Pending Review
        </Button>
        <Button variant={filter === 'draft' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('draft')}>
          Drafts
        </Button>
        <Button variant={filter === 'rejected' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('rejected')}>
          Rejected
        </Button>
      </div>

      {/* Materials List */}
      <Card>
        <CardHeader>
          <CardTitle>Materials ({filteredMaterials.length})</CardTitle>
          <CardDescription>
            Your learning materials and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No materials found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all'
                  ? 'Create your first learning material to share knowledge with students'
                  : `No ${filter} materials found`
                }
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Material
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMaterials.map((material) => (
                <Card key={material._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => setViewingMaterial(material)}>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{material.title}</h4>
                          <Badge variant={
                            material.status === 'published' ? 'default' :
                            material.status === 'pending_review' ? 'secondary' :
                            material.status === 'rejected' ? 'destructive' :
                            'outline'
                          }>
                            {material.status === 'pending_review' ? 'Under Review' : material.status}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{material.description}</p>

                        {material.status === 'rejected' && material.reviewNotes && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                            <p className="text-sm text-red-800">{material.reviewNotes}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span className="capitalize">{material.category}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>Level {material.level} - {material.difficulty}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{material.estimatedHours}h</span>
                          </div>
                        </div>

                        {material.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {material.tags.slice(0, 5).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingMaterial(material)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {(material.status === 'draft' || material.status === 'rejected') && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(material)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleSubmitForReview(material._id, material.title)}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-1" />
                                  Submit
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open)
          if (!open) {
            setIsFullscreen(false)
            setEditingMaterial(null)
            // Ensure body scroll is restored
            document.body.style.overflow = ''
            document.body.style.pointerEvents = ''
          }
        }}
      >
        <DialogContent
          className={`overflow-hidden flex flex-col ${
            isFullscreen
              ? '!fixed !inset-0 w-screen h-screen !max-w-none sm:!max-w-none !max-h-none !m-0 !p-0 !rounded-none !translate-x-0 !translate-y-0 !border-0 !z-[100]'
              : 'max-w-[95vw] w-[95vw] max-h-[95vh]'
          }`}
        >
          <DialogHeader className={`flex-shrink-0 border-b ${isFullscreen ? 'p-6 pb-4' : 'pb-4'}`}>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">
                  {editingMaterial ? 'Edit Material' : 'Create New Material'}
                </DialogTitle>
                <DialogDescription>
                  {editingMaterial
                    ? 'Update your material and submit for review when ready'
                    : 'Create a new learning material and submit it for admin review'
                  }
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex-shrink-0"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </DialogHeader>
          <div className={`flex-1 overflow-y-auto ${isFullscreen ? 'p-6' : ''}`}>
            <MaterialEditor
              initialData={editingMaterial}
              onSave={editingMaterial ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowDialog(false)
                setEditingMaterial(null)
                setIsFullscreen(false)
              }}
              isSubmitting={isSubmitting}
              mode={editingMaterial ? 'edit' : 'create'}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
