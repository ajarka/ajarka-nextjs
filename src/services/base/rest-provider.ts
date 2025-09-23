'use client'

import { useQuery as useReactQuery, useMutation as useReactMutation, useQueryClient } from '@tanstack/react-query'
import { DataProvider, QueryOptions, MutationOptions } from './data-provider'

/**
 * REST API Implementation of Data Provider
 * Menggunakan React Query untuk state management
 * Contoh implementasi untuk future migration ke backend tradisional
 */
export class RestProvider implements DataProvider {
  private baseUrl: string

  constructor(baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') {
    this.baseUrl = baseUrl
  }

  useQuery<T>(operation: string, params?: any, options?: QueryOptions): T | undefined {
    const url = this.buildUrl(operation, params)
    const queryKey = [operation, params]

    const { data } = useReactQuery({
      queryKey,
      queryFn: () => this.fetchData<T>(url),
      enabled: options?.enabled ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    })

    return data
  }

  useMutation<T>(operation: string, options?: MutationOptions) {
    const queryClient = useQueryClient()

    const mutation = useReactMutation({
      mutationFn: (params: any) => this.mutateFn<T>(operation, params),
      onSuccess: (data) => {
        // Invalidate related queries
        this.invalidateQueries(operation, queryClient)
        options?.onSuccess?.(data)
      },
      onError: options?.onError,
      onMutate: options?.onMutate,
    })

    return mutation.mutateAsync
  }

  async query<T>(operation: string, params?: any): Promise<T> {
    const url = this.buildUrl(operation, params)
    return this.fetchData<T>(url)
  }

  async mutate<T>(operation: string, params?: any): Promise<T> {
    return this.mutateFn<T>(operation, params)
  }

  // Private helper methods
  private buildUrl(operation: string, params?: any): string {
    const [namespace, method] = operation.split('.')
    let endpoint = `${this.baseUrl}/${this.namespaceToEndpoint(namespace)}`

    // Handle different methods
    switch (method) {
      case 'getById':
        endpoint += `/${params?.id}`
        break
      case 'getAll':
      case 'list':
        break
      default:
        break
    }

    // Add query parameters for GET requests
    if (params && Object.keys(params).length > 0 && !method.includes('ById')) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      if (searchParams.toString()) {
        endpoint += `?${searchParams.toString()}`
      }
    }

    return endpoint
  }

  private async fetchData<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  private async mutateFn<T>(operation: string, params?: any): Promise<T> {
    const [namespace, method] = operation.split('.')
    const endpoint = `${this.baseUrl}/${this.namespaceToEndpoint(namespace)}`

    let url = endpoint
    let httpMethod = 'POST'
    let body = params

    // Determine HTTP method and URL based on operation
    switch (method) {
      case 'create':
        httpMethod = 'POST'
        break
      case 'update':
        httpMethod = 'PUT'
        url += `/${params?.id}`
        break
      case 'patch':
        httpMethod = 'PATCH'
        url += `/${params?.id}`
        break
      case 'delete':
      case 'remove':
        httpMethod = 'DELETE'
        url += `/${params?.id}`
        body = undefined
        break
      default:
        httpMethod = 'POST'
    }

    const response = await fetch(url, {
      method: httpMethod,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  private namespaceToEndpoint(namespace: string): string {
    // Convert namespace to REST endpoint
    const mapping: Record<string, string> = {
      users: 'users',
      courses: 'courses',
      bookings: 'bookings',
      payments: 'payment_transactions',
      bundlePackages: 'bundle_packages',
      learningMaterials: 'learning_materials',
      notifications: 'notifications',
    }

    return mapping[namespace] || namespace
  }

  private invalidateQueries(operation: string, queryClient: any) {
    const [namespace] = operation.split('.')
    // Invalidate all queries for this namespace
    queryClient.invalidateQueries({ queryKey: [namespace] })
  }
}