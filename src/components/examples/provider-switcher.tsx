'use client'

import React, { useState, useEffect } from 'react'
import { UserService } from '@/services/user-service'
import { BaseService } from '@/services/base/base-service'
import { RestProvider } from '@/services/base/rest-provider'
import { ConvexProvider } from '@/services/base/convex-provider'

/**
 * Provider Switcher Component
 * Demonstrates how to switch between Convex and REST API implementations
 * IMPORTANT: Ini hanya untuk demo/development purposes
 */
export function ProviderSwitcher() {
  const [currentProvider, setCurrentProvider] = useState<'convex' | 'rest'>('convex')
  const [isLoading, setIsLoading] = useState(false)

  // Get current provider info
  const providerInfo = UserService.getProviderInfo()

  // Simulate provider switching (in real app, this would be environment variable)
  const switchProvider = async (newProvider: 'convex' | 'rest') => {
    setIsLoading(true)

    try {
      // Set new provider
      if (newProvider === 'convex') {
        BaseService.setProvider(new ConvexProvider())
      } else {
        BaseService.setProvider(new RestProvider())
      }

      setCurrentProvider(newProvider)

      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500))

    } catch (error) {
      console.error('Error switching provider:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Data Provider Configuration
      </h3>

      <div className="space-y-4">
        {/* Current Provider Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Current Status</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Provider:</span>
              <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
                {providerInfo.provider}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Environment:</span>
              <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_DATA_PROVIDER || 'convex'}
              </span>
            </div>
          </div>
        </div>

        {/* Provider Options */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Switch Provider</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Convex Option */}
            <button
              onClick={() => switchProvider('convex')}
              disabled={isLoading || currentProvider === 'convex'}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentProvider === 'convex'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-left">
                <div className="font-semibold">Convex Database</div>
                <div className="text-sm text-gray-600 mt-1">
                  Real-time, reactive database with automatic sync
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  ✅ Real-time updates<br/>
                  ✅ Optimistic UI<br/>
                  ✅ Offline support<br/>
                  ✅ TypeScript integration
                </div>
              </div>
            </button>

            {/* REST Option */}
            <button
              onClick={() => switchProvider('rest')}
              disabled={isLoading || currentProvider === 'rest'}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentProvider === 'rest'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-left">
                <div className="font-semibold">REST API</div>
                <div className="text-sm text-gray-600 mt-1">
                  Traditional HTTP API with React Query
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  ✅ Standard HTTP methods<br/>
                  ✅ Caching with React Query<br/>
                  ✅ Familiar architecture<br/>
                  ✅ Easy backend switching
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Switching provider...</span>
          </div>
        )}

        {/* Migration Guide */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-yellow-800 mb-2">
            🚀 Production Migration Guide
          </h4>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>
              <strong>Environment Variable:</strong> Set <code>NEXT_PUBLIC_DATA_PROVIDER</code> to switch providers
            </p>
            <p>
              <strong>Convex:</strong> <code>NEXT_PUBLIC_DATA_PROVIDER=convex</code>
            </p>
            <p>
              <strong>REST API:</strong> <code>NEXT_PUBLIC_DATA_PROVIDER=rest</code>
            </p>
            <p className="mt-3 font-medium">
              No code changes needed in components - Service Layer handles everything! 🎉
            </p>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3">Usage Example</h4>
          <pre className="text-sm text-gray-600 overflow-x-auto">
{`// Same code works with both providers!
const users = UserService.useAllUsers()
const createUser = UserService.useCreateUser()

// Provider switching is transparent
const handleCreate = async (userData) => {
  await createUser(userData)
  // Works with Convex OR REST API
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}