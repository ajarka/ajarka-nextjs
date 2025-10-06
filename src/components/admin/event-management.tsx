'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  Globe,
  MapPin,
  AlertTriangle,
  X
} from "lucide-react"
import { AdminService, EventTemplate } from '@/services/admin-service'
import { Id } from '../../../convex/_generated/dataModel'

export default function EventManagement() {
  // Use Convex hooks - static methods
  const eventTemplates = AdminService.useEventTemplates() || []
  const createEventTemplate = AdminService.useCreateEventTemplate()
  const updateEventTemplate = AdminService.useUpdateEventTemplate()
  const deleteEventTemplate = AdminService.useDeleteEventTemplate()

  const [showDialog, setShowDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EventTemplate | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Id<"eventTemplates"> | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: 60,
    maxParticipants: 30,
    isOnline: true,
    materials: [] as string[],
    requirements: [] as string[],
    isActive: true,
  })

  const [newMaterial, setNewMaterial] = useState('')
  const [newRequirement, setNewRequirement] = useState('')

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      duration: 60,
      maxParticipants: 30,
      isOnline: true,
      materials: [],
      requirements: [],
      isActive: true,
    })
    setNewMaterial('')
    setNewRequirement('')
    setEditingTemplate(null)
  }

  const openDialog = (template?: EventTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setFormData({
        title: template.title,
        description: template.description,
        category: template.category,
        duration: template.duration,
        maxParticipants: template.maxParticipants,
        isOnline: template.isOnline,
        materials: template.materials || [],
        requirements: template.requirements || [],
        isActive: template.isActive,
      })
    } else {
      resetForm()
    }
    setShowDialog(true)
  }

  const handleSave = async () => {
    try {
      if (editingTemplate) {
        await updateEventTemplate({
          id: editingTemplate._id,
          ...formData,
        })
      } else {
        await createEventTemplate(formData)
      }
      setShowDialog(false)
      resetForm()
    } catch (error) {
      console.error('Error saving event template:', error)
      alert('Failed to save event template. Please try again.')
    }
  }

  const handleDelete = async (id: Id<"eventTemplates">) => {
    try {
      await deleteEventTemplate({ id })
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting event template:', error)
      alert('Failed to delete event template. Please try again.')
    }
  }

  const addMaterial = () => {
    if (newMaterial.trim() && !formData.materials.includes(newMaterial.trim())) {
      setFormData({
        ...formData,
        materials: [...formData.materials, newMaterial.trim()]
      })
      setNewMaterial('')
    }
  }

  const removeMaterial = (material: string) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter(m => m !== material)
    })
  }

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()]
      })
      setNewRequirement('')
    }
  }

  const removeRequirement = (requirement: string) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter(r => r !== requirement)
    })
  }

  if (eventTemplates === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Event Management</h2>
          <p className="text-muted-foreground">
            Kelola template event untuk platform
          </p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Event Template
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventTemplates.length}</div>
            <p className="text-xs text-muted-foreground">
              {eventTemplates.filter(t => t.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                eventTemplates.reduce((sum, t) => sum + t.duration, 0) /
                Math.max(eventTemplates.length, 1)
              )} min
            </div>
            <p className="text-xs text-muted-foreground">
              average duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                eventTemplates.reduce((sum, t) => sum + t.maxParticipants, 0) /
                Math.max(eventTemplates.length, 1)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online/Offline</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eventTemplates.filter(t => t.isOnline).length}/{eventTemplates.filter(t => !t.isOnline).length}
            </div>
            <p className="text-xs text-muted-foreground">
              online vs offline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Event Templates</CardTitle>
          <CardDescription>
            Template event yang dapat digunakan untuk membuat acara
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventTemplates.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Event Templates</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first event template to start organizing events
                </p>
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Template
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {eventTemplates.map((template) => (
                  <Card key={template._id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{template.title}</h4>
                            <Badge variant="outline">{template.category}</Badge>
                            <Badge variant={template.isActive ? 'default' : 'secondary'}>
                              {template.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant={template.isOnline ? 'default' : 'outline'}>
                              {template.isOnline ? <Globe className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                              {template.isOnline ? 'Online' : 'Offline'}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">{template.description}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-muted-foreground">Duration:</span>
                              <p className="font-medium">{template.duration} minutes</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Max Participants:</span>
                              <p className="font-medium">{template.maxParticipants}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Materials:</span>
                              <p className="font-medium">{template.materials?.length || 0} items</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Requirements:</span>
                              <p className="font-medium">{template.requirements?.length || 0} items</p>
                            </div>
                          </div>

                          {template.materials && template.materials.length > 0 && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-muted-foreground">Materials: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {template.materials.map((material, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {material}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {template.requirements && template.requirements.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Requirements: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {template.requirements.map((req, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(template._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Event Template' : 'Add New Event Template'}
            </DialogTitle>
            <DialogDescription>
              Create or update event templates for the platform
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., React Workshop"
                />
              </div>

              <div>
                <Label>Category *</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., Programming, Design"
                />
              </div>
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what this event covers..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min="15"
                  max="480"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 60})}
                />
              </div>

              <div>
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value) || 30})}
                />
              </div>

              <div>
                <Label>Session Type</Label>
                <select
                  value={formData.isOnline ? 'online' : 'offline'}
                  onChange={(e) => setFormData({...formData, isOnline: e.target.value === 'online'})}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            {/* Materials */}
            <div>
              <Label>Materials Covered</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="Add material..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                />
                <Button type="button" onClick={addMaterial} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.materials.map((material, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {material}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeMaterial(material)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <Label>Prerequisites</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add prerequisite..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.requirements.map((requirement, index) => (
                  <Badge key={index} variant="outline" className="gap-1">
                    {requirement}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeRequirement(requirement)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              <Label htmlFor="isActive">Active Template</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
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
              Are you sure you want to delete this event template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
