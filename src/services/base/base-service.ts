'use client'

import { ConvexProvider } from './convex-provider'
import { RestProvider } from './rest-provider'
import { DataProvider, QueryOptions, MutationOptions } from './data-provider'

/**
 * Base Service Class
 * Abstract class untuk semua services dengan provider abstraction
 */
export abstract class BaseService {
  private static _provider: DataProvider | null = null

  // Get current provider based on environment
  protected static get provider(): DataProvider {
    if (!this._provider) {
      const providerType = process.env.NEXT_PUBLIC_DATA_PROVIDER || 'convex'

      switch (providerType) {
        case 'rest':
          this._provider = new RestProvider()
          break
        case 'convex':
        default:
          this._provider = new ConvexProvider()
          break
      }
    }

    return this._provider
  }

  // Method untuk manually set provider (useful untuk testing)
  static setProvider(provider: DataProvider) {
    this._provider = provider
  }

  // Query helper methods
  protected static useQuery<T>(
    operation: string,
    params?: any,
    options?: QueryOptions
  ): T | undefined {
    return this.provider.useQuery<T>(operation, params, options)
  }

  protected static useMutation<T>(
    operation: string,
    options?: MutationOptions
  ) {
    return this.provider.useMutation<T>(operation, options)
  }

  // Direct query/mutation methods (for server-side usage)
  protected static async query<T>(operation: string, params?: any): Promise<T> {
    return this.provider.query<T>(operation, params)
  }

  protected static async mutate<T>(operation: string, params?: any): Promise<T> {
    return this.provider.mutate<T>(operation, params)
  }

  // Utility methods
  protected static getCurrentProvider(): string {
    return process.env.NEXT_PUBLIC_DATA_PROVIDER || 'convex'
  }

  protected static isConvexProvider(): boolean {
    return this.getCurrentProvider() === 'convex'
  }

  protected static isRestProvider(): boolean {
    return this.getCurrentProvider() === 'rest'
  }
}