'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Upload, Loader2 } from 'lucide-react'
import { MaterialContent } from '@/services/material-content-service'

// Dynamic import for MDEditor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

interface MaterialEditorProps {
  initialData?: Partial<MaterialContent>
  onSave: (data: any) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  mode: 'create' | 'edit'
}

const CATEGORIES = [
  'Programming',
  'Design',
  'Business',
  'Marketing',
  'Data Science',
  'Mobile Development',
  'Web Development',
  'DevOps',
  'Cloud Computing',
  'Cybersecurity',
  'Other'
]

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert']

export default function MaterialEditor({
  initialData,
  onSave,
  onCancel,
  isSubmitting = false,
  mode
}: MaterialEditorProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    level: initialData?.level || 1,
    difficulty: initialData?.difficulty || 'beginner',
    estimatedHours: initialData?.estimatedHours || 1,
    content: initialData?.content || '',
    videoUrl: initialData?.videoUrl || '',
    thumbnailUrl: initialData?.thumbnailUrl || '',
    tags: initialData?.tags || [],
    prerequisites: initialData?.prerequisites || [],
    objectives: initialData?.objectives || [],
    attachments: initialData?.attachments || [],
  })

  const [newTag, setNewTag] = useState('')
  const [newPrerequisite, setNewPrerequisite] = useState('')
  const [newObjective, setNewObjective] = useState('')
  const [newAttachment, setNewAttachment] = useState({ name: '', url: '', type: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] })
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !formData.prerequisites.includes(newPrerequisite.trim())) {
      setFormData({ ...formData, prerequisites: [...formData.prerequisites, newPrerequisite.trim()] })
      setNewPrerequisite('')
    }
  }

  const removePrerequisite = (prereq: string) => {
    setFormData({ ...formData, prerequisites: formData.prerequisites.filter(p => p !== prereq) })
  }

  const addObjective = () => {
    if (newObjective.trim() && !formData.objectives.includes(newObjective.trim())) {
      setFormData({ ...formData, objectives: [...formData.objectives, newObjective.trim()] })
      setNewObjective('')
    }
  }

  const removeObjective = (obj: string) => {
    setFormData({ ...formData, objectives: formData.objectives.filter(o => o !== obj) })
  }

  const addAttachment = () => {
    if (newAttachment.name.trim() && newAttachment.url.trim()) {
      setFormData({
        ...formData,
        attachments: [...formData.attachments, { ...newAttachment }]
      })
      setNewAttachment({ name: '', url: '', type: '' })
    }
  }

  const removeAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            General information about the learning material
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to React Hooks"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what students will learn"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Level (1-100)</Label>
              <Input
                id="level"
                type="number"
                min="1"
                max="100"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 1 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Content *</CardTitle>
          <CardDescription>
            Write your material content using Markdown. Supports code blocks, images, links, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div data-color-mode="light">
            <MDEditor
              value={formData.content}
              onChange={(val) => setFormData({ ...formData, content: val || '' })}
              height={600}
              preview="live"
              previewOptions={{
                rehypePlugins: [],
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Media */}
      <Card>
        <CardHeader>
          <CardTitle>Media (Optional)</CardTitle>
          <CardDescription>
            Add video content and thumbnail image
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL (YouTube or direct link)</Label>
            <Input
              id="videoUrl"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Objectives</CardTitle>
          <CardDescription>
            What will students achieve after completing this material?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="Add learning objective..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
            />
            <Button type="button" onClick={addObjective} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {formData.objectives.map((obj, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="flex-1">{obj}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeObjective(obj)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
          <CardDescription>
            What should students know before starting?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newPrerequisite}
              onChange={(e) => setNewPrerequisite(e.target.value)}
              placeholder="Add prerequisite..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
            />
            <Button type="button" onClick={addPrerequisite} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.prerequisites.map((prereq, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {prereq}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removePrerequisite(prereq)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>
            Add tags to help categorize this material
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="gap-1">
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardHeader>
          <CardTitle>Attachments & Resources</CardTitle>
          <CardDescription>
            Add downloadable files and additional resources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              value={newAttachment.name}
              onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
              placeholder="File name"
            />
            <Input
              value={newAttachment.url}
              onChange={(e) => setNewAttachment({ ...newAttachment, url: e.target.value })}
              placeholder="File URL"
            />
            <div className="flex gap-2">
              <Select
                value={newAttachment.type}
                onValueChange={(value) => setNewAttachment({ ...newAttachment, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={addAttachment} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {formData.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <Upload className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <p className="font-medium">{attachment.name}</p>
                  <p className="text-sm text-muted-foreground">{attachment.type}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.title || !formData.content}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            mode === 'create' ? 'Create Material' : 'Update Material'
          )}
        </Button>
      </div>
    </form>
  )
}
