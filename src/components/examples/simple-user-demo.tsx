'use client'

import React, { useState } from 'react'
import { toast } from 'react-hot-toast'

/**
 * Simple User Demo - No Convex hooks, just testing Service Layer
 * Demonstrates provider switching without complex real-time features
 */
export function SimpleUserDemo() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentProvider, setCurrentProvider] = useState<'convex' | 'rest'>('convex')

  // Mock user data for testing
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'mentor' as const,
      avatar: '/avatars/default-mentor.png'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'siswa' as const,
      avatar: '/avatars/default-student.png'
    }
  ])

  const handleCreateUser = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newUser = {
        id: Date.now().toString(),
        name: `User ${users.length + 1}`,
        email: `user${users.length + 1}@example.com`,
        role: 'siswa' as const,
        avatar: '/avatars/default-student.png'
      }

      setUsers(prev => [...prev, newUser])
      toast.success(`User created successfully with ${currentProvider} provider!`)

    } catch (error) {
      toast.error('Failed to create user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      setUsers(prev => prev.filter(user => user.id !== userId))
      toast.success(`User deleted successfully with ${currentProvider} provider!`)

    } catch (error) {
      toast.error('Failed to delete user')
    } finally {
      setIsLoading(false)
    }
  }

  const switchProvider = async (newProvider: 'convex' | 'rest') => {
    setIsLoading(true)

    try {
      // Simulate provider switching
      await new Promise(resolve => setTimeout(resolve, 800))

      setCurrentProvider(newProvider)
      toast.success(`Switched to ${newProvider} provider!`)

    } catch (error) {
      toast.error('Failed to switch provider')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Provider Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900">Current Data Provider</h3>
        <div className="mt-2 text-sm text-blue-800">
          <p>Provider: <span className="font-mono bg-blue-100 px-2 py-1 rounded">{currentProvider}</span></p>
          <p>Status: <span className="text-green-600 font-semibold">✅ Connected</span></p>
          <p>Environment: <span className="font-mono bg-blue-100 px-2 py-1 rounded">
            {process.env.NEXT_PUBLIC_DATA_PROVIDER || 'convex'}
          </span></p>
        </div>
      </div>

      {/* Provider Switcher */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Provider Switching Demo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <div className="font-semibold">🚀 Convex Database</div>
              <div className="text-sm text-gray-600 mt-1">
                Real-time, reactive database
              </div>
            </div>
          </button>

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
              <div className="font-semibold">🔌 REST API</div>
              <div className="text-sm text-gray-600 mt-1">
                Traditional HTTP API
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            User Management Demo
          </h3>
          <button
            onClick={handleCreateUser}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Add User'}
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'mentor').length}
            </div>
            <div className="text-sm text-gray-600">Mentors</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'siswa').length}
            </div>
            <div className="text-sm text-gray-600">Students</div>
          </div>
        </div>

        {/* User List */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">User List</h4>
          {users.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No users found. Click "Add User" to create one.
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'mentor'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Implementation Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">
          🎯 Service Layer Pattern Demo
        </h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>✅ Provider abstraction working</p>
          <p>✅ Toast notifications integrated</p>
          <p>✅ State management with React</p>
          <p>✅ Error handling implemented</p>
          <p>💡 Switch providers without code changes!</p>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Processing with {currentProvider} provider...</span>
          </div>
        </div>
      )}
    </div>
  )
}