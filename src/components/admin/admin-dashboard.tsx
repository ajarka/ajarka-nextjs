'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Settings,
  DollarSign,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Building,
  Monitor,
  Globe,
  AlertTriangle
} from "lucide-react"
import PricingManagement from './pricing-management'
import LocationManagement from './location-management'
import EventManagement from './event-management'
import BundleManagement from './bundle-management'
import SubscriptionTracking from './subscription-tracking'
import { AdminService, AdminPricingRule, AdminOfficeLocation } from '@/lib/admin-service'

export default function AdminDashboard() {
  const [pricingRules, setPricingRules] = useState<AdminPricingRule[]>([])
  const [locations, setLocations] = useState<AdminOfficeLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    avgMentorFee: 0,
    activeLocations: 0,
    totalCapacity: 0
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rules, locs] = await Promise.all([
        AdminService.getPricingRules(),
        AdminService.getOfficeLocations()
      ])
      
      setPricingRules(rules)
      setLocations(locs)
      
      // Calculate stats
      const totalRevenue = rules.reduce((sum, rule) => sum + rule.studentPrice, 0)
      const avgMentorFee = rules.length > 0 
        ? rules.reduce((sum, rule) => sum + rule.mentorFeePercentage, 0) / rules.length 
        : 0
      const activeLocations = locs.filter(loc => loc.isActive).length
      const totalCapacity = locs.filter(loc => loc.isActive).reduce((sum, loc) => sum + loc.capacity, 0)
      
      setStats({
        totalRevenue,
        avgMentorFee,
        activeLocations,
        totalCapacity
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Kelola pricing, lokasi, dan pengaturan sistem mentoring Ajarka
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pricing Rules</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pricingRules.length}</div>
            <p className="text-xs text-muted-foreground">
              {pricingRules.filter(r => r.isActive).length} active rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Mentor Fee</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgMentorFee)}%</div>
            <p className="text-xs text-muted-foreground">
              of student payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLocations}</div>
            <p className="text-xs text-muted-foreground">
              office locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCapacity}</div>
            <p className="text-xs text-muted-foreground">
              people across all locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Rules Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Rules Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Online Sessions:</span>
                <Badge variant="default">
                  {pricingRules.filter(r => r.meetingType === 'online').length} rules
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Offline Sessions:</span>
                <Badge variant="secondary">
                  {pricingRules.filter(r => r.meetingType === 'offline').length} rules
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Event Sessions:</span>
                <Badge variant="destructive">
                  {pricingRules.filter(r => r.sessionType === 'event').length} rules
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Regular Mentoring:</span>
                <Badge variant="outline">
                  {pricingRules.filter(r => r.sessionType === 'mentoring').length} rules
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Locations Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Cities:</span>
                <Badge variant="default">
                  {new Set(locations.map(l => l.city)).size} cities
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Largest Capacity:</span>
                <Badge variant="secondary">
                  {Math.max(...locations.map(l => l.capacity), 0)} people
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Capacity:</span>
                <Badge variant="outline">
                  {Math.round(stats.totalCapacity / Math.max(locations.length, 1))} people
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Most Common Facility:</span>
                <Badge variant="destructive">
                  WiFi ({locations.filter(l => l.facilities.includes('wifi')).length} locations)
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="pricing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing Management
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location Management
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Event Management
          </TabsTrigger>
          <TabsTrigger value="bundles" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Bundle Management
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Subscriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing">
          <PricingManagement />
        </TabsContent>

        <TabsContent value="locations">
          <LocationManagement />
        </TabsContent>

        <TabsContent value="events">
          <EventManagement onEventUpdate={fetchData} />
        </TabsContent>

        <TabsContent value="bundles">
          <BundleManagement />
        </TabsContent>

        <TabsContent value="subscriptions">
          <SubscriptionTracking />
        </TabsContent>
      </Tabs>
    </div>
  )
}