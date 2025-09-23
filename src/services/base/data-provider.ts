/**
 * Data Provider Interface for Service Layer Pattern
 * Abstraction untuk switching antara Convex dan REST API
 */

export interface DataProvider {
  // Query operations (GET)
  useQuery<T>(operation: string, params?: any): T | undefined

  // Mutation operations (POST, PUT, DELETE)
  useMutation<T>(operation: string): (params?: any) => Promise<T>

  // Direct query (for server-side or non-hook usage)
  query<T>(operation: string, params?: any): Promise<T>

  // Direct mutation (for server-side or non-hook usage)
  mutate<T>(operation: string, params?: any): Promise<T>
}

export interface QueryOptions {
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  staleTime?: number
}

export interface MutationOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  onMutate?: (variables: any) => void
}