'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileCheck,
  Maximize2,
  Minimize2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from "lucide-react"
import { MaterialContentService } from '@/services/material-content-service'
import { useSession } from 'next-auth/react'
import MaterialEditor from '@/components/materials/material-editor'
import MaterialViewer from '@/components/materials/material-viewer'

export default function MaterialsManagement() {
  const { data: session } = useSession()
  const materials = MaterialContentService.useMaterialContents() || []
  const createMaterial = MaterialContentService.useCreateMaterial()
  const updateMaterial = MaterialContentService.useUpdateMaterial()
  const deleteMaterial = MaterialContentService.useDeleteMaterial()
  const toggleActive = MaterialContentService.useToggleActive()
  const approveMaterial = MaterialContentService.useApproveMaterial()
  const rejectMaterial = MaterialContentService.useRejectMaterial()
  const requestRevision = MaterialContentService.useRequestRevision()

  const [showDialog, setShowDialog] = useState(false)
  const [viewingMaterial, setViewingMaterial] = useState<any>(null)
  const [editingMaterial, setEditingMaterial] = useState<any>(null)
  const [reviewingMaterial, setReviewingMaterial] = useState<any>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'revision' | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'pending'>('all')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const filteredMaterials = materials.filter(m => {
    if (filter === 'all') return true
    return m.status === filter || (filter === 'pending' && m.status === 'pending_review')
  })

  const handleCreate = async (data: any) => {
    setIsSubmitting(true)
    try {
      await createMaterial({
        ...data,
        authorId: session?.user?.id || '',
        authorRole: 'admin',
        status: 'published', // Admin can publish directly
        isPublic: true,
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

  const handleDelete = async (id: string) => {
    try {
      await deleteMaterial({ id: id as any })
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Failed to delete material')
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      await toggleActive({ id: id as any })
    } catch (error) {
      console.error('Error toggling material status:', error)
    }
  }

  const handleReviewAction = async () => {
    if (!reviewingMaterial || !reviewAction) return

    setIsSubmitting(true)
    try {
      const reviewData = {
        id: reviewingMaterial._id,
        reviewerId: session?.user?.id || '',
        notes: reviewNotes
      }

      if (reviewAction === 'approve') {
        await approveMaterial(reviewData)
        alert('Material approved successfully!')
      } else if (reviewAction === 'reject') {
        await rejectMaterial(reviewData)
        alert('Material rejected!')
      } else if (reviewAction === 'revision') {
        await requestRevision(reviewData)
        alert('Revision requested!')
      }

      setReviewingMaterial(null)
      setReviewNotes('')
      setReviewAction(null)
    } catch (error) {
      console.error('Error processing review:', error)
      alert('Failed to process review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openReviewDialog = (material: any) => {
    setReviewingMaterial(material)
    setReviewNotes(material.reviewNotes || '')
    setReviewAction(null)
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
    total: materials.length,
    published: materials.filter(m => m.status === 'published').length,
    draft: materials.filter(m => m.status === 'draft').length,
    pending: materials.filter(m => m.status === 'pending_review').length,
  }

  if (viewingMaterial) {
    return (
      <div>
        <MaterialViewer
          material={viewingMaterial}
          onBack={() => setViewingMaterial(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Learning Materials</h2>
          <p className="text-muted-foreground">
            Manage learning content for mentors and students
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Material
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
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
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
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
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'published' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('published')}
        >
          Published
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pending Review
        </Button>
        <Button
          variant={filter === 'draft' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('draft')}
        >
          Drafts
        </Button>
      </div>

      {/* Materials List */}
      <Card>
        <CardHeader>
          <CardTitle>Materials ({filteredMaterials.length})</CardTitle>
          <CardDescription>
            Click on a material to view details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No materials found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first learning material to get started
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Material
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMaterials.map((material) => (
                <Card key={material._id} className="relative hover:shadow-md transition-shadow">
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
                            {material.status}
                          </Badge>
                          {!material.isActive && (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{material.description}</p>

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
                            {material.tags.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{material.tags.length - 5} more
                              </Badge>
                            )}
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
                        {material.status === 'pending_review' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openReviewDialog(material)}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(material)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(material._id)}
                        >
                          {material.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirm(material._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
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
                    ? 'Update the learning material content'
                    : 'Create a new learning material for students and mentors'
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

      {/* Review Dialog */}
      <Dialog open={reviewingMaterial !== null} onOpenChange={() => {
        setReviewingMaterial(null)
        setReviewNotes('')
        setReviewAction(null)
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Review Material</DialogTitle>
            <DialogDescription>
              Review and provide feedback for "{reviewingMaterial?.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Material Preview */}
            {reviewingMaterial && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Material Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Category:</strong> {reviewingMaterial.category}</div>
                  <div><strong>Level:</strong> {reviewingMaterial.level}</div>
                  <div><strong>Difficulty:</strong> {reviewingMaterial.difficulty}</div>
                  <div><strong>Estimated Hours:</strong> {reviewingMaterial.estimatedHours}h</div>
                  <div><strong>Author:</strong> {reviewingMaterial.authorRole}</div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewingMaterial(reviewingMaterial)
                        setReviewingMaterial(null)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Notes/Comments */}
            <div className="space-y-2">
              <Label htmlFor="reviewNotes">Review Notes / Feedback *</Label>
              <Textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Provide detailed feedback, comments, or suggestions for improvement..."
                rows={6}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Your feedback will be sent to the mentor who created this material.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                className={`flex-1 ${reviewAction === 'approve' ? 'border-green-600 bg-green-50' : ''}`}
                onClick={() => setReviewAction('approve')}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Approve & Publish
              </Button>
              <Button
                variant="outline"
                className={`flex-1 ${reviewAction === 'revision' ? 'border-orange-600 bg-orange-50' : ''}`}
                onClick={() => setReviewAction('revision')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
              <Button
                variant="outline"
                className={`flex-1 ${reviewAction === 'reject' ? 'border-red-600 bg-red-50' : ''}`}
                onClick={() => setReviewAction('reject')}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>

            {/* Submit Review */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setReviewingMaterial(null)
                  setReviewNotes('')
                  setReviewAction(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReviewAction}
                disabled={!reviewAction || !reviewNotes.trim() || isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this material? This action cannot be undone.
              All associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete Material
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
