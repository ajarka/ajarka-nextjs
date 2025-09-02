'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Package, 
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Settings,
  Percent,
  Target
} from "lucide-react"
import { BundleService, BundlePackage, DiscountRule } from '@/lib/bundle-service'

export default function BundleManagement() {
  const [bundles, setBundles] = useState<BundlePackage[]>([])
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showBundleDialog, setShowBundleDialog] = useState(false)
  const [showDiscountDialog, setShowDiscountDialog] = useState(false)
  const [editingBundle, setEditingBundle] = useState<BundlePackage | null>(null)
  const [editingDiscount, setEditingDiscount] = useState<DiscountRule | null>(null)

  // Bundle form state
  const [bundleForm, setBundleForm] = useState({
    name: '',
    description: '',
    type: 'monthly' as const,
    sessionCount: 1,
    originalPrice: 0,
    discountPercentage: 0,
    validityDays: 30,
    features: [''],
    isActive: true
  })

  // Discount form state
  const [discountForm, setDiscountForm] = useState({
    name: '',
    description: '',
    type: 'percentage' as const,
    value: 0,
    minSessions: 1,
    maxSessions: undefined as number | undefined,
    isActive: true
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [bundlesData, discountsData, analyticsData] = await Promise.all([
        BundleService.getAllBundlePackages(),
        BundleService.getAllDiscountRules(),
        BundleService.getBundleAnalytics()
      ])
      
      setBundles(bundlesData)
      setDiscountRules(discountsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateBundle = async () => {
    try {
      if (editingBundle) {
        await BundleService.updateBundlePackage(editingBundle.id, {
          ...bundleForm,
          features: bundleForm.features.filter(f => f.trim() !== '')
        })
      } else {
        await BundleService.createBundlePackage({
          ...bundleForm,
          features: bundleForm.features.filter(f => f.trim() !== '')
        })
      }
      
      setShowBundleDialog(false)
      resetBundleForm()
      loadData()
    } catch (error) {
      console.error('Failed to save bundle:', error)
    }
  }

  const handleCreateDiscount = async () => {
    try {
      if (editingDiscount) {
        await BundleService.updateBundlePackage(editingDiscount.id, discountForm)
      } else {
        await BundleService.createDiscountRule(discountForm)
      }
      
      setShowDiscountDialog(false)
      resetDiscountForm()
      loadData()
    } catch (error) {
      console.error('Failed to save discount rule:', error)
    }
  }

  const resetBundleForm = () => {
    setBundleForm({
      name: '',
      description: '',
      type: 'monthly',
      sessionCount: 1,
      originalPrice: 0,
      discountPercentage: 0,
      validityDays: 30,
      features: [''],
      isActive: true
    })
    setEditingBundle(null)
  }

  const resetDiscountForm = () => {
    setDiscountForm({
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minSessions: 1,
      maxSessions: undefined,
      isActive: true
    })
    setEditingDiscount(null)
  }

  const handleEditBundle = (bundle: BundlePackage) => {
    setBundleForm({
      name: bundle.name,
      description: bundle.description,
      type: bundle.type,
      sessionCount: bundle.sessionCount,
      originalPrice: bundle.originalPrice,
      discountPercentage: bundle.discountPercentage,
      validityDays: bundle.validityDays,
      features: bundle.features.length > 0 ? bundle.features : [''],
      isActive: bundle.isActive
    })
    setEditingBundle(bundle)
    setShowBundleDialog(true)
  }

  const handleEditDiscount = (discount: DiscountRule) => {
    setDiscountForm({
      name: discount.name,
      description: discount.description,
      type: discount.type,
      value: discount.value,
      minSessions: discount.minSessions,
      maxSessions: discount.maxSessions,
      isActive: discount.isActive
    })
    setEditingDiscount(discount)
    setShowDiscountDialog(true)
  }

  const handleDeleteBundle = async (bundleId: string) => {
    if (confirm('Are you sure you want to delete this bundle package?')) {
      try {
        await BundleService.deleteBundlePackage(bundleId)
        loadData()
      } catch (error) {
        console.error('Failed to delete bundle:', error)
      }
    }
  }

  const addFeature = () => {
    setBundleForm(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setBundleForm(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }))
  }

  const removeFeature = (index: number) => {
    setBundleForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const finalPrice = bundleForm.originalPrice - (bundleForm.originalPrice * bundleForm.discountPercentage / 100)

  if (loading) {
    return <div className="flex justify-center p-8">Loading bundle management...</div>
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bundle Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.totalBundleRevenue)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bundles</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeBundles}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalSubscriptions} total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Discount</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.averageDiscount)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bundle Packages Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Bundle Packages
              </CardTitle>
              <CardDescription>
                Manage subscription bundles and session packages for students
              </CardDescription>
            </div>
            <Dialog open={showBundleDialog} onOpenChange={setShowBundleDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetBundleForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bundle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingBundle ? 'Edit Bundle Package' : 'Create Bundle Package'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure bundle details, pricing, and features
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Bundle Name</Label>
                    <Input
                      id="name"
                      value={bundleForm.name}
                      onChange={(e) => setBundleForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Monthly Mentoring Package"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Bundle Type</Label>
                    <Select 
                      value={bundleForm.type} 
                      onValueChange={(value: any) => setBundleForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly Subscription</SelectItem>
                        <SelectItem value="quarterly">Quarterly Subscription</SelectItem>
                        <SelectItem value="session_pack">Session Pack</SelectItem>
                        <SelectItem value="custom">Custom Bundle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sessionCount">Session Count</Label>
                    <Input
                      id="sessionCount"
                      type="number"
                      value={bundleForm.sessionCount}
                      onChange={(e) => setBundleForm(prev => ({ ...prev, sessionCount: parseInt(e.target.value) || 1 }))}
                      min="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="validityDays">Validity (Days)</Label>
                    <Input
                      id="validityDays"
                      type="number"
                      value={bundleForm.validityDays}
                      onChange={(e) => setBundleForm(prev => ({ ...prev, validityDays: parseInt(e.target.value) || 30 }))}
                      min="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (IDR)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={bundleForm.originalPrice}
                      onChange={(e) => setBundleForm(prev => ({ ...prev, originalPrice: parseInt(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discountPercentage">Discount (%)</Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      value={bundleForm.discountPercentage}
                      onChange={(e) => setBundleForm(prev => ({ ...prev, discountPercentage: parseInt(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={bundleForm.description}
                    onChange={(e) => setBundleForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what's included in this bundle..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Bundle Features</Label>
                  {bundleForm.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Feature description"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        disabled={bundleForm.features.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addFeature}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={bundleForm.isActive}
                    onCheckedChange={(checked) => setBundleForm(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active Bundle</Label>
                </div>
                
                {bundleForm.originalPrice > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Final Price:</strong> {formatCurrency(finalPrice)}
                      {bundleForm.discountPercentage > 0 && (
                        <span className="text-green-600 ml-2">
                          (Save {formatCurrency(bundleForm.originalPrice - finalPrice)})
                        </span>
                      )}
                    </p>
                  </div>
                )}
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowBundleDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBundle}>
                    {editingBundle ? 'Update Bundle' : 'Create Bundle'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {bundles.map((bundle) => (
              <Card key={bundle.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{bundle.name}</h3>
                        <Badge variant={bundle.isActive ? "default" : "secondary"}>
                          {bundle.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {bundle.sessionCount} sessions
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{bundle.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {bundle.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="space-y-1">
                        {bundle.discountPercentage > 0 && (
                          <p className="text-sm text-gray-400 line-through">
                            {formatCurrency(bundle.originalPrice)}
                          </p>
                        )}
                        <p className="text-lg font-bold">
                          {formatCurrency(bundle.finalPrice)}
                        </p>
                        {bundle.discountPercentage > 0 && (
                          <Badge className="bg-green-100 text-green-800">
                            -{bundle.discountPercentage}%
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditBundle(bundle)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBundle(bundle.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {bundles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No bundle packages found. Create your first bundle package to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Discount Rules Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Discount Rules
              </CardTitle>
              <CardDescription>
                Configure automatic discount rules based on session count
              </CardDescription>
            </div>
            <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetDiscountForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Discount Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingDiscount ? 'Edit Discount Rule' : 'Create Discount Rule'}
                  </DialogTitle>
                  <DialogDescription>
                    Set up automatic discounts for bulk bookings
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountName">Rule Name</Label>
                    <Input
                      id="discountName"
                      value={discountForm.name}
                      onChange={(e) => setDiscountForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Bulk Session Discount"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select 
                      value={discountForm.type} 
                      onValueChange={(value: any) => setDiscountForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">
                      Discount Value ({discountForm.type === 'percentage' ? '%' : 'IDR'})
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      value={discountForm.value}
                      onChange={(e) => setDiscountForm(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                      min="0"
                      max={discountForm.type === 'percentage' ? 100 : undefined}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minSessions">Minimum Sessions</Label>
                    <Input
                      id="minSessions"
                      type="number"
                      value={discountForm.minSessions}
                      onChange={(e) => setDiscountForm(prev => ({ ...prev, minSessions: parseInt(e.target.value) || 1 }))}
                      min="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxSessions">Maximum Sessions (Optional)</Label>
                    <Input
                      id="maxSessions"
                      type="number"
                      value={discountForm.maxSessions || ''}
                      onChange={(e) => {
                        const val = e.target.value
                        setDiscountForm(prev => ({ 
                          ...prev, 
                          maxSessions: val ? parseInt(val) : undefined 
                        }))
                      }}
                      placeholder="Leave empty for no limit"
                      min={discountForm.minSessions}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discountDescription">Description</Label>
                  <Textarea
                    id="discountDescription"
                    value={discountForm.description}
                    onChange={(e) => setDiscountForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe when this discount applies..."
                    rows={2}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="discountActive"
                    checked={discountForm.isActive}
                    onCheckedChange={(checked) => setDiscountForm(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="discountActive">Active Rule</Label>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDiscountDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDiscount}>
                    {editingDiscount ? 'Update Rule' : 'Create Rule'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {discountRules.map((rule) => (
              <Card key={rule.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                      <p className="text-sm">
                        <strong>Sessions:</strong> {rule.minSessions}
                        {rule.maxSessions ? ` - ${rule.maxSessions}` : '+'} sessions
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-lg font-bold text-green-600">
                        {rule.type === 'percentage' ? `${rule.value}%` : formatCurrency(rule.value)} OFF
                      </p>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditDiscount(rule)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {discountRules.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No discount rules found. Create discount rules to offer automatic discounts.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}