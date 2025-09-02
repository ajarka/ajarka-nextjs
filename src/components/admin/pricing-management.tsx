'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Calculator,
  Settings,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Globe,
  Monitor
} from "lucide-react"
import { AdminService, AdminPricingRule } from '@/lib/admin-service'

const MATERIAL_OPTIONS = [
  'Frontend Development',
  'Backend Development', 
  'Full Stack Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'UI/UX Design',
  'Mobile Development',
  'Cybersecurity',
  'Cloud Computing'
]

const DURATION_OPTIONS = [30, 60, 90, 120, 180]

export default function PricingManagement() {
  const [pricingRules, setPricingRules] = useState<AdminPricingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<AdminPricingRule | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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

  const fetchPricingRules = async () => {
    setLoading(true)
    const rules = await AdminService.getPricingRules()
    setPricingRules(rules)
    setLoading(false)
  }

  useEffect(() => {
    fetchPricingRules()
  }, [])

  const resetForm = () => {
    setFormData({
      material: '',
      meetingType: 'online',
      duration: 60,
      sessionType: 'mentoring',
      studentPrice: 150000,
      mentorFeePercentage: 70,
      adminFeePercentage: 30,
      isActive: true
    })
    setEditingRule(null)
  }

  const openDialog = (rule?: AdminPricingRule) => {
    if (rule) {
      setEditingRule(rule)
      setFormData({
        material: rule.material,
        meetingType: rule.meetingType,
        duration: rule.duration,
        sessionType: rule.sessionType,
        studentPrice: rule.studentPrice,
        mentorFeePercentage: rule.mentorFeePercentage,
        adminFeePercentage: rule.adminFeePercentage,
        isActive: rule.isActive
      })
    } else {
      resetForm()
    }
    setShowDialog(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingRule) {
        await AdminService.updatePricingRule(editingRule.id, formData)
      } else {
        await AdminService.createPricingRule(formData)
      }
      await fetchPricingRules()
      setShowDialog(false)
      resetForm()
    } catch (error) {
      console.error('Error saving pricing rule:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSaving(true)
    try {
      await AdminService.deletePricingRule(id)
      await fetchPricingRules()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting pricing rule:', error)
    } finally {
      setSaving(false)
    }
  }

  const calculateFees = (price: number, mentorPercent: number, adminPercent: number) => {
    const mentorFee = AdminService.calculateMentorFee(price, mentorPercent)
    const adminFee = AdminService.calculateAdminFee(price, adminPercent)
    return { mentorFee, adminFee }
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
          <h2 className="text-2xl font-bold">Pricing Management</h2>
          <p className="text-muted-foreground">
            Kelola aturan harga berdasarkan materi, durasi, dan tipe sesi
          </p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Pricing Rule
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pricingRules.length}</div>
            <p className="text-xs text-muted-foreground">
              {pricingRules.filter(r => r.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Student Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                pricingRules.reduce((sum, rule) => sum + rule.studentPrice, 0) / 
                Math.max(pricingRules.length, 1)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              across all rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Mentor Fee</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                pricingRules.reduce((sum, rule) => sum + rule.mentorFeePercentage, 0) / 
                Math.max(pricingRules.length, 1)
              )}%
            </div>
            <p className="text-xs text-muted-foreground">
              of student payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online vs Offline</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pricingRules.filter(r => r.meetingType === 'online').length}/
              {pricingRules.filter(r => r.meetingType === 'offline').length}
            </div>
            <p className="text-xs text-muted-foreground">
              online/offline rules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Rules</CardTitle>
          <CardDescription>
            Aturan harga yang menentukan biaya student dan fee mentor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pricingRules.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pricing Rules</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first pricing rule to start managing mentoring costs
                </p>
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Rule
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {pricingRules.map((rule) => {
                  const { mentorFee, adminFee } = calculateFees(
                    rule.studentPrice, 
                    rule.mentorFeePercentage, 
                    rule.adminFeePercentage
                  )

                  return (
                    <Card key={rule.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{rule.material}</h4>
                              <Badge variant={rule.meetingType === 'online' ? 'default' : 'secondary'}>
                                {rule.meetingType === 'online' ? (
                                  <><Monitor className="h-3 w-3 mr-1" />Online</>
                                ) : (
                                  <><Globe className="h-3 w-3 mr-1" />Offline</>
                                )}
                              </Badge>
                              <Badge variant={rule.sessionType === 'mentoring' ? 'outline' : 'destructive'}>
                                {rule.sessionType}
                              </Badge>
                              <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                                {rule.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Duration:</span>
                                <p className="font-medium">{rule.duration} minutes</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Student Price:</span>
                                <p className="font-medium text-green-600">
                                  {formatCurrency(rule.studentPrice)}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Mentor Fee:</span>
                                <p className="font-medium text-blue-600">
                                  {formatCurrency(mentorFee)} ({rule.mentorFeePercentage}%)
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Admin Fee:</span>
                                <p className="font-medium text-purple-600">
                                  {formatCurrency(adminFee)} ({rule.adminFeePercentage}%)
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDialog(rule)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Pricing Rule' : 'Add New Pricing Rule'}
            </DialogTitle>
            <DialogDescription>
              Set pricing based on material, type, and duration
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Material</Label>
                <Select value={formData.material} onValueChange={(value) => setFormData({...formData, material: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_OPTIONS.map((material) => (
                      <SelectItem key={material} value={material}>
                        {material}
                      </SelectItem>
                    ))}
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
                <Label>Duration (minutes)</Label>
                <Select value={formData.minDuration?.toString() || '60'} onValueChange={(value) => setFormData({...formData, minDuration: parseInt(value)})}>
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

            <div>
              <Label>Student Price (IDR)</Label>
              <Input
                type="number"
                value={formData.studentPrice}
                onChange={(e) => setFormData({...formData, studentPrice: parseInt(e.target.value)})}
                placeholder="150000"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mentor Fee Percentage</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.mentorFeePercentage}
                  onChange={(e) => {
                    const mentorPercent = parseInt(e.target.value)
                    setFormData({
                      ...formData, 
                      mentorFeePercentage: mentorPercent,
                      adminFeePercentage: 100 - mentorPercent
                    })
                  }}
                />
              </div>

              <div>
                <Label>Admin Fee Percentage</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.adminFeePercentage}
                  onChange={(e) => {
                    const adminPercent = parseInt(e.target.value)
                    setFormData({
                      ...formData, 
                      adminFeePercentage: adminPercent,
                      mentorFeePercentage: 100 - adminPercent
                    })
                  }}
                />
              </div>
            </div>

            {/* Fee Preview */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Fee Breakdown</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Student pays:</span>
                  <p className="font-bold text-green-600">
                    {formatCurrency(formData.studentPrice)}
                  </p>
                </div>
                <div>
                  <span className="text-blue-600">Mentor gets:</span>
                  <p className="font-bold text-blue-600">
                    {formatCurrency(AdminService.calculateMentorFee(formData.studentPrice, formData.mentorFeePercentage))}
                  </p>
                </div>
                <div>
                  <span className="text-blue-600">Admin gets:</span>
                  <p className="font-bold text-purple-600">
                    {formatCurrency(AdminService.calculateAdminFee(formData.studentPrice, formData.adminFeePercentage))}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              <Label htmlFor="isActive">Active Rule</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
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