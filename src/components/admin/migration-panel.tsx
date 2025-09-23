'use client'

import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { toast } from 'react-hot-toast'

/**
 * Migration Panel - Run data migration from JSON Server to Convex
 */
export function MigrationPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [migrationResult, setMigrationResult] = useState<any>(null)

  const runFullMigration = useMutation(api.migrations.runFullMigration)

  const handleRunMigration = async () => {
    if (!confirm('Are you sure you want to run data migration? This will add sample data to Convex.')) {
      return
    }

    setIsRunning(true)
    setMigrationResult(null)

    try {
      const result = await runFullMigration({})
      setMigrationResult(result)
      toast.success('Migration completed successfully!')
    } catch (error) {
      console.error('Migration failed:', error)
      toast.error(error instanceof Error ? error.message : 'Migration failed')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📦 Data Migration Panel
      </h3>

      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">
            ⚠️ Migration Process
          </h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>This will migrate sample data from JSON Server structure to Convex:</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>5 Sample Users (Admin, Mentors, Students)</li>
              <li>3 Sample Courses (React, Node.js, UI/UX)</li>
              <li>3 Bundle Packages (Monthly, Quarterly, Starter)</li>
            </ul>
            <p className="mt-2 font-medium">
              Run this once to populate your Convex database with test data.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunMigration}
          disabled={isRunning}
          className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
            isRunning
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRunning ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Running Migration...
            </div>
          ) : (
            '🚀 Run Data Migration'
          )}
        </button>

        {migrationResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">
              ✅ Migration Results
            </h4>
            <div className="text-sm text-green-700">
              <p><strong>Status:</strong> {migrationResult.message}</p>
              {migrationResult.results && (
                <div className="mt-2 space-y-1">
                  <p>• Users: {migrationResult.results.users?.count || 0} migrated</p>
                  <p>• Courses: {migrationResult.results.courses?.count || 0} migrated</p>
                  <p>• Bundles: {migrationResult.results.bundles?.count || 0} migrated</p>
                </div>
              )}
              {migrationResult.skipReason && (
                <p className="mt-2 font-medium">Skip reason: {migrationResult.skipReason}</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">
            🎯 Next Steps After Migration
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>1. Check the "Real Convex Demo" tab to see migrated data</p>
            <p>2. Test CRUD operations with real Convex functions</p>
            <p>3. Navigate to main application features</p>
            <p>4. Verify all functionality works with Convex backend</p>
          </div>
        </div>
      </div>
    </div>
  )
}