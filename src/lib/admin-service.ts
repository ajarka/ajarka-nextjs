const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Admin Service for managing all administrative settings
export interface AdminPricingRule {
  id: number
  name: string
  materials: string[]
  meetingType: 'online' | 'offline'
  sessionType: 'mentoring' | 'event'
  studentPrice: number
  mentorFeePercentage: number
  adminFeePercentage: number
  minDuration: number
  maxDuration: number
  isActive: boolean
  createdAt: string
}

export interface AdminOfficeLocation {
  id: number
  name: string
  address: string
  city: string
  province: string
  postalCode: string
  capacity: number
  facilities: string[]
  isActive: boolean
  createdAt: string
}

export interface AdminEventTemplate {
  id: number
  title: string
  description: string
  category: string
  duration: number
  maxParticipants: number
  isOnline: boolean
  materials: string[]
  requirements: string[]
  isActive: boolean
  createdAt: string
}

export interface AdminSettings {
  id: string
  defaultMentorFeePercentage: number // default percentage for new pricing rules
  defaultAdminFeePercentage: number
  minimumSessionDuration: number
  maximumSessionDuration: number
  defaultSessionCapacity: number
  allowMentorCustomPricing: boolean
  requireAdminApprovalForEvents: boolean
  updatedAt: string
}

