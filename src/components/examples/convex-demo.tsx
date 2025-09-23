'use client'

import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { toast } from 'react-hot-toast'

/**
 * Real Convex Demo Component
 * Demonstrates actual Convex database integration
 */
export function ConvexDemo() {
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<'mentor' | 'siswa'>('siswa')

  // Real Convex Queries
  const users = useQuery(api.users.getAll)
  const mentors = useQuery(api.users.getMentors)
  const students = useQuery(api.users.getStudents)

  // Real Convex Mutations
  const createUser = useMutation(api.users.create)
  const deleteUser = useMutation(api.users.remove)

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.error('Name and email are required')
      return
    }

    if (!newUserEmail.includes('@')) {
      toast.error('Please enter a valid email')
      return
    }

    try {
      await createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        role: newUserRole,
        emailVerified: false,
      })

      toast.success(`User created successfully!`)

      // Reset form
      setNewUserName('')
      setNewUserEmail('')
      setNewUserRole('siswa')
    } catch (error) {
      console.error('Create user error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await deleteUser({ id: userId as any })
      toast.success('User deleted successfully!')
    } catch (error) {
      console.error('Delete user error:', error)
      toast.error('Failed to delete user')
    }
  }

  return (
    <div className="space-y-6">
      {/* Convex Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900">🚀 Convex Database Status</h3>
        <div className="mt-2 text-sm text-green-800">
          <p>Connection: <span className="font-semibold">✅ Connected to {process.env.NEXT_PUBLIC_CONVEX_URL}</span></p>
          <p>Real-time: <span className="font-semibold">✅ Active WebSocket</span></p>
          <p>Data Loading: <span className="font-semibold">{users === undefined ? '⏳ Loading...' : '✅ Ready'}</span></p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900">{users?.length ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Mentors</h3>
          <p className="text-2xl font-bold text-blue-600">{mentors?.length ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Students</h3>
          <p className="text-2xl font-bold text-green-600">{students?.length ?? 0}</p>
        </div>
      </div>

      {/* Create User Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Create New User
        </h3>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter user name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter user email"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as 'mentor' | 'siswa')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="siswa">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create User
          </button>
        </form>
      </div>

      {/* User List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          User List (Real-time from Convex)
        </h3>

        {users === undefined ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading users from Convex...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No users found. Create your first user above!
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'mentor'
                      ? 'bg-blue-100 text-blue-800'
                      : user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                  {user.emailVerified && (
                    <span className="text-green-500 text-sm">✅ Verified</span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Demo */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">
          🔴 Real-time Demo
        </h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>✅ Open this page in multiple browser tabs</p>
          <p>✅ Create/delete users in one tab</p>
          <p>✅ Watch changes appear instantly in other tabs</p>
          <p>✅ No refresh needed - powered by Convex WebSocket!</p>
        </div>
      </div>
    </div>
  )
}