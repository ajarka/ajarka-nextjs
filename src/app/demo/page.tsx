'use client'

import React, { useState } from 'react'
import { SimpleUserDemo } from '@/components/examples/simple-user-demo'
import { ConvexDemo } from '@/components/examples/convex-demo'
import { MigrationPanel } from '@/components/admin/migration-panel'

/**
 * Demo Page
 * Mendemonstrasikan Service Layer Pattern dengan Convex Database
 * dan switching ke REST API
 */
export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'migration' | 'simple' | 'convex'>('migration')

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Service Layer Pattern Demo
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Demonstrasi implementasi Service Layer Pattern dengan support untuk
          <span className="font-semibold text-blue-600"> Convex Database</span> dan
          <span className="font-semibold text-green-600"> REST API</span>.
          Switch provider tanpa mengubah code component!
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('migration')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'migration'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📦 Data Migration
          </button>
          <button
            onClick={() => setActiveTab('simple')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'simple'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎯 Simple Demo
          </button>
          <button
            onClick={() => setActiveTab('convex')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'convex'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🚀 Real Convex Demo
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'migration' && <MigrationPanel />}
      {activeTab === 'simple' && <SimpleUserDemo />}
      {activeTab === 'convex' && <ConvexDemo />}

      {/* Implementation Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          🏗️ Implementation Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-2">Service Layer Benefits:</h4>
            <ul className="space-y-1">
              <li>✅ Provider abstraction</li>
              <li>✅ Business logic centralization</li>
              <li>✅ Type safety with TypeScript</li>
              <li>✅ Easy testing and mocking</li>
              <li>✅ Future migration ready</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Migration Strategy:</h4>
            <ul className="space-y-1">
              <li>🔄 Zero downtime switching</li>
              <li>🧪 A/B testing support</li>
              <li>📊 Performance comparison</li>
              <li>🛡️ Fallback mechanisms</li>
              <li>📈 Easy scalability</li>
            </ul>
          </div>
        </div>
      </div>

      {/* File Structure */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          📁 File Structure
        </h3>
        <pre className="text-sm text-gray-600 overflow-x-auto">
{`src/
├── services/
│   ├── base/
│   │   ├── data-provider.ts     # Interface abstraction
│   │   ├── convex-provider.ts   # Convex implementation
│   │   ├── rest-provider.ts     # REST API implementation
│   │   └── base-service.ts      # Base service class
│   └── user-service.ts          # User business logic
├── providers/
│   └── convex-provider.tsx      # Convex React provider
└── components/
    └── examples/
        ├── user-management.tsx  # Demo component
        └── provider-switcher.tsx # Provider switching demo

convex/
├── schema.ts                    # Database schema
├── users.ts                     # User functions
└── _generated/
    └── api.d.ts                 # Generated types`}
        </pre>
      </div>
    </div>
  )
}