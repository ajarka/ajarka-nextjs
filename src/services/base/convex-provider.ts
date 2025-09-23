'use client'

import { useQuery, useMutation } from 'convex/react'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../convex/_generated/api'
import { DataProvider, QueryOptions, MutationOptions } from './data-provider'

/**
 * Convex Implementation of Data Provider
 * Menggunakan Convex hooks dan functions
 */
export class ConvexProvider implements DataProvider {
  private static httpClient: ConvexHttpClient | null = null

  private getHttpClient(): ConvexHttpClient {
    if (!ConvexProvider.httpClient) {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_SITE_URL
      if (!convexUrl) {
        throw new Error('NEXT_PUBLIC_CONVEX_URL or NEXT_PUBLIC_CONVEX_SITE_URL must be set')
      }
      ConvexProvider.httpClient = new ConvexHttpClient(convexUrl)
    }
    return ConvexProvider.httpClient
  }
  useQuery<T>(operation: string, params?: any, options?: QueryOptions): T | undefined {
    const [namespace, method] = operation.split('.')
    const convexFunction = (api as any)[namespace]?.[method]

    if (!convexFunction) {
      console.warn(`Convex function not found: ${operation}`)
      return undefined
    }

    return useQuery(convexFunction, params) as T | undefined
  }

  useMutation<T>(operation: string, options?: MutationOptions) {
    const [namespace, method] = operation.split('.')
    const convexFunction = (api as any)[namespace]?.[method]

    if (!convexFunction) {
      throw new Error(`Convex mutation not found: ${operation}`)
    }

    const mutation = useMutation(convexFunction)

    return async (params?: any): Promise<T> => {
      try {
        options?.onMutate?.(params)
        const result = await mutation(params)
        options?.onSuccess?.(result)
        return result
      } catch (error) {
        options?.onError?.(error as Error)
        throw error
      }
    }
  }

  async query<T>(operation: string, params?: any): Promise<T> {
    const client = this.getHttpClient()
    const [namespace, method] = operation.split(':')
    const convexFunction = (api as any)[namespace]?.[method]

    if (!convexFunction) {
      throw new Error(`Convex function not found: ${operation}`)
    }

    return await client.query(convexFunction, params || {})
  }

  async mutate<T>(operation: string, params?: any): Promise<T> {
    const client = this.getHttpClient()
    const [namespace, method] = operation.split(':')
    const convexFunction = (api as any)[namespace]?.[method]

    if (!convexFunction) {
      throw new Error(`Convex function not found: ${operation}`)
    }

    return await client.mutation(convexFunction, params || {})
  }
}