'use client'

import React, { useState, useEffect } from 'react'
import { AdminService, AdminPricingRule } from '@/lib/admin-service'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  DollarSign,
  Plus, 
  Edit,
  Trash2,
  AlertTriangle,
  Users,
  Clock,
  Monitor,
  Globe
} from "lucide-react"

const MATERIAL_OPTIONS = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular',
  'Node.js', 'Python', 'Java', 'PHP', 'Go', 'PostgreSQL', 'MongoDB', 
  'Redis', 'Docker', 'AWS', 'Azure', 'GCP'
]

const DURATION_OPTIONS = [30, 60, 90, 120, 180, 240]

interface PricingManagementProps {
  onUpdate?: () => void
}

export default function PricingManagement({ onUpdate }: PricingManagementProps) {
  const [rules, setRules] = useState<AdminPricingRule[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<AdminPricingRule | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    materials: [] as string[],
    meetingType: 'online' as 'online' | 'offline',
    minDuration: 60,
    maxDuration: 120,
    sessionType: 'mentoring' as 'mentoring' | 'event',
    studentPrice: 150000,
    mentorFeePercentage: 70,
    adminFeePercentage: 30,
    isActive: true
  })
  const [newMaterial, setNewMaterial] = useState('')

  useEffect(() => {
    fetchPricingRules()
  }, [])

  const fetchPricingRules = async () => {
    setLoading(true)
    const rules = await AdminService.getPricingRules()
    setRules(rules)
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      materials: [],
      meetingType: 'online',
      minDuration: 60,
      maxDuration: 120,
      sessionType: 'mentoring',
      studentPrice: 150000,
      mentorFeePercentage: 70,
      adminFeePercentage: 30,
      isActive: true
    })
    setNewMaterial('')
    setEditingRule(null)
    setShowDialog(false)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || formData.materials.length === 0) {
      alert('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      if (editingRule) {
        await AdminService.updatePricingRule(editingRule.id.toString(), formData)
      } else {
        await AdminService.createPricingRule(formData)
      }
      await fetchPricingRules()
      onUpdate?.()
      resetForm()
    } catch (error) {
      console.error('Failed to save pricing rule:', error)
      alert('Failed to save pricing rule')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (rule: AdminPricingRule) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      materials: rule.materials,
      meetingType: rule.meetingType,
      minDuration: rule.minDuration,
      maxDuration: rule.maxDuration,
      sessionType: rule.sessionType,
      studentPrice: rule.studentPrice,
      mentorFeePercentage: rule.mentorFeePercentage,
      adminFeePercentage: rule.adminFeePercentage,
      isActive: rule.isActive
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: number) => {
    setSaving(true)
    try {
      await AdminService.deletePricingRule(id.toString())
      await fetchPricingRules()
      onUpdate?.()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete pricing rule:', error)
      alert('Failed to delete pricing rule')
    } finally {
      setSaving(false)
    }
  }

  const calculateFees = (price: number, mentorPercent: number, adminPercent: number) => {
    const mentorFee = AdminService.calculateMentorFee(price, mentorPercent)
    const adminFee = AdminService.calculateAdminFee(price, adminPercent)
    return { mentorFee, adminFee }
  }

  const addMaterial = (material: string) => {
    if (material && !formData.materials.includes(material)) {
      setFormData({
        ...formData,
        materials: [...formData.materials, material]
      })
    }
  }

  const removeMaterial = (material: string) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter(m => m !== material)
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
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
          <h2 className="text-2xl font-bold text-gray-900">Pricing Management</h2>
          <p className="text-sm text-gray-600">Create and manage pricing rules for different materials and session types</p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Pricing Rule
        </Button>
      </div>

      {/* Pricing Rules List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pricing Rules ({rules.length})</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {rules.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>No pricing rules created yet.</p>
              <p className="text-sm">Create your first rule to get started.</p>
            </div>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{rule.name}</h4>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant={rule.meetingType === 'online' ? "default" : "outline"}>
                        {rule.meetingType === 'online' ? (
                          <><Monitor className="h-3 w-3 mr-1" /> Online</>
                        ) : (
                          <><Globe className="h-3 w-3 mr-1" /> Offline</>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Materials: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.materials.map((material, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>Student Price: <span className="font-medium text-gray-900">{formatCurrency(rule.studentPrice)}</span></div>
                      <div>Mentor Fee: <span className="font-medium text-green-600">{rule.mentorFeePercentage}%</span></div>
                      <div>Admin Fee: <span className="font-medium text-blue-600">{rule.adminFeePercentage}%</span></div>
                      <div>Duration: <span className="font-medium">{rule.minDuration}-{rule.maxDuration} min</span></div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>Mentor gets: <span className="font-bold text-green-600">{formatCurrency(calculateFees(rule.studentPrice, rule.mentorFeePercentage, rule.adminFeePercentage).mentorFee)}</span></div>
                        <div>Admin gets: <span className="font-bold text-blue-600">{formatCurrency(calculateFees(rule.studentPrice, rule.mentorFeePercentage, rule.adminFeePercentage).adminFee)}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(rule)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm(rule.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={() => !saving && resetForm()}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Pricing Rule' : 'Add New Pricing Rule'}
            </DialogTitle>
            <DialogDescription>
              Configure pricing for materials, duration, and session types
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Frontend Development - Online"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Meeting Type</Label>
                <Select value={formData.meetingType} onValueChange={(value: 'online' | 'offline') => setFormData({...formData, meetingType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Session Type</Label>
                <Select value={formData.sessionType} onValueChange={(value: 'mentoring' | 'event') => setFormData({...formData, sessionType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mentoring">Regular Mentoring</SelectItem>
                    <SelectItem value="event">Special Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Duration (minutes)</Label>
                <Select value={formData.minDuration.toString()} onValueChange={(value) => setFormData({...formData, minDuration: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((duration) => (
                      <SelectItem key={duration} value={duration.toString()}>
                        {duration} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Max Duration (minutes)</Label>
                <Select value={formData.maxDuration.toString()} onValueChange={(value) => setFormData({...formData, maxDuration: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((duration) => (
                      <SelectItem key={duration} value={duration.toString()}>
                        {duration} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Materials Selection */}
            <div>
              <Label>Materials Covered</Label>
              <div className="flex gap-2 mb-2">
                <Select value={newMaterial} onValueChange={setNewMaterial}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select material to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_OPTIONS.filter(m => !formData.materials.includes(m)).map((material) => (
                      <SelectItem key={material} value={material}>
                        {material}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => {
                    if (newMaterial) {
                      addMaterial(newMaterial)
                      setNewMaterial('')
                    }
                  }}
                  disabled={!newMaterial}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.materials.map((material, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
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

            {/* Pricing */}
            <div>
              <Label>Student Price (IDR)</Label>
              <Input
                type="number"
                value={formData.studentPrice}
                onChange={(e) => setFormData({ ...formData, studentPrice: parseInt(e.target.value) || 0 })}
                min="0"
                step="1000"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mentor Fee (%)</Label>
                <Input
                  type="number"
                  value={formData.mentorFeePercentage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setFormData({ 
                      ...formData, 
                      mentorFeePercentage: value,
                      adminFeePercentage: 100 - value
                    })
                  }}
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label>Admin Fee (%)</Label>
                <Input
                  type="number"
                  value={formData.adminFeePercentage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setFormData({ 
                      ...formData, 
                      adminFeePercentage: value,
                      mentorFeePercentage: 100 - value
                    })
                  }}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Fee Calculation Preview */}
            {formData.studentPrice > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Fee Distribution Preview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span>Mentor will receive:</span>
                    <div className="font-bold text-green-600">
                      {formatCurrency(AdminService.calculateMentorFee(formData.studentPrice, formData.mentorFeePercentage))}
                    </div>
                  </div>
                  <div>
                    <span>Admin will receive:</span>
                    <div className="font-bold text-blue-600">
                      {formatCurrency(AdminService.calculateAdminFee(formData.studentPrice, formData.adminFeePercentage))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
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
              Are you sure you want to delete this pricing rule? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}