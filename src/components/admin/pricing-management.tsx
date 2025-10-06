'use client'

import { useState } from 'react'
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
  Calculator,
  Settings,
  AlertTriangle,
  TrendingUp
} from "lucide-react"
import { AdminService } from '@/services/admin-service'
import type { AdminPricingRule } from '@/services/admin-service'
import { Id } from '../../convex/_generated/dataModel'

export default function PricingManagement() {
  // Use Convex hooks - static methods
  const pricingRules = AdminService.usePricingRules() || []
  const createPricingRule = AdminService.useCreatePricingRule()
  const updatePricingRule = AdminService.useUpdatePricingRule()
  const deletePricingRule = AdminService.useDeletePricingRule()

  const [showDialog, setShowDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<AdminPricingRule | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Id<"adminPricingRules"> | null>(null)

  const [formData, setFormData] = useState({
    ruleName: '',
    category: 'session_pricing' as 'session_pricing' | 'bundle_discount' | 'mentor_commission' | 'platform_fee',
    basePrice: 150000,
    mentorShare: 70,
    platformFee: 30,
    discountTiers: [] as Array<{ sessionCount: number; discountPercentage: number }>,
    specialRates: {
      newStudentDiscount: 0,
      loyaltyDiscount: 0,
      referralDiscount: 0,
    },
    isActive: true,
    effectiveDate: new Date().toISOString().split('T')[0],
  })

  const resetForm = () => {
    setFormData({
      ruleName: '',
      category: 'session_pricing',
      basePrice: 150000,
      mentorShare: 70,
      platformFee: 30,
      discountTiers: [],
      specialRates: {
        newStudentDiscount: 0,
        loyaltyDiscount: 0,
        referralDiscount: 0,
      },
      isActive: true,
      effectiveDate: new Date().toISOString().split('T')[0],
    })
    setEditingRule(null)
  }

  const openDialog = (rule?: AdminPricingRule) => {
    if (rule) {
      setEditingRule(rule)
      setFormData({
        ruleName: rule.ruleName,
        category: rule.category,
        basePrice: rule.basePrice,
        mentorShare: rule.mentorShare,
        platformFee: rule.platformFee,
        discountTiers: rule.discountTiers || [],
        specialRates: rule.specialRates || {
          newStudentDiscount: 0,
          loyaltyDiscount: 0,
          referralDiscount: 0,
        },
        isActive: rule.isActive,
        effectiveDate: rule.effectiveDate,
      })
    } else {
      resetForm()
    }
    setShowDialog(true)
  }

  const handleSave = async () => {
    try {
      if (editingRule) {
        await updatePricingRule({
          id: editingRule._id,
          ...formData,
        })
      } else {
        await createPricingRule(formData)
      }
      setShowDialog(false)
      resetForm()
    } catch (error) {
      console.error('Error saving pricing rule:', error)
      alert('Failed to save pricing rule. Please try again.')
    }
  }

  const handleDelete = async (id: Id<"adminPricingRules">) => {
    try {
      await deletePricingRule({ id })
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting pricing rule:', error)
      alert('Failed to delete pricing rule. Please try again.')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (pricingRules === undefined) {
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
            Kelola aturan harga untuk platform
          </p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Pricing Rule
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
            <CardTitle className="text-sm font-medium">Avg Base Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                pricingRules.reduce((sum, rule) => sum + rule.basePrice, 0) /
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
            <CardTitle className="text-sm font-medium">Avg Mentor Share</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                pricingRules.reduce((sum, rule) => sum + rule.mentorShare, 0) /
                Math.max(pricingRules.length, 1)
              )}%
            </div>
            <p className="text-xs text-muted-foreground">
              of base price
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(pricingRules.map(r => r.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              unique categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Rules</CardTitle>
          <CardDescription>
            Aturan harga yang menentukan biaya dan distribusi pembayaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pricingRules.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pricing Rules</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first pricing rule to start managing platform costs
                </p>
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Rule
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {pricingRules.map((rule) => {
                  const mentorAmount = Math.round((rule.basePrice * rule.mentorShare) / 100)
                  const platformAmount = Math.round((rule.basePrice * rule.platformFee) / 100)

                  return (
                    <Card key={rule._id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{rule.ruleName}</h4>
                              <Badge variant="outline">
                                {rule.category.replace('_', ' ')}
                              </Badge>
                              <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                                {rule.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Base Price:</span>
                                <p className="font-medium text-green-600">
                                  {formatCurrency(rule.basePrice)}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Mentor Share:</span>
                                <p className="font-medium text-blue-600">
                                  {formatCurrency(mentorAmount)} ({rule.mentorShare}%)
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Platform Fee:</span>
                                <p className="font-medium text-purple-600">
                                  {formatCurrency(platformAmount)} ({rule.platformFee}%)
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Effective Date:</span>
                                <p className="font-medium">
                                  {new Date(rule.effectiveDate).toLocaleDateString('id-ID')}
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
                              onClick={() => setDeleteConfirm(rule._id)}
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
              Set pricing and commission rules for the platform
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Rule Name</Label>
              <Input
                value={formData.ruleName}
                onChange={(e) => setFormData({...formData, ruleName: e.target.value})}
                placeholder="e.g., Standard Mentoring Rate"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: typeof formData.category) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="session_pricing">Session Pricing</SelectItem>
                    <SelectItem value="bundle_discount">Bundle Discount</SelectItem>
                    <SelectItem value="mentor_commission">Mentor Commission</SelectItem>
                    <SelectItem value="platform_fee">Platform Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({...formData, effectiveDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label>Base Price (IDR)</Label>
              <Input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({...formData, basePrice: parseInt(e.target.value) || 0})}
                placeholder="150000"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mentor Share (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.mentorShare}
                  onChange={(e) => {
                    const mentorShare = parseInt(e.target.value) || 0
                    setFormData({
                      ...formData,
                      mentorShare,
                      platformFee: 100 - mentorShare
                    })
                  }}
                />
              </div>

              <div>
                <Label>Platform Fee (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.platformFee}
                  onChange={(e) => {
                    const platformFee = parseInt(e.target.value) || 0
                    setFormData({
                      ...formData,
                      platformFee,
                      mentorShare: 100 - platformFee
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
                  <span className="text-blue-600">Base Price:</span>
                  <p className="font-bold text-green-600">
                    {formatCurrency(formData.basePrice)}
                  </p>
                </div>
                <div>
                  <span className="text-blue-600">Mentor Gets:</span>
                  <p className="font-bold text-blue-600">
                    {formatCurrency(Math.round((formData.basePrice * formData.mentorShare) / 100))}
                  </p>
                </div>
                <div>
                  <span className="text-blue-600">Platform Gets:</span>
                  <p className="font-bold text-purple-600">
                    {formatCurrency(Math.round((formData.basePrice * formData.platformFee) / 100))}
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
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingRule ? 'Update Rule' : 'Create Rule'}
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
            >
              Delete Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