export class AdminService {
  // Pricing Rules Management
  static async getPricingRules(): Promise<AdminPricingRule[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin_pricing_rules`)
      if (!response.ok) throw new Error('Failed to fetch pricing rules')
      return await response.json()
    } catch (error) {
      console.error('Error fetching pricing rules:', error)
      return []
    }
  }

  static async createPricingRule(rule: Omit<AdminPricingRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminPricingRule | null> {
    try {
      const newRule = {
        ...rule,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await fetch(`${API_BASE_URL}/admin_pricing_rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      })

      if (!response.ok) throw new Error('Failed to create pricing rule')
      return await response.json()
    } catch (error) {
      console.error('Error creating pricing rule:', error)
      return null
    }
  }

  static async updatePricingRule(id: string, updates: Partial<AdminPricingRule>): Promise<AdminPricingRule | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin_pricing_rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date().toISOString()
        })
      })

      if (!response.ok) throw new Error('Failed to update pricing rule')
      return await response.json()
    } catch (error) {
      console.error('Error updating pricing rule:', error)
      return null
    }
  }

  static async deletePricingRule(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin_pricing_rules/${id}`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (error) {
      console.error('Error deleting pricing rule:', error)
      return false
    }
  }

  // Office Locations Management
  static async getOfficeLocations(): Promise<AdminOfficeLocation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin_office_locations`)
      if (!response.ok) throw new Error('Failed to fetch office locations')
      return await response.json()
    } catch (error) {
      console.error('Error fetching office locations:', error)
      return []
    }
  }

  static async createOfficeLocation(location: Omit<AdminOfficeLocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminOfficeLocation | null> {
    try {
      const newLocation = {
        ...location,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await fetch(`${API_BASE_URL}/admin_office_locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLocation)
      })

      if (!response.ok) throw new Error('Failed to create office location')
      return await response.json()
    } catch (error) {
      console.error('Error creating office location:', error)
      return null
    }
  }

  static async updateOfficeLocation(id: string, updates: Partial<AdminOfficeLocation>): Promise<AdminOfficeLocation | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin_office_locations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date().toISOString()
        })
      })

      if (!response.ok) throw new Error('Failed to update office location')
      return await response.json()
    } catch (error) {
      console.error('Error updating office location:', error)
      return null
    }
  }

  static async deleteOfficeLocation(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin_office_locations/${id}`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (error) {
      console.error('Error deleting office location:', error)
      return false
    }
  }

  // Event Templates Management
  static async getEventTemplates(): Promise<AdminEventTemplate[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin_event_templates`)
      if (!response.ok) throw new Error('Failed to fetch event templates')
      return await response.json()
    } catch (error) {
      console.error('Error fetching event templates:', error)
      return []
    }
  }

  static async createEventTemplate(template: Omit<AdminEventTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminEventTemplate | null> {
    try {
      const newTemplate = {
        ...template,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await fetch(`${API_BASE_URL}/admin_event_templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      })

      if (!response.ok) throw new Error('Failed to create event template')
      return await response.json()
    } catch (error) {
      console.error('Error creating event template:', error)
      return null
    }
  }

  // Pricing Calculation Utilities
  static calculateMentorFee(studentPrice: number, mentorFeePercentage: number): number {
    return Math.round(studentPrice * (mentorFeePercentage / 100))
  }

  static calculateAdminFee(studentPrice: number, adminFeePercentage: number): number {
    return Math.round(studentPrice * (adminFeePercentage / 100))
  }

  static findPricingRule(
    material: string,
    meetingType: 'online' | 'offline',
    duration: number,
    sessionType: 'mentoring' | 'event',
    rules: AdminPricingRule[]
  ): AdminPricingRule | null {
    return rules.find(rule => 
      rule.material === material &&
      rule.meetingType === meetingType &&
      rule.duration === duration &&
      rule.sessionType === sessionType &&
      rule.isActive
    ) || null
  }

  // Admin Settings
  static async getAdminSettings(): Promise<AdminSettings | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin_settings`)
      const settings = await response.json()
      return settings.length > 0 ? settings[0] : null
    } catch (error) {
      console.error('Error fetching admin settings:', error)
      return null
    }
  }

  static async updateAdminSettings(updates: Partial<AdminSettings>): Promise<AdminSettings | null> {
    try {
      const currentSettings = await this.getAdminSettings()
      
      if (currentSettings) {
        const response = await fetch(`${API_BASE_URL}/admin_settings/${currentSettings.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updates,
            updatedAt: new Date().toISOString()
          })
        })
        return response.ok ? await response.json() : null
      } else {
        // Create new settings if none exist
        const newSettings = {
          ...updates,
          id: '1',
          updatedAt: new Date().toISOString()
        }
        
        const response = await fetch(`${API_BASE_URL}/admin_settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSettings)
        })
        return response.ok ? await response.json() : null
      }
    } catch (error) {
      console.error('Error updating admin settings:', error)
      return null
    }
  }

  // Pricing Calculation Methods
  static calculateSessionPrice(
    pricingRules: AdminPricingRule[], 
    sessionParams: {
      materials: string[]
      duration: number
      isOnline: boolean
      sessionType: 'mentoring' | 'event'
    }
  ): number {
    const { materials, duration, isOnline, sessionType } = sessionParams
    
    // Find matching pricing rules based on materials, meeting type, and session type
    const matchingRules = pricingRules.filter(rule => 
      materials.some(material => 
        rule.materials.some(ruleMaterial => 
          ruleMaterial.toLowerCase().includes(material.toLowerCase()) || 
          material.toLowerCase().includes(ruleMaterial.toLowerCase())
        )
      ) &&
      rule.meetingType === (isOnline ? 'online' : 'offline') &&
      rule.sessionType === sessionType &&
      rule.isActive
    )
    
    if (matchingRules.length === 0) {
      // Fallback pricing if no rules match
      return isOnline ? 150000 : 200000
    }
    
    // Use the first matching rule or calculate average if multiple matches
    const averagePrice = matchingRules.reduce((sum, rule) => sum + rule.studentPrice, 0) / matchingRules.length
    
    // Apply duration multiplier if session is longer than standard 60 minutes
    const durationMultiplier = Math.max(1, duration / 60)
    
    return Math.round(averagePrice * durationMultiplier)
  }

  static getSettings(): { mentorFeePercentage: number; adminFeePercentage: number } {
    // Default settings - in a real app this would come from the database
    return {
      mentorFeePercentage: 70,
      adminFeePercentage: 30
    }
  }

  static calculateMentorFee(studentPrice: number, mentorFeePercentage: number): number {
    return Math.round(studentPrice * (mentorFeePercentage / 100))
  }

  static calculateAdminFee(studentPrice: number, adminFeePercentage: number): number {
    return Math.round(studentPrice * (adminFeePercentage / 100))
  }

  // Alias methods for compatibility
  static async getAllPricingRules(): Promise<AdminPricingRule[]> {
    return this.getPricingRules()
  }

  static async getAllLocations(): Promise<AdminOfficeLocation[]> {
    return this.getOfficeLocations()
  }

  // Event Templates Management  
  static async getAllEventTemplates(): Promise<AdminEventTemplate[]> {
    return this.getEventTemplates()
  }

  static async createEventTemplate(template: Omit<AdminEventTemplate, 'id' | 'createdAt'>): Promise<AdminEventTemplate | null> {
    try {
      const newTemplate = {
        ...template,
        id: Date.now(),
        createdAt: new Date().toISOString()
      }

      const response = await fetch(`${API_BASE_URL}/admin_event_templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      })

      if (!response.ok) throw new Error('Failed to create event template')
      return await response.json()
    } catch (error) {
      console.error('Error creating event template:', error)
      return null
    }
  }

  static async updateEventTemplate(id: number, updates: Partial<AdminEventTemplate>): Promise<AdminEventTemplate | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin_event_templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Failed to update event template')
      return await response.json()
    } catch (error) {
      console.error('Error updating event template:', error)
      return null
    }
  }

  static async deleteEventTemplate(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin_event_templates/${id}`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (error) {
      console.error('Error deleting event template:', error)
      return false
    }
  }
}