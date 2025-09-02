'use client'

import React, { useState, useEffect } from 'react'
import { AdminService, AdminEventTemplate } from '@/lib/admin-service'

interface EventManagementProps {
  onEventUpdate?: () => void
}

export default function EventManagement({ onEventUpdate }: EventManagementProps) {
  const [events, setEvents] = useState<AdminEventTemplate[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AdminEventTemplate | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: 60,
    maxParticipants: 30,
    isOnline: true,
    materials: [] as string[],
    requirements: [] as string[],
    isActive: true
  })

  const [newMaterial, setNewMaterial] = useState('')
  const [newRequirement, setNewRequirement] = useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const eventData = await AdminService.getAllEventTemplates()
      setEvents(eventData)
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

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
      isActive: true
    })
    setNewMaterial('')
    setNewRequirement('')
    setEditingEvent(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      if (editingEvent) {
        await AdminService.updateEventTemplate(editingEvent.id, formData)
      } else {
        await AdminService.createEventTemplate(formData)
      }
      await loadEvents()
      onEventUpdate?.()
      resetForm()
    } catch (error) {
      console.error('Failed to save event:', error)
      alert('Failed to save event template')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (event: AdminEventTemplate) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      duration: event.duration,
      maxParticipants: event.maxParticipants,
      isOnline: event.isOnline,
      materials: event.materials,
      requirements: event.requirements,
      isActive: event.isActive
    })
    setShowForm(true)
  }

  const handleDelete = async (event: AdminEventTemplate) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) return

    setLoading(true)
    try {
      await AdminService.deleteEventTemplate(event.id)
      await loadEvents()
      onEventUpdate?.()
    } catch (error) {
      console.error('Failed to delete event:', error)
      alert('Failed to delete event template')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (event: AdminEventTemplate) => {
    setLoading(true)
    try {
      await AdminService.updateEventTemplate(event.id, { isActive: !event.isActive })
      await loadEvents()
      onEventUpdate?.()
    } catch (error) {
      console.error('Failed to update event status:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
          <p className="text-sm text-gray-600">Create and manage public event templates</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Event Template
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingEvent ? 'Edit Event Template' : 'Add Event Template'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., React Workshop"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Programming, Design"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what this event covers..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    min="15"
                    max="480"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Type
                  </label>
                  <select
                    value={formData.isOnline ? 'online' : 'offline'}
                    onChange={(e) => setFormData({ ...formData, isOnline: e.target.value === 'online' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materials Covered
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add material..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                  />
                  <button
                    type="button"
                    onClick={addMaterial}
                    className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.materials.map((material, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      {material}
                      <button
                        type="button"
                        onClick={() => removeMaterial(material)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prerequisites
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add prerequisite..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.map((requirement, index) => (
                    <span
                      key={index}
                      className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      {requirement}
                      <button
                        type="button"
                        onClick={() => removeRequirement(requirement)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (available for assignment)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingEvent ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Event Templates ({events.length})</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {events.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>No event templates created yet.</p>
              <p className="text-sm">Create your first template to get started.</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.isOnline 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {event.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{event.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-3">
                      <div>Category: <span className="font-medium">{event.category}</span></div>
                      <div>Duration: <span className="font-medium">{event.duration} minutes</span></div>
                      <div>Max Participants: <span className="font-medium">{event.maxParticipants}</span></div>
                    </div>

                    {event.materials.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Materials: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.materials.map((material, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {material}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {event.requirements.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Prerequisites: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.requirements.map((req, index) => (
                            <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleStatus(event)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        event.isActive
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {event.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}